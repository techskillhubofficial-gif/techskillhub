"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Login" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="TechSkillHub home"
      className={cn(
        "flex items-center rounded-md outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-600/30",
        className,
      )}
    >
      <Image
        src="/logo/Full-logo.png"
        alt="TechSkillHub"
        width={400}
        height={105}
        priority
        className="h-[56px] w-auto object-contain sm:h-[60px] lg:h-[66px]"
      />
    </Link>
  );
}

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-10 items-center px-1 text-[15px] font-medium tracking-[-0.01em] outline-none transition-colors duration-200",
        active
          ? "text-blue-600"
          : "text-slate-600 hover:text-slate-950",
        "after:absolute after:bottom-0 after:left-1 after:right-1 after:h-0.5 after:origin-center after:rounded-full after:bg-blue-600 after:transition-transform after:duration-200",
        active
          ? "after:scale-x-100"
          : "after:scale-x-0 hover:after:scale-x-100",
        "focus-visible:ring-2 focus-visible:ring-blue-600/30",
      )}
    >
      {label}
    </Link>
  );
}

function CareerGuidanceButton({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Button
      size="lg"
      className={cn(
        "group rounded-xl bg-blue-600 font-semibold text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_12px_30px_-10px_rgba(37,99,235,0.7)]",
        mobile
          ? "h-12 w-full px-5 text-[15px]"
          : "h-11 px-5 text-[15px]",
      )}
      nativeButton={false}
      render={
        <Link href="/consultation" onClick={onNavigate} />
      }
    >
      Get Career Guidance
      <ArrowRight
        aria-hidden="true"
        className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <Container className="flex h-[76px] items-center justify-between">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 lg:flex xl:gap-9"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              pathname={pathname}
            />
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <CareerGuidanceButton />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-950 lg:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-full max-w-[390px] gap-0 border-l border-slate-200 bg-white p-0"
          >
            <SheetHeader className="border-b border-slate-200 px-6 py-5">
              <SheetTitle className="sr-only">
                TechSkillHub navigation
              </SheetTitle>
              <SheetDescription className="sr-only">
                Explore TechSkillHub programs, information, contact and account
                access.
              </SheetDescription>

              <Logo onNavigate={() => setOpen(false)} />
            </SheetHeader>

            <nav
              aria-label="Mobile"
              className="flex flex-col px-5 py-6"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    className={cn(
                      "flex min-h-12 items-center rounded-xl px-4 text-[15px] font-medium outline-none transition-colors duration-200",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-950",
                      "focus-visible:ring-2 focus-visible:ring-blue-600/30",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </SheetClose>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-200 px-5 py-6">
              <CareerGuidanceButton
                mobile
                onNavigate={() => setOpen(false)}
              />

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Not sure which path is right for you?
                <br />
                Start with a career conversation.
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
