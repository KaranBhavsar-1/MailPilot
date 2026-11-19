import { Bell, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-app-border bg-white px-5 md:px-8">
      <div>
        <p className="text-sm font-medium text-app-text">
          Welcome back, {user?.name}
        </p>
        <p className="text-xs text-app-muted">
          Your email workspace
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-app-muted hover:bg-gray-100"
        >
          <Bell size={19} />
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <UserCircle size={22} className="text-app-muted" />
          <span className="text-sm">{user?.name}</span>
        </div>

        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Topbar;