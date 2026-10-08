import { ArrowLeftRight, BookOpen, ClipboardCheck, History, LayoutDashboard, PlayCircle } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard, mobile: true },
  { href: "/trade", label: "Trade", short: "Trade", icon: ArrowLeftRight, mobile: true },
  { href: "/activity", label: "Activity", short: "Activity", icon: History, mobile: true },
  { href: "/learn", label: "Lessons", short: "Learn", icon: BookOpen, mobile: true },
  { href: "/exam", label: "Final exam", short: "Exam", icon: ClipboardCheck, mobile: true },
  { href: "/videos", label: "Videos", short: "Videos", icon: PlayCircle, mobile: false },
] as const;

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
