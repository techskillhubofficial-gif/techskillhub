import crypto from "node:crypto";

type UploadInput = {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: string;
};

export async function uploadToCloudinary({
  buffer,
  fileName,
  mimeType,
  folder,
}: UploadInput) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const baseName =
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "document";

  const publicId = `${baseName}-${timestamp}`;

  const signatureString =
    `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}` +
    apiSecret;

  const signature = crypto
    .createHash("sha1")
    .update(signatureString)
    .digest("hex");

  /*
   * Create a real ArrayBuffer copy rather than passing Node's Buffer
   * directly to Blob. This avoids the ArrayBufferLike/BlobPart type
   * incompatibility in the current TypeScript/Node type definitions.
   */
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);

  const formData = new FormData();

  formData.append(
    "file",
    new Blob([arrayBuffer], {
      type: mimeType,
    }),
    fileName,
  );

  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Cloudinary upload error:", result);

    throw new Error(
      result?.error?.message ||
        "Cloudinary upload failed.",
    );
  }

  if (
    !result ||
    typeof result.secure_url !== "string" ||
    typeof result.public_id !== "string"
  ) {
    throw new Error(
      "Cloudinary returned an invalid upload response.",
    );
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType:
      typeof result.resource_type === "string"
        ? result.resource_type
        : "auto",
  };
}
