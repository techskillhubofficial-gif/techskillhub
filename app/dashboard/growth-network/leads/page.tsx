import { redirect } from "next/navigation";

import {
  canManageNetwork,
  getTgnContext,
} from "@/lib/tgn/authorization";
import GrowthNetworkLeadsClient from "./GrowthNetworkLeadsClient";

export const dynamic = "force-dynamic";

export default async function GrowthNetworkLeadsPage() {
  const context = await getTgnContext();

  if (!context) {
    redirect("/login");
  }

  if (!canManageNetwork(context)) {
    redirect("/growth-network/portal");
  }

  const role =
    context.access === "FOUNDER"
      ? "FOUNDER"
      : "NETWORK_MANAGER";

  return <GrowthNetworkLeadsClient role={role} />;
}
