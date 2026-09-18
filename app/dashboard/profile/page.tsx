import {
    BriefcaseBusiness,
    Mail,
    ShieldCheck,
    UserRound,
  } from "lucide-react";
  
  const profileDetails = [
    {
      label: "Account",
      value: "TechSkillHub Dashboard",
      icon: UserRound,
    },
    {
      label: "Role",
      value: "Administrator",
      icon: ShieldCheck,
    },
    {
      label: "Workspace",
      value: "TechSkillHub",
      icon: BriefcaseBusiness,
    },
    {
      label: "Contact",
      value: "Administrator account",
      icon: Mail,
    },
  ];
  
  export default function ProfilePage() {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Account
          </p>
  
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Profile
          </h1>
  
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your TechSkillHub dashboard profile and account
            information.
          </p>
        </div>
  
        <div className="grid gap-4 sm:grid-cols-2">
          {profileDetails.map((item) => {
            const Icon = item.icon;
  
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="h-5 w-5" />
                  </div>
  
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      {item.label}
                    </p>
  
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
  
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Profile settings
          </h2>
  
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Profile editing and account preferences will be connected
            to the authenticated user account as the dashboard
            account system is expanded.
          </p>
        </section>
      </div>
    );
  }