
import { CheckCircle2, LoaderCircle, Mail } from "lucide-react";

export default function SyncProgress({
  progress,
  importedCount,
  complete,
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        {complete ? (
          <CheckCircle2 className="text-green-600" size={25} />
        ) : (
          <LoaderCircle className="animate-spin text-brand" size={25} />
        )}

        <div>
          <h3 className="font-semibold text-app-text">
            {complete ? "Sync completed!" : "Syncing demo inbox..."}
          </h3>
          <p className="text-sm text-app-muted">
            {complete
              ? "Your sample conversations are ready."
              : "Importing sample conversations into MailPilot."}
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-app-muted">
        <Mail size={16} />
        {complete
          ? `${importedCount} conversations imported`
          : `${progress}% complete`}
      </div>

      <p className="mt-4 text-xs text-app-muted">
        Demo simulation only. No messages are fetched from Gmail or Outlook.
      </p>
    </div>
  );
}
