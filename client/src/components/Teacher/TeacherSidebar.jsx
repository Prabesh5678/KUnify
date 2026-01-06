import { LayoutGrid, FolderKanban, Bell, Users, AlertCircle, Settings, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function TeacherSidebar() {
  const items = [
    { id: 1, label: "Dashboard", icon: <LayoutGrid size={20} />, to: "/teacher/dashboard" },
    { id: 2, label: "Team Projects", icon: <FolderKanban size={20} />,to: "/teacher/projects" },
    { id: 3, label: "Team Requests", icon: <Bell size={20} />, to: "/teacher/requests" },
    { id: 4, label: "Teams", icon: <Users size={20} />, to: "/teacher/teams" },
    { id: 5, label: "Team Deficits", icon: <AlertCircle size={20} />,  to: "/teacher/deficits" },
    { id: 6, label: "Settings", icon: <Settings size={20} />, to: "/teacher/settings" },
  ];

  return (
    <aside className="w-64 bg-[#0e1525] text-white flex flex-col justify-between">
      <div>
        <div className="p-6">
          <h1 className="text-xl font-semibold">Teacher Panel</h1>
          <p className="text-gray-400 text-sm">KU Portal</p>
        </div>

        <nav className="px-3">
          {items.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-4 py-3 rounded-lg mb-1 ${
                  isActive ? "bg-blue-600" : "hover:bg-[#1b2334]"
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-600 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">Prof</div>
          <div>
            <p className="font-medium text-sm">Prof. Happy</p>
            <p className="text-gray-400 text-xs">stg@gmail.com</p>
          </div>
        </div>
        <LogOut className="text-gray-400 hover:text-white cursor-pointer" size={18} />
      </div>
    </aside>
  );
}
