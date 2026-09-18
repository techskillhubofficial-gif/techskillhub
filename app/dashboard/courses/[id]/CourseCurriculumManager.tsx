"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  BookOpen,
  CalendarDays,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
  Plus,
  Trash2,
  Video,
  X,
} from "lucide-react";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  order: number;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string | null;
  type: "THEORY" | "PRACTICAL" | "PROJECT" | "CASE_STUDY";
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  moduleId: string | null;
  scheduledAt: string | null;
  endsAt: string | null;
  meetingUrl: string | null;
  presentationUrl: string | null;
  studyMaterialUrl: string | null;
  instructorNotes: string | null;
  resources: Resource[];
  assignments: Assignment[];
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  _count: {
    lessons: number;
    assignments: number;
  };
};

type AssignmentRecord = {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  type: "THEORY" | "PRACTICAL" | "PROJECT" | "CASE_STUDY";
  module: {
    id: string;
    title: string;
    order: number;
  } | null;
  lesson: {
    id: string;
    title: string;
    order: number;
  } | null;
};

const emptyLecture = {
  title: "",
  description: "",
  moduleId: "",
  order: "",
  scheduledAt: "",
  endsAt: "",
  meetingUrl: "",
  presentationUrl: "",
  studyMaterialUrl: "",
  instructorNotes: "",
};

type AssignmentType =
  | "THEORY"
  | "PRACTICAL"
  | "PROJECT"
  | "CASE_STUDY";

type AssignmentForm = {
  title: string;
  description: string;
  type: AssignmentType;
  moduleId: string;
  lessonId: string;
  dueDate: string;
};

const emptyAssignment: AssignmentForm = {
  title: "",
  description: "",
  type: "PRACTICAL",
  moduleId: "",
  lessonId: "",
  dueDate: "",
};

