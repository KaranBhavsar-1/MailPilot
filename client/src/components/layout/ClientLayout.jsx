import { Outlet } from "react-router-dom";
import { Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

const ClientLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-app-background">
      <header className="flex h-16 items-center justify-between border-b border-app-border bg-white px-5 md:px-10">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-brand p-2 text-white">
            <Mail size={20} />
          </div>
          <span className="text-xl font-bold">MailPilot</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-app-muted sm:block">
            {user?.name}
          </span>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-5 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;