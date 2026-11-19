
import { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Save,
  Trash2,
  Send,
  Pencil,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  createReplyDraft,
  updateDraft,
  regenerateDraft,
  discardDraft,
  approveDraft,
} from "../../api/drafts.api";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Something went wrong. Please try again.";

const ReplyComposer = ({ threadId, onApproved }) => {
  const [draft, setDraft] = useState(null);
  const [body, setBody] = useState("");
  const [tone, setTone] = useState("professional");
  const [instruction, setInstruction] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    try {
      setLoading(true);

      const response = await createReplyDraft(threadId, {
        tone,
        instruction,
      });

      setDraft(response.data.draft);
      setBody(response.data.draftText);

      toast.success("AI reply draft generated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (!draft?._id) return;

    try {
      setLoading(true);

      const response = await regenerateDraft(draft._id, {
        tone,
        instruction,
      });

      setDraft(response.data.draft);
      setBody(response.data.draftText);

      toast.success("Draft regenerated.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!draft?._id) return false;

    if (!body.trim()) {
      toast.error("Draft cannot be empty.");
      return false;
    }

    try {
      setSaving(true);

      const response = await updateDraft(draft._id, {
        body,
      });

      setDraft(response.data.draft);

      toast.success("Draft saved.");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    if (!draft?._id) return;

    const confirmed = window.confirm(
      "Are you sure you want to discard this draft?"
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      await discardDraft(draft._id);

      setDraft(null);
      setBody("");
      setInstruction("");

      toast.success("Draft discarded.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    if (!draft?._id) return;

    if (!body.trim()) {
      toast.error("Draft cannot be empty.");
      return;
    }

    const confirmed = window.confirm(
      "Add this reply to the demo conversation?\n\nNo external email will be sent."
    );

    if (!confirmed) return;

    try {
      setBusy(true);

      // Save any edits before approving.
      const saveResponse = await updateDraft(draft._id, {
        body,
      });

      setDraft(saveResponse.data.draft);

      const response = await approveDraft(draft._id);

      setDraft(null);
      setBody("");
      setInstruction("");

      // This message explicitly states that no real email was sent.
      toast.success(
        response.data.message || "Simulated reply added."
      );

      if (onApproved) {
        await onApproved();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={19} className="text-purple-600" />

            <h2 className="font-semibold text-slate-900">
              AI reply composer
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Generate and review a suggested reply before adding it to the demo conversation.
          </p>
        </div>

        {!draft && (
          <button
            type="button"
            disabled={loading}
            onClick={generate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Sparkles size={16} />
            {loading ? "Generating..." : "Generate reply"}
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Reply tone
          </label>

          <select
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            disabled={loading || busy}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-400"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="formal">Formal</option>
            <option value="concise">Concise</option>
            <option value="empathetic">Empathetic</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Additional instruction
          </label>

          <input
            type="text"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            maxLength={500}
            disabled={loading || busy}
            placeholder="e.g. Keep the reply under 3 sentences"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {draft && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800">
              Reply draft
            </label>

            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
              Draft · Not sent
            </span>
          </div>

          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={9}
            maxLength={10000}
            disabled={busy}
            className="w-full resize-y rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-800 outline-none focus:border-purple-400"
          />

          <div className="mt-2 text-xs text-slate-400">
            {body.length}/10000 characters
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving || busy || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save edits"}
            </button>

            <button
              type="button"
              onClick={regenerate}
              disabled={loading || busy || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-50"
            >
              <RefreshCw size={15} />
              {loading ? "Regenerating..." : "Regenerate"}
            </button>

            <button
              type="button"
              onClick={discard}
              disabled={busy || loading || saving}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={15} />
              Discard
            </button>

            <button
              type="button"
              onClick={approve}
              disabled={busy || loading || saving || !body.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <Send size={15} />
              {busy ? "Processing..." : "Approve simulated send"}
            </button>
          </div>

          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Review the reply before approving. Approval adds an outbound simulated message to this demo conversation. No external email will be sent.
          </p>
        </div>
      )}
    </section>
  );
};

export default ReplyComposer;
