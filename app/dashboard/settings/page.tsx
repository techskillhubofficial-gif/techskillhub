import {
    Bell,
    Database,
    LockKeyhole,
    Settings2,
  } from "lucide-react";
  
  const settingsSections = [
    {
      title: "Workspace",
      description:
        "Manage general TechSkillHub dashboard preferences.",
      icon: Settings2,
    },
    {
      title: "Notifications",
      description:
        "Configure how important dashboard updates should be surfaced.",
      icon: Bell,
    },
    {
      title: "Security",
      description:
        "Authentication and account security controls belong here.",
      icon: LockKeyhole,
    },
    {
      title: "Data",
      description:
        "Database and platform data-management controls will be connected here.",
      icon: Database,
    },
  ];
  
  export default function SettingsPage() {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Administration
          </p>
  
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Settings
          </h1>
  
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Configure your TechSkillHub dashboard and platform
            preferences.
          </p>
        </div>
  
        <div className="grid gap-4 sm:grid-cols-2">
          {settingsSections.map((section) => {
            const Icon = section.icon;
  
            return (
              <div
                key={section.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Icon className="h-5 w-5" />
                </div>
  
                <h2 className="mt-5 text-sm font-semibold text-slate-900">
                  {section.title}
                </h2>
  
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {section.description}
                </p>
              </div>
            );
          })}
        </div>
  
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Configuration workspace
          </h2>
  
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Settings controls will be connected to their respective
            platform services as each dashboard module is implemented.
          </p>
        </section>
      </div>
    );
  }