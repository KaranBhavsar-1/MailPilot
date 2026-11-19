
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/common/Button";
import SyncProgress from "../components/accounts/SyncProgress";
import {
  connectAccount,
  syncAccount,
} from "../api/accounts.api";

const providers = [
  {
    id: "gmail",
    name: "Gmail",
    description: "Connect a simulated Google inbox.",
    icon: "G",
    color: "bg-red-50 text-red-600",
  },
  {
    id: "outlook",
    name: "Outlook",
    description: "Connect a simulated Microsoft inbox.",
    icon: "O",
    color: "bg-blue-50 text-blue-600",
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ConnectAccount() {
  const navigate = useNavigate();

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [complete, setComplete] = useState(false);

  const startConnection = async () => {
    if (!selectedProvider) return;

    try {
      setConnecting(true);
      setShowConsent(false);
      setProgress(15);

      // Create the simulated account in MongoDB.
      const connection = await connectAccount(selectedProvider);

      setProgress(35);
      await delay(500);

      // Link the seeded conversations to the new account.
      setProgress(65);
      const sync = await syncAccount(connection.account._id);

      setProgress(100);
      setImportedCount(sync.importedConversations);
      setComplete(true);

      toast.success("Demo account connected and synced!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to connect demo account"
      );
      setConnecting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="mb-2 text-sm font-medium text-brand">
          ACCOUNT ONBOARDING
        </p>
        <h1 className="text-2xl font-bold text-app-text">
          Connect your email
        </h1>
        <p className="mt-2 text-app-muted">
          Choose a provider to import your MailPilot demo conversations.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Demo mode:</strong> These connections are simulated.
        MailPilot will not access your real Gmail or Outlook inbox.
        Never enter your email password here.
      </div>

      {!connecting && !complete && (
        <div className="grid gap-5 sm:grid-cols-2">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`rounded-2xl border bg-white p-6 text-left shadow-card transition ${
                selectedProvider === provider.id
                  ? "border-brand ring-2 ring-brand/20"
                  : "border-app-border hover:border-brand/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${provider.color}`}>
                  {provider.icon}
                </div>
                {selectedProvider === provider.id && (
                  <CheckCircle2 className="text-brand" />
                )}
              </div>

              <h2 className="mt-5 font-semibold text-app-text">
                {provider.name}
              </h2>
              <p className="mt-1 text-sm text-app-muted">
                {provider.description}
              </p>
              <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                Demo Connection
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedProvider && !connecting && !complete && (
        <Button onClick={() => setShowConsent(true)} disabled={!selectedProvider}>
          Continue <ArrowRight size={16} />
        </Button>
      )}

      {showConsent && (
        <div className="rounded-2xl border border-app-border bg-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-brand" size={26} />
            <h2 className="text-lg font-semibold">Demo connection consent</h2>
          </div>

          <p className="mt-4 text-sm leading-6 text-app-muted">
            You are about to connect a simulated{" "}
            {selectedProvider === "gmail" ? "Gmail" : "Outlook"} account.
            This is a local MailPilot demonstration. No external provider
            authorization takes place, and no password or provider access
            token is requested.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={startConnection}>
              Confirm demo connection
            </Button>
            <Button variant="secondary" onClick={() => setShowConsent(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {(connecting || complete) && (
        <SyncProgress
          progress={progress}
          importedCount={importedCount}
          complete={complete}
        />
      )}

      {complete && (
        <Button onClick={() => navigate("/app")}>
          Go to dashboard <ArrowRight size={16} />
        </Button>
      )}
    </div>
  );
}
