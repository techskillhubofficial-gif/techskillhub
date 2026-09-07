const assignments = [
    {
      id: 1,
      title: "Build a Responsive Landing Page",
      course: "Full Stack Web Development",
      dueDate: "5 Sep 2026",
      status: "Pending",
    },
    {
      id: 2,
      title: "Implement Binary Search",
      course: "Data Structures & Algorithms",
      dueDate: "8 Sep 2026",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Design URL Shortener Architecture",
      course: "System Design",
      dueDate: "15 Sep 2026",
      status: "Not Started",
    },
  ];
  
  export default function AssignmentsPage() {
    return (
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
          📝 Assignments
        </h1>
  
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          Complete your pending assignments.
        </p>
  
        <div style={{ display: "grid", gap: "20px" }}>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              style={{
                background: "#ffffff",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2>{assignment.title}</h2>
  
              <p>
                <strong>Course:</strong> {assignment.course}
              </p>
  
              <p>
                <strong>Due Date:</strong> {assignment.dueDate}
              </p>
  
              <p>
                <strong>Status:</strong> {assignment.status}
              </p>
  
              <button
                style={{
                  marginTop: "16px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Open Assignment
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }