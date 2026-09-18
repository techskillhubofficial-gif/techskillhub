"use client";

import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  courseId: string;
  initialLessons: Lesson[];
};

type LessonForm = {
  title: string;
  description: string;
  videoUrl: string;
  order: string;
};

const emptyForm: LessonForm = {
  title: "",
  description: "",
  videoUrl: "",
  order: "",
};

export default function CourseLessonsManager({
  courseId,
  initialLessons,
}: Props) {
  const [lessons, setLessons] =
    useState<Lesson[]>(initialLessons);

  const [form, setForm] =
    useState<LessonForm>(emptyForm);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function openCreate() {
    setError("");
    setSuccess("");
    setForm({
      ...emptyForm,
      order: String(lessons.length + 1),
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(lesson: Lesson) {
    setError("");
    setSuccess("");
    setForm({
      title: lesson.title,
      description: lesson.description ?? "",
      videoUrl: lesson.videoUrl ?? "",
      order: String(lesson.order),
    });
    setEditingId(lesson.id);
    setShowForm(true);
  }

  async function saveLesson(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        videoUrl:
          form.videoUrl.trim() || null,
        order:
          Number(form.order) || lessons.length + 1,
      };

      if (!payload.title) {
        setError("Lesson title is required.");
        setSaving(false);
        return;
      }

      const endpoint = editingId
        ? `/api/courses/${courseId}/lessons/${editingId}`
        : `/api/courses/${courseId}/lessons`;

      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save the lesson."
        );
      }

      if (editingId) {
        setLessons((current) =>
          current
            .map((lesson) =>
              lesson.id === editingId
                ? data.lesson
                : lesson
            )
            .sort((a: Lesson, b: Lesson) =>
              a.order - b.order
            )
        );

        setSuccess(
          "Lesson updated successfully."
        );
      } else {
        setLessons((current) =>
          [...current, data.lesson].sort(
            (a: Lesson, b: Lesson) =>
              a.order - b.order
          )
        );

        setSuccess(
          "Lesson created successfully."
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the lesson."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteLesson(lesson: Lesson) {
    const confirmed = window.confirm(
      `Delete "${lesson.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(lesson.id);

    try {
      const response = await fetch(
        `/api/courses/${courseId}/lessons/${lesson.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to delete the lesson."
        );
      }

      setLessons((current) =>
        current.filter(
          (item) => item.id !== lesson.id
        )
      );

      setSuccess(
        "Lesson deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the lesson."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "18px",
        padding: "28px",
        boxShadow:
          "0 8px 30px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            Lessons
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Build and manage the learning content for this course.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          style={{
            border: 0,
            borderRadius: "10px",
            background: "#2563eb",
            color: "#ffffff",
            padding: "11px 18px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + Add Lesson
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "10px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={saveLesson}
          style={{
            marginBottom: "24px",
            padding: "20px",
            borderRadius: "14px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            <label
              style={{
                display: "grid",
                gap: "7px",
              }}
            >
              <span
                style={{
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Lesson Title
              </span>

              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="e.g. Introduction to React"
                maxLength={200}
                required
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  padding: "11px 12px",
                  background: "#ffffff",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "7px",
              }}
            >
              <span
                style={{
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Description
              </span>

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value,
                  }))
                }
                placeholder="Describe what students will learn."
                maxLength={5000}
                rows={4}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  resize: "vertical",
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  padding: "11px 12px",
                  background: "#ffffff",
                  color: "#0f172a",
                  outline: "none",
                }}
              />
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) 140px",
                gap: "16px",
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  Video URL
                </span>

                <input
                  value={form.videoUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      videoUrl:
                        event.target.value,
                    }))
                  }
                  placeholder="https://..."
                  maxLength={2000}
                  type="url"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "11px 12px",
                    background: "#ffffff",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: "7px",
                }}
              >
                <span
                  style={{
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  Order
                </span>

                <input
                  value={form.order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      order: event.target.value,
                    }))
                  }
                  min={1}
                  step={1}
                  type="number"
                  required
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #cbd5e1",
                    borderRadius: "9px",
                    padding: "11px 12px",
                    background: "#ffffff",
                    color: "#0f172a",
                    outline: "none",
                  }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: "9px",
                  background: "#ffffff",
                  color: "#334155",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  border: 0,
                  borderRadius: "9px",
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Lesson"
                    : "Create Lesson"}
              </button>
            </div>
          </div>
        </form>
      )}

      {lessons.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            borderRadius: "14px",
            border: "1px dashed #cbd5e1",
            textAlign: "center",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: "32px",
              marginBottom: "10px",
            }}
          >
            📚
          </div>

          <h3
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            No lessons yet
          </h3>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Add the first lesson to start building this course.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 800,
                    fontSize: "14px",
                  }}
                >
                  {lesson.order}
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#0f172a",
                      fontSize: "15px",
                      fontWeight: 800,
                    }}
                  >
                    {lesson.title}
                  </h3>

                  {lesson.description && (
                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#64748b",
                        fontSize: "13px",
                        lineHeight: 1.5,
                      }}
                    >
                      {lesson.description}
                    </p>
                  )}

                  {lesson.videoUrl && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#2563eb",
                        fontSize: "12px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "600px",
                      }}
                    >
                      Video content configured
                    </p>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => openEdit(lesson)}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "#ffffff",
                    color: "#334155",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteLesson(lesson)
                  }
                  disabled={
                    deletingId === lesson.id
                  }
                  style={{
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    background: "#fffafa",
                    color: "#b91c1c",
                    padding: "8px 12px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor:
                      deletingId === lesson.id
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      deletingId === lesson.id
                        ? 0.6
                        : 1,
                  }}
                >
                  {deletingId === lesson.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