export default function CourseCurriculumManager({
  courseId,
}: {
  courseId: string;
}) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<
    AssignmentRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [expanded, setExpanded] = useState<
    Record<string, boolean>
  >({});

  const [showModuleForm, setShowModuleForm] =
    useState(false);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    order: "",
  });

  const [editingModule, setEditingModule] =
    useState<string | null>(null);

  const [showLectureForm, setShowLectureForm] =
    useState(false);

  const [editingLecture, setEditingLecture] =
    useState<string | null>(null);

  const [lectureForm, setLectureForm] =
    useState(emptyLecture);

  const [showAssignmentForm, setShowAssignmentForm] =
    useState(false);

  const [editingAssignment, setEditingAssignment] =
    useState<string | null>(null);

  const [assignmentForm, setAssignmentForm] =
    useState<AssignmentForm>(emptyAssignment);

  const [resourceLecture, setResourceLecture] =
    useState<string | null>(null);

  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    url: "",
    type: "LINK",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [modulesResponse, lessonsResponse, assignmentsResponse] =
        await Promise.all([
          fetch(
            `/api/courses/${courseId}/modules`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/courses/${courseId}/lessons`,
            {
              cache: "no-store",
            }
          ),
          fetch(
            `/api/courses/${courseId}/assignments`,
            {
              cache: "no-store",
            }
          ),
        ]);

      const [
        modulesData,
        lessonsData,
        assignmentsData,
      ] = await Promise.all([
        modulesResponse.json(),
        lessonsResponse.json(),
        assignmentsResponse.json(),
      ]);

      if (
        !modulesResponse.ok ||
        !modulesData.success
      ) {
        throw new Error(
          modulesData.message ||
            "Unable to load modules."
        );
      }

      if (
        !lessonsResponse.ok ||
        !lessonsData.success
      ) {
        throw new Error(
          lessonsData.message ||
            "Unable to load lectures."
        );
      }

      if (
        !assignmentsResponse.ok ||
        !assignmentsData.success
      ) {
        throw new Error(
          assignmentsData.message ||
            "Unable to load assignments."
        );
      }

      setModules(modulesData.modules || []);
      setLessons(lessonsData.lessons || []);
      setAssignments(
        assignmentsData.assignments || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load curriculum."
      );
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(
    () =>
      modules.map((module) => ({
        ...module,
        lessons: lessons.filter(
          (lesson) =>
            lesson.moduleId === module.id
        ),
      })),
    [modules, lessons]
  );

  const orphanLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          !lesson.moduleId ||
          !modules.some(
            (module) =>
              module.id === lesson.moduleId
          )
      ),
    [lessons, modules]
  );

  async function request(
    url: string,
    options: RequestInit = {}
  ) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Request failed."
      );
    }

    return data;
  }

  async function saveModule(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const url = editingModule
        ? `/api/courses/${courseId}/modules/${editingModule}`
        : `/api/courses/${courseId}/modules`;

      await request(url, {
        method: editingModule
          ? "PATCH"
          : "POST",
        body: JSON.stringify(moduleForm),
      });

      setModuleForm({
        title: "",
        description: "",
        order: "",
      });

      setEditingModule(null);
      setShowModuleForm(false);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save module."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteModule(id: string) {
    if (
      !confirm(
        "Delete this empty module? Modules containing lectures or assignments cannot be deleted."
      )
    ) {
      return;
    }

    try {
      await request(
        `/api/courses/${courseId}/modules/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete module."
      );
    }
  }

  async function saveLecture(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...lectureForm,
        order: lectureForm.order
          ? Number(lectureForm.order)
          : undefined,
      };

      const url = editingLecture
        ? `/api/courses/${courseId}/lessons/${editingLecture}`
        : `/api/courses/${courseId}/lessons`;

      await request(url, {
        method: editingLecture
          ? "PATCH"
          : "POST",
        body: JSON.stringify(payload),
      });

      setLectureForm(emptyLecture);
      setEditingLecture(null);
      setShowLectureForm(false);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save lecture."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteLecture(id: string) {
    if (
      !confirm(
        "Delete this lecture? Its learning resources will also be removed."
      )
    ) {
      return;
    }

    try {
      await request(
        `/api/courses/${courseId}/lessons/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete lecture."
      );
    }
  }

  async function saveAssignment(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const url = editingAssignment
        ? `/api/courses/${courseId}/assignments/${editingAssignment}`
        : `/api/courses/${courseId}/assignments`;

      await request(url, {
        method: editingAssignment
          ? "PATCH"
          : "POST",
        body: JSON.stringify(
          assignmentForm
        ),
      });

      setAssignmentForm(emptyAssignment);
      setEditingAssignment(null);
      setShowAssignmentForm(false);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save assignment."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAssignment(id: string) {
    if (!confirm("Delete this assignment?")) {
      return;
    }

    try {
      await request(
        `/api/courses/${courseId}/assignments/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete assignment."
      );
    }
  }

  async function addResource(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!resourceLecture) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await request(
        `/api/courses/${courseId}/lessons/${resourceLecture}/resources`,
        {
          method: "POST",
          body: JSON.stringify(
            resourceForm
          ),
        }
      );

      setResourceForm({
        title: "",
        description: "",
        url: "",
        type: "LINK",
      });

      setResourceLecture(null);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to add resource."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteResource(
    lessonId: string,
    resourceId: string
  ) {
    if (!confirm("Remove this resource?")) {
      return;
    }

    try {
      await request(
        `/api/courses/${courseId}/lessons/${lessonId}/resources/${resourceId}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete resource."
      );
    }
  }

  function editModule(module: Module) {
    setEditingModule(module.id);

    setModuleForm({
      title: module.title,
      description:
        module.description || "",
      order: String(module.order),
    });

    setShowModuleForm(true);
  }

  function editLecture(lesson: Lesson) {
    setEditingLecture(lesson.id);

    setLectureForm({
      title: lesson.title,
      description:
        lesson.description || "",
      moduleId: lesson.moduleId || "",
      order: String(lesson.order),
      scheduledAt: toLocalInput(
        lesson.scheduledAt
      ),
      endsAt: toLocalInput(
        lesson.endsAt
      ),
      meetingUrl:
        lesson.meetingUrl || "",
      presentationUrl:
        lesson.presentationUrl || "",
      studyMaterialUrl:
        lesson.studyMaterialUrl || "",
      instructorNotes:
        lesson.instructorNotes || "",
    });

    setShowLectureForm(true);
  }

  function editAssignment(
    assignment: AssignmentRecord
  ) {
    setEditingAssignment(assignment.id);

    setAssignmentForm({
      title: assignment.title,
      description:
        assignment.description,
      type:
        assignment.type || "PRACTICAL",
      moduleId:
        assignment.module?.id || "",
      lessonId:
        assignment.lesson?.id || "",
      dueDate: toLocalInput(
        assignment.dueDate
      ),
    });

    setShowAssignmentForm(true);
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-slate-950">
            Curriculum
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Build the learning system: modules,
            live lectures, resources and
            assessments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingModule(null);
              setModuleForm({
                title: "",
                description: "",
                order: "",
              });
              setShowModuleForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Module
          </button>

          <button
            onClick={() => {
              setEditingAssignment(null);
              setAssignmentForm(
                emptyAssignment
              );
              setShowAssignmentForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={16} />
            Assignment
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showModuleForm && (
        <FormCard
          title={
            editingModule
              ? "Edit Module"
              : "Add Module"
          }
          onClose={() =>
            setShowModuleForm(false)
          }
        >
          <form
            onSubmit={saveModule}
            className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto]"
          >
            <input
              required
              value={moduleForm.title}
              onChange={(event) =>
                setModuleForm({
                  ...moduleForm,
                  title:
                    event.target.value,
                })
              }
              placeholder="Module title"
              className="field"
            />

            <input
              value={
                moduleForm.description
              }
              onChange={(event) =>
                setModuleForm({
                  ...moduleForm,
                  description:
                    event.target.value,
                })
              }
              placeholder="Short description"
              className="field"
            />

            <input
              type="number"
              min="1"
              value={moduleForm.order}
              onChange={(event) =>
                setModuleForm({
                  ...moduleForm,
                  order:
                    event.target.value,
                })
              }
              placeholder="Order"
              className="field"
            />

            <button
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving…"
                : editingModule
                ? "Update"
                : "Create"}
            </button>
          </form>
        </FormCard>
      )}

      <div className="space-y-3">
        {grouped.length === 0 && (
          <Empty
            title="No curriculum modules yet"
            text="Start by creating the first module for this course."
          />
        )}

        {grouped.map((module) => {
          const open =
            expanded[module.id] ??
            true;

          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-2xl border border-slate-200"
            >
              <div className="flex flex-col gap-3 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() =>
                    setExpanded({
                      ...expanded,
                      [module.id]: !open,
                    })
                  }
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  {open ? (
                    <ChevronDown
                      size={18}
                      className="shrink-0 text-blue-600"
                    />
                  ) : (
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-slate-400"
                    />
                  )}

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                    {String(
                      module.order
                    ).padStart(2, "0")}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate font-bold text-slate-900">
                      {module.title}
                    </span>

                    <span className="block truncate text-xs text-slate-500">
                      {module.description ||
                        "No module description"}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-2 pl-11 sm:pl-0">
                  <span className="text-xs text-slate-500">
                    {module.lessons.length} lecture
                    {module.lessons.length ===
                    1
                      ? ""
                      : "s"}
                  </span>

                  <button
                    onClick={() => {
                      setEditingLecture(
                        null
                      );

                      setLectureForm({
                        ...emptyLecture,
                        moduleId:
                          module.id,
                      });

                      setShowLectureForm(
                        true
                      );
                    }}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    <Plus
                      size={13}
                      className="mr-1 inline"
                    />
                    Lecture
                  </button>

                  <button
                    onClick={() =>
                      editModule(module)
                    }
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-white"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() =>
                      deleteModule(
                        module.id
                      )
                    }
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {open && (
                <div className="divide-y divide-slate-100">
                  {module.lessons
                    .length === 0 && (
                    <div className="p-5 text-sm text-slate-400">
                      No lectures added to
                      this module yet.
                    </div>
                  )}

                  {module.lessons.map(
                    (lesson, index) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        index={index}
                        onAttendance={() => {
                          window.location.href =
                            `/dashboard/courses/${courseId}/lessons/${lesson.id}/attendance`;
                        }}
                        onEdit={() =>
                          editLecture(
                            lesson
                          )
                        }
                        onDelete={() =>
                          deleteLecture(
                            lesson.id
                          )
                        }
                        onResource={() => {
                          setResourceLecture(
                            lesson.id
                          );

                          setResourceForm({
                            title: "",
                            description:
                              "",
                            url: "",
                            type: "LINK",
                          });
                        }}
                        onDeleteResource={(
                          id
                        ) =>
                          deleteResource(
                            lesson.id,
                            id
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orphanLessons.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Legacy lectures need
            organization
          </p>

          <p className="mt-1 text-xs text-amber-700">
            {orphanLessons.length} existing
            lecture
            {orphanLessons.length ===
            1
              ? " is"
              : "s are"}{" "}
            not assigned to a module.
            We preserve them rather
            than deleting data.
          </p>
        </div>
      )}

      {showLectureForm && (
        <Modal
          title={
            editingLecture
              ? "Edit Lecture"
              : "Add Lecture"
          }
          onClose={() =>
            setShowLectureForm(false)
          }
        >
          <form
            onSubmit={saveLecture}
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 label">
                Lecture title

                <input
                  required
                  value={lectureForm.title}
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      title:
                        event.target.value,
                    })
                  }
                  className="field"
                  placeholder="e.g. Introduction & Course Roadmap"
                />
              </label>

              <label className="sm:col-span-2 label">
                Description

                <textarea
                  value={
                    lectureForm.description
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      description:
                        event.target.value,
                    })
                  }
                  className="field min-h-24"
                  placeholder="What students will learn in this lecture"
                />
              </label>

              <label className="label">
                Module

                <select
                  required
                  value={
                    lectureForm.moduleId
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      moduleId:
                        event.target.value,
                    })
                  }
                  className="field"
                >
                  <option value="">
                    Select module
                  </option>

                  {modules.map(
                    (module) => (
                      <option
                        key={module.id}
                        value={
                          module.id
                        }
                      >
                        {String(
                          module.order
                        ).padStart(
                          2,
                          "0"
                        )}{" "}
                        ·{" "}
                        {module.title}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="label">
                Lecture order

                <input
                  type="number"
                  min="1"
                  value={
                    lectureForm.order
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      order:
                        event.target.value,
                    })
                  }
                  className="field"
                  placeholder="Auto"
                />
              </label>

              <label className="label">
                Start date & time

                <input
                  type="datetime-local"
                  value={
                    lectureForm.scheduledAt
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      scheduledAt:
                        event.target.value,
                    })
                  }
                  className="field"
                />
              </label>

              <label className="label">
                End date & time

                <input
                  type="datetime-local"
                  value={
                    lectureForm.endsAt
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      endsAt:
                        event.target.value,
                    })
                  }
                  className="field"
                />
              </label>

              <label className="sm:col-span-2 label">
                Google Meet URL

                <input
                  type="url"
                  value={
                    lectureForm.meetingUrl
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      meetingUrl:
                        event.target.value,
                    })
                  }
                  className="field"
                  placeholder="https://meet.google.com/..."
                />
              </label>

              <label className="label">
                Presentation / PPT URL

                <input
                  type="url"
                  value={
                    lectureForm.presentationUrl
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      presentationUrl:
                        event.target.value,
                    })
                  }
                  className="field"
                  placeholder="Google Slides / PPT link"
                />
              </label>

              <label className="label">
                Study material URL

                <input
                  type="url"
                  value={
                    lectureForm.studyMaterialUrl
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      studyMaterialUrl:
                        event.target.value,
                    })
                  }
                  className="field"
                  placeholder="Drive / PDF / notes link"
                />
              </label>

              <label className="sm:col-span-2 label">
                Instructor notes

                <textarea
                  value={
                    lectureForm.instructorNotes
                  }
                  onChange={(event) =>
                    setLectureForm({
                      ...lectureForm,
                      instructorNotes:
                        event.target.value,
                    })
                  }
                  className="field min-h-28"
                  placeholder="Private teaching notes for the instructor"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() =>
                  setShowLectureForm(
                    false
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {saving
                  ? "Saving…"
                  : editingLecture
                  ? "Update Lecture"
                  : "Create Lecture"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {resourceLecture && (
        <Modal
          title="Add Learning Resource"
          onClose={() =>
            setResourceLecture(null)
          }
        >
          <form
            onSubmit={addResource}
            className="space-y-4"
          >
            <label className="label">
              Resource title

              <input
                required
                value={
                  resourceForm.title
                }
                onChange={(event) =>
                  setResourceForm({
                    ...resourceForm,
                    title:
                      event.target.value,
                  })
                }
                className="field"
                placeholder="e.g. Lecture slides"
              />
            </label>

            <label className="label">
              URL

              <input
                required
                type="url"
                value={
                  resourceForm.url
                }
                onChange={(event) =>
                  setResourceForm({
                    ...resourceForm,
                    url:
                      event.target.value,
                  })
                }
                className="field"
                placeholder="https://..."
              />
            </label>

            <label className="label">
              Type

              <select
                value={
                  resourceForm.type
                }
                onChange={(event) =>
                  setResourceForm({
                    ...resourceForm,
                    type:
                      event.target.value,
                  })
                }
                className="field"
              >
                <option value="LINK">
                  Link
                </option>
                <option value="DOCUMENT">
                  Document
                </option>
                <option value="PRESENTATION">
                  Presentation
                </option>
                <option value="REFERENCE">
                  Reference
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>
            </label>

            <label className="label">
              Description

              <textarea
                value={
                  resourceForm.description
                }
                onChange={(event) =>
                  setResourceForm({
                    ...resourceForm,
                    description:
                      event.target.value,
                  })
                }
                className="field"
              />
            </label>

            <button
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {saving
                ? "Adding…"
                : "Add Resource"}
            </button>
          </form>
        </Modal>
      )}

      <div className="border-t border-slate-100 pt-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-950">
              Assignments
            </p>

            <p className="text-xs text-slate-500">
              Create theory, practical, project or case-study work and optionally attach it to a module or lecture.
            </p>
          </div>
        </div>

        {assignments.length === 0 ? (
          <Empty
            title="No assignments yet"
            text="Create an assignment and link it to the relevant learning content."
          />
        ) : (
          <div className="space-y-2">
            {assignments.map(
              (assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">
                        {assignment.title}
                      </p>

                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {assignment.type === "CASE_STUDY"
                          ? "Case Study"
                          : assignment.type === "PRACTICAL"
                          ? "Practical"
                          : assignment.type === "PROJECT"
                          ? "Project"
                          : "Theory"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {assignment.module
                        ?.title ||
                        "Course-wide"}

                      {assignment.lesson
                        ? ` · ${assignment.lesson.title}`
                        : ""}

                      {assignment.dueDate
                        ? ` · Due ${new Date(
                            assignment.dueDate
                          ).toLocaleDateString(
                            "en-IN"
                          )}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        editAssignment(
                          assignment
                        )
                      }
                      className="rounded-lg border border-slate-200 p-2 text-slate-500"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() =>
                        deleteAssignment(
                          assignment.id
                        )
                      }
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {showAssignmentForm && (
        <Modal
          title={
            editingAssignment
              ? "Edit Assignment"
              : "Create Assignment"
          }
          onClose={() =>
            setShowAssignmentForm(
              false
            )
          }
        >
          <form
            onSubmit={saveAssignment}
            className="space-y-4"
          >
            <label className="label">
              Title

              <input
                required
                value={
                  assignmentForm.title
                }
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    title:
                      event.target.value,
                  })
                }
                className="field"
              />
            </label>

            <label className="label">
              Instructions

              <textarea
                required
                value={
                  assignmentForm.description
                }
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    description:
                      event.target.value,
                  })
                }
                className="field min-h-32"
              />
            </label>

            <label className="label">
              Assignment type

              <select
                value={assignmentForm.type}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    type: event.target.value as AssignmentType,
                  })
                }
                className="field"
              >
                <option value="THEORY">Theory</option>
                <option value="PRACTICAL">Practical</option>
                <option value="PROJECT">Project</option>
                <option value="CASE_STUDY">Case Study</option>
              </select>

              <p className="mt-1 text-xs text-slate-500">
                Choose the kind of learning activity students will complete.
              </p>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="label">
                Module

                <select
                  value={
                    assignmentForm.moduleId
                  }
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      moduleId:
                        event.target.value,
                      lessonId: "",
                    })
                  }
                  className="field"
                >
                  <option value="">
                    No specific module
                  </option>

                  {modules.map(
                    (module) => (
                      <option
                        key={module.id}
                        value={
                          module.id
                        }
                      >
                        {module.title}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="label">
                Lecture

                <select
                  value={
                    assignmentForm.lessonId
                  }
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      lessonId:
                        event.target.value,
                    })
                  }
                  className="field"
                >
                  <option value="">
                    No specific lecture
                  </option>

                  {lessons
                    .filter(
                      (lesson) =>
                        !assignmentForm.moduleId ||
                        lesson.moduleId ===
                          assignmentForm.moduleId
                    )
                    .map((lesson) => (
                      <option
                        key={lesson.id}
                        value={
                          lesson.id
                        }
                      >
                        {lesson.title}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <label className="label">
              Due date & time

              <input
                type="datetime-local"
                value={
                  assignmentForm.dueDate
                }
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    dueDate:
                      event.target.value,
                  })
                }
                className="field"
              />
            </label>

            <button
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              {saving
                ? "Saving…"
                : editingAssignment
                ? "Update Assignment"
                : "Create Assignment"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}

