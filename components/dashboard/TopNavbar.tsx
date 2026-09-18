"use client";

import { motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function TopNavbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSignOut() {
    setProfileOpen(false);

    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="sticky top-0 z-30 h-[76px] border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden max-w-[620px] flex-1 md:block">
          <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Search leads, students, courses..."
            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
          />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-400">
            <Command className="h-3 w-3" />
            K
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Toggle appearance"
          >
            <motion.div
              animate={{ rotate: darkMode ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <Moon className="h-[18px] w-[18px]" />
            </motion.div>
          </button>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />

            <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
          </button>

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900 sm:flex"
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>

          <div ref={profileRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2.5 pr-3 transition hover:border-slate-300 hover:shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB] text-xs font-bold text-white">
                MS
              </span>

              <span className="hidden text-left sm:block">
                <span className="block text-xs font-bold leading-4 text-slate-900">
                  Manvendra
                </span>

                <span className="block text-[10px] leading-4 text-slate-400">
                  Administrator
                </span>
              </span>

              <motion.div
                animate={{ rotate: profileOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </motion.div>
            </button>

            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-[54px] z-50 w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10"
                role="menu"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">
                    Manvendra
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Administrator
                  </p>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    role="menuitem"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" />
                    Account settings
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}