"use client";

import { useState } from "react";

export default function NewCoursePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    duration: "",
    price: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
      }),
    });

    const data = await res.json();

    alert(data.message);

    if (res.ok) {
      setForm({
        title: "",
        description: "",
        level: "",
        duration: "",
        price: "",
      });
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <h1>Create New Course</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <input
          placeholder="Course Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <textarea
          placeholder="Course Description"
          rows={5}
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <input
          placeholder="Beginner / Intermediate / Advanced"
          value={form.level}
          onChange={(e) =>
            setForm({
              ...form,
              level: e.target.value,
            })
          }
        />

        <input
          placeholder="12 Weeks"
          value={form.duration}
          onChange={(e) =>
            setForm({
              ...form,
              duration: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
        />

        <button type="submit">
          Create Course
        </button>
      </form>
    </div>
  );
}