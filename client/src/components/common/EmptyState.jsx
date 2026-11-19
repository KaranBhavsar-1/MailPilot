import { Inbox } from "lucide-react";
import Button from "./Button";

const EmptyState = ({
  title = "Nothing here yet",
  description = "Your items will appear here.",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-app-border bg-white px-6 py-12 text-center">
      <Inbox size={36} className="mb-3 text-gray-400" />

      <h3 className="font-semibold text-app-text">{title}</h3>

      <p className="mt-1 max-w-sm text-sm text-app-muted">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;