"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/corporate-training", label: "Corporate Training" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
      className={cn(
        "flex items-center gap-2.5 rounded-md outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        TechSkill Hub
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  pathname,
  className,
}: {
  href: string;
  label: string;
  pathname: string;
  className?: string;
}) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center py-1 text-sm font-medium tracking-tight outline-none transition-colors duration-200",
        "text-muted-foreground hover:text-foreground",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 after:ease-out",
        "hover:after:scale-x-100 focus-visible:text-foreground focus-visible:after:scale-x-100",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        active && "text-foreground after:scale-x-100",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 shadow-[0_1px_0_0_oklch(0_0_0/0.04)] backdrop-blur-xl supports-backdrop-filter:bg-background/55">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 lg:flex"
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

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="lg"
            className="h-10 px-4 transition-colors duration-200"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Login
          </Button>
          <Button
            size="lg"
            className="h-10 px-4 transition-colors duration-200"
            nativeButton={false}
            render={<Link href="/get-started" />}
          >
            Get Started
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs gap-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Site sections and account actions
              </SheetDescription>
              <Logo onNavigate={() => setOpen(false)} />
            </SheetHeader>

            <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-4">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium tracking-tight outline-none transition-colors duration-200",
                      "text-muted-foreground hover:bg-muted hover:text-foreground",
                      "focus-visible:ring-3 focus-visible:ring-ring/50",
                      active && "bg-muted text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </SheetClose>
                );
              })}
            </nav>

            <SheetFooter className="border-t border-border">
              <Button
                variant="outline"
                size="lg"
                className="h-10 w-full transition-colors duration-200"
                nativeButton={false}
                render={
                  <Link href="/login" onClick={() => setOpen(false)} />
                }
              >
                Login
              </Button>
              <Button
                size="lg"
                className="h-10 w-full transition-colors duration-200"
                nativeButton={false}
                render={
                  <Link href="/get-started" onClick={() => setOpen(false)} />
                }
              >
                Get Started
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
