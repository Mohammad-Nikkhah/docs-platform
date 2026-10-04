import { ProgressBar } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/utils";

/** Course title, short description and progress. Used in desktop sidebar and mobile drawer. */
export function CourseSidebarHeader({
  title,
  description,
  completed,
  total,
  showProgress,
}: {
  title: string;
  description: string;
  completed: number;
  total: number;
  showProgress: boolean;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="space-y-2 border-b pb-4">
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="text-xs leading-6 text-muted">{description}</p>}
      {showProgress && (
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs text-muted">
            <span>پیشرفت دوره</span>
            <span>{toPersianDigits(pct)}٪</span>
          </div>
          <ProgressBar value={pct} label="پیشرفت دوره" />
        </div>
      )}
    </div>
  );
}
