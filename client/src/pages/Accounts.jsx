
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Unplug, Plus, Mail } from "lucide-react";
import toast from "react-hot-toast";

import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import {
  getAccounts,
  syncAccount,
  disconnectAccount,
} from "../api/accounts.api";

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadAccounts = async () => {
    try {
      const result = await getAccounts();
      setAccounts(result.accounts || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSync = async (id) => {
    try {
      setBusyId(id);
      const result = await syncAccount(id);
      toast.success(
        `Sync complete. ${result.importedConversations} new conversations linked.`
      );
      await loadAccounts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Sync failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDisconnect = async (id) => {
    if (!window.confirm("Disconnect this demo account?")) return;

    try {
      setBusyId(id);
      await disconnectAccount(id);
      toast.success("Demo account disconnected");
      await loadAccounts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to disconnect account"
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <p className="text-app-muted">Loading accounts...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-text">Email accounts</h1>
          <p className="mt-1 text-sm text-app-muted">
            Manage your simulated email connections.
          </p>
        </div>

        <Link to="/app/connect">
          <Button>
            <Plus size={16} /> Connect account
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        All accounts shown here are demo connections. No real Gmail or
        Outlook data is accessed.
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-app-border bg-white p-10 text-center">
          <Mail className="mx-auto text-app-muted" size={32} />
          <h2 className="mt-3 font-semibold">No accounts connected</h2>
          <p className="mt-1 text-sm text-app-muted">
            Connect a demo account to import your sample conversations.
          </p>
          <Link to="/app/connect" className="mt-4 inline-block">
            <Button>Connect an account</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => {
            const connected = account.connectionStatus === "connected";

            return (
              <div
                key={account._id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-app-border bg-white p-5 shadow-card sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
                    <Mail size={22} />
                  </div>

                  <div>
                    <h2 className="font-semibold capitalize text-app-text">
                      {account.provider}
                      <span className="ml-2 text-xs font-normal text-app-muted">
                        Demo
                      </span>
                    </h2>
                    <p className="text-sm text-app-muted">
                      {account.emailAddress}
                    </p>
                    <p className="mt-1 text-xs text-app-muted">
                      Last synced:{" "}
                      {account.lastSyncedAt
                        ? new Date(account.lastSyncedAt).toLocaleString()
                        : "Never"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={connected ? "handled" : "pending"}>
                    {connected ? "Connected" : "Disconnected"}
                  </Badge>

                  {connected && (
                    <Button
                      variant="secondary"
                      disabled={busyId === account._id}
                      onClick={() => handleSync(account._id)}
                    >
                      <RefreshCw size={15} />
                      {busyId === account._id ? "Syncing..." : "Sync"}
                    </Button>
                  )}

                  {connected && (
                    <Button
                      variant="danger"
                      disabled={busyId === account._id}
                      onClick={() => handleDisconnect(account._id)}
                    >
                      <Unplug size={15} /> Disconnect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
