import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Star,
  Clock,
  Archive,
  Mail,
} from "lucide-react";

const links = [
  { label: "Overview", path: "/app", icon: LayoutDashboard },
  { label: "All Inbox", path: "/app/inbox", icon: Inbox },
  { label: "Priority", path: "/app/priority", icon: Star },
  { label: "Waiting", path: "/app/waiting", icon: Clock },
  { label: "Archive", path: "/app/archive", icon: Archive },
  {label: "Email Accounts",path: "/app/accounts",icon: Mail,},
];

const AssistantSidebar = () => {
  return (
    // <aside className="hidden w-64 shrink-0 border-r border-app-border bg-white p-5 md:flex md:flex-col">
    <aside className="hidden w-64 shrink-0 border-r border-app-border bg-white p-5 lg:flex lg:flex-col">
      <div className="mb-10 flex items-center gap-2">
        <div className="rounded-lg bg-brand p-2 text-white">
          <Mail size={21} />
        </div>
        <span className="text-xl font-bold text-app-text">
          MailPilot
        </span>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Workspace
      </p>

      <nav className="space-y-1">
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/app"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-light text-brand"
                  : "text-app-muted hover:bg-gray-100"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl bg-brand-light p-4">
        <p className="text-sm font-semibold text-brand-dark">
          AI-powered inbox
        </p>
        <p className="mt-1 text-xs text-brand-dark/80">
          Let MailPilot help organise your emails.
        </p>
      </div>
    </aside>
  );
};

export default AssistantSidebar;