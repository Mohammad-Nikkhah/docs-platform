import {
  BookOpen,
  Cloud,
  Code,
  Container,
  Database,
  GitBranch,
  Network,
  Server,
  Shield,
  Terminal,
  Activity,
  Cpu,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Server,
  Terminal,
  Network,
  Database,
  Container,
  GitBranch,
  Cloud,
  Shield,
  Code,
  Activity,
  Cpu,
};

export const COURSE_ICON_NAMES = Object.keys(ICONS);

export function CourseIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? BookOpen;
  return <Icon className={className} aria-hidden />;
}