function LessonRow({
  lesson,
  index,
  onAttendance,
  onEdit,
  onDelete,
  onResource,
  onDeleteResource,
}: {
  lesson: Lesson;
  index: number;
  onAttendance: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResource: () => void;
  onDeleteResource: (
    id: string
  ) => void;
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
            {String(
              lesson.order || index + 1
            ).padStart(2, "0")}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {lesson.title}
            </p>

            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {lesson.description ||
                "No lecture description"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {lesson.scheduledAt && (
                <Badge
                  icon={
                    <CalendarDays
                      size={12}
                    />
                  }
                  text={new Date(
                    lesson.scheduledAt
                  ).toLocaleString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                />
              )}

              {lesson.meetingUrl && (
                <Badge
                  icon={
                    <Video size={12} />
                  }
                  text="Google Meet"
                />
              )}

              {lesson.presentationUrl && (
                <Badge
                  icon={
                    <FileText
                      size={12}
                    />
                  }
                  text="Presentation"
                />
              )}

              {lesson.studyMaterialUrl && (
                <Badge
                  icon={
                    <BookOpen
                      size={12}
                    />
                  }
                  text="Study Material"
                />
              )}

              {lesson.resources.length >
                0 && (
                <Badge
                  icon={
                    <Link2
                      size={12}
                    />
                  }
                  text={`${lesson.resources.length} resource${
                    lesson.resources.length ===
                    1
                      ? ""
                      : "s"
                  }`}
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            onClick={onEdit}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-blue-600"
          >
            <Pencil size={14} />
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>

          <button
            onClick={onAttendance}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <CalendarCheck
              size={13}
              className="mr-1 inline"
            />
            Attendance
          </button>

          <button
            onClick={onResource}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Plus
              size={13}
              className="mr-1 inline"
            />
            Resource
          </button>
        </div>
      </div>

      {lesson.resources.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          {lesson.resources.map(
            (resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {resource.title}
                  </p>

                  <p className="truncate text-[11px] text-slate-400">
                    {resource.type}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md p-1.5 text-slate-400 hover:text-blue-600"
                  >
                    <ExternalLink
                      size={13}
                    />
                  </a>

                  <button
                    onClick={() =>
                      onDeleteResource(
                        resource.id
                      )
                    }
                    className="rounded-md p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2
                      size={13}
                    />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

function Badge({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
      {icon}
      {text}
    </span>
  );
}

function Empty({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
      <p className="font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

function FormCard({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">
          {title}
        </p>

        <button onClick={onClose}>
          <X
            size={16}
            className="text-slate-400"
          />
        </button>
      </div>

      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <p className="font-bold text-slate-900">
            {title}
          </p>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function toLocalInput(
  value: string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  const pad = (value: number) =>
    String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
