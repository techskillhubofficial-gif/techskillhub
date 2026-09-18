import {
    BarChart3,
    BookOpen,
    GraduationCap,
    Users,
  } from "lucide-react";
  
  const overviewCards = [
    {
      title: "Students",
      description: "Monitor student activity and enrollment.",
      icon: Users,
    },
    {
      title: "Courses",
      description: "Manage programs and learning content.",
      icon: BookOpen,
    },
    {
      title: "Enrollments",
      description: "Track active and completed enrollments.",
      icon: GraduationCap,
    },
    {
      title: "Analytics",
      description: "Review performance and business metrics.",
      icon: BarChart3,
    },
  ];
  
  export default function OverviewPage() {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Dashboard
          </p>
  
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Overview
          </h1>
  
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Get a clear view of your TechSkillHub operations,
            students, courses, and business performance.
          </p>
        </div>
  
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;
  
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
  
                <h2 className="mt-5 text-sm font-semibold text-slate-900">
                  {card.title}
                </h2>
  
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
  
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Workspace overview
            </h2>
  
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Your dashboard modules are ready to connect with
              live platform data.
            </p>
          </div>
        </section>
      </div>
    );
  }