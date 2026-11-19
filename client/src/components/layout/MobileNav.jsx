import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, Star, Clock } from "lucide-react";

const links = [
  { label: "Home", path: "/app", icon: LayoutDashboard, end: true },
  { label: "Inbox", path: "/app/inbox", icon: Inbox },
  { label: "Priority", path: "/app/priority", icon: Star },
  { label: "Waiting", path: "/app/waiting", icon: Clock },
];

const MobileNav = () => {
  return (
    // <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-app-border bg-white md:hidden">
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-app-border bg-white lg:hidden">
      {links.map(({ label, path, icon: Icon, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-3 text-xs ${
              isActive ? "text-brand" : "text-app-muted"
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;