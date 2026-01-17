import {
  LayoutGrid,
  FolderKanban,
  Bell,
  Users,
  AlertCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";

export default function TeacherSidebar() {
  const { user, logout } = useAppContext();
  const location = useLocation();

  // Hide sidebar on profile setup page
  if (location.pathname === "/teacher/profile-setup") {
    return null;
  }

  const [collapsed, setCollapsed] = useState(false);

  const items = [
    { id: 1, label: "Dashboard", icon: <LayoutGrid size={20} />, to: "/teacher/dashboard" },
    { id: 2, label: "Team Projects", icon: <FolderKanban size={20} />, to: "/teacher/projects" },
    { id: 3, label: "Team Requests", icon: <Bell size={20} />, to: "/teacher/requests" },
    { id: 4, label: "Teams", icon: <Users size={20} />, to: "/teacher/teams" },
    { id: 5, label: "Team Deficits", icon: <AlertCircle size={20} />, to: "/teacher/deficits" },
    { id: 6, label: "Settings", icon: <Settings size={20} />, to: "/teacher/settings" },
  ];

  return (
    <aside
      className={`h-screen bg-primary text-white flex flex-col justify-between transition-width duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-semibold">Teacher Panel</h1>
              <p className="text-gray-400 text-sm">KU Portal</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-[#1b2334]"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="px-2">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive ? "bg-[#0f172a]" : "hover:bg-[#1b2334]"
                }`
              }
              title={item.label}  // tooltip
            >
              {item.icon}
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            {user?.name?.charAt(0) || "T"}
          </div>

          {!collapsed && (
            <div>
              <p className="font-medium text-sm">{user?.name || "Teacher"}</p>
              <p className="text-gray-400 text-xs">
                {user?.email || "email@example.com"}
              </p>
            </div>
          )}
        </div>

       
      </div>
    </aside>
  );
}
