"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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
  { href: "/programs", label: "Programs" },
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
      <Image
  src="/logo/Full-logo.png"
  alt="TechSkill Hub"
  width={400}
  height={105}
  priority
  className="
        h-[60px]
        w-auto
        object-contain
        transition-transform
        duration-300
        hover:scale-[1.02]
        lg:h-[72px]
    "
/>
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
        active &&
"text-blue-600 after:bg-blue-600 after:scale-x-100",
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
    <header
className="
sticky
top-0
z-50
border-b
border-slate-200/70
bg-white/80
backdrop-blur-md
supports-[backdrop-filter]:bg-white/70
transition-all
duration-300
"
>
<Container
  className="
    flex
    h-[80px]
    items-center
    justify-between
  "
>
    <Logo />

        <nav
          aria-label="Primary"
          className="
hidden
items-center
gap-9
xl:gap-10
lg:flex
"
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

        <div
className="
hidden
items-center
gap-3
xl:gap-4
lg:flex
"
>
        
        <Button
  variant="outline"
  size="lg"
  className="h-10 px-5"
  nativeButton={false}
  render={
    <Link
      href="/career-guidance"
      onClick={() => setOpen(false)}
    />
  }
>
  Free Career Guidance
</Button>

<Button
size="lg"
className="
h-10
rounded-xl
bg-blue-600
px-6
font-semibold
text-white
shadow-md
transition-all
duration-300
hover:-translate-y-0.5
hover:bg-blue-700
hover:shadow-lg
"
nativeButton={false}
render={
<Link
href="/consultation"
/>
}
>
Book Consultation
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
          <SheetContent side="right" className="
w-full
max-w-[380px]
gap-0
">
            <SheetHeader className="border-b border-border">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Site sections and account actions
              </SheetDescription>
              <Logo onNavigate={() => setOpen(false)} />
            </SheetHeader>

            <nav aria-label="Mobile" className="flex flex-col gap-1 px-6 py-6">
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
                  <Link href="/student-portal" onClick={() => setOpen(false)} />
                }
              >
                Student Portal
              </Button>
              <Button
  size="lg"
  className="h-11 rounded-xl bg-blue-600 px-6 font-semibold hover:bg-blue-700"
  nativeButton={false}
  render={
    <Link
      href="/contact"
      onClick={() => setOpen(false)}
    />
  }
>
  Apply Now
</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
