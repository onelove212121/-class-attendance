import { NavLink } from "react-router-dom";
import { Radio, CalendarDays, Users, Layers, Settings as SettingsIcon } from "lucide-react";

const NAV = [
  { to: "/", label: "Live Status", icon: Radio },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/students", label: "Students", icon: Users },
  { to: "/sections", label: "Sections", icon: Layers },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-board text-chalk flex flex-col min-h-screen">
      <div className="px-6 py-7 border-b border-chalk/10">
        <p className="font-display text-xl font-semibold leading-tight">
          The Register
        </p>
        <p className="text-xs text-chalk-dim mt-1 tracking-wide">
          Classroom Attendance
        </p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-board-deep text-accent"
                  : "text-chalk-dim hover:text-chalk hover:bg-board-deep/60"
              }`
            }
          >
            <Icon size={17} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 text-xs text-chalk-dim border-t border-chalk/10">
        RFID Tap In / Tap Out
      </div>
    </aside>
  );
}
