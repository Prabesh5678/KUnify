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
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

export default function TeacherSidebar() {
  const { user, logout } = useAppContext();
  const location = useLocation();

  const navigate = useNavigate();
  //const [teamRequestCount, setTeamRequestCount] = useState(0);
  const teamRequestCount = 5;

const handleLogout = async () => {
  try {
    await logout();
    navigate("/teacher/login");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

  /*useEffect(() => {
    const fetchTeamRequests = async () => {
      if (!user || user.role !== "admin") return;

      try {
        const { data } = await axios.get(
          "/api/team-requests/unread-count"
        );
        if (data.success) {
          setTeamRequestCount(data.count);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchTeamRequests();

    const interval = setInterval(fetchTeamRequests, 10000);
    return () => clearInterval(interval);
  }, [user]);*/

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
              <p className="text-gray-400 text-sm">Student Project Management Platform</p>
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
              <div className="flex items-center gap-3">
                <div className="relative">
        {item.icon}
        {item.label === "Team Requests" && teamRequestCount > 0 && (
            <span
              className={`absolute text-white text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-500 
                ${collapsed ? "-top-2 -right-2" : "top-0 right-0 translate-x-[160px]"}`}
            >
              {teamRequestCount}
            </span>
          )}
      </div>

      {!collapsed && <span className="text-sm">{item.label}</span>}
      </div>
            </NavLink>
          ))}
        </nav>
      </div>
{/* Footer */}
<div className="border-t border-gray-700 p-4 space-y-4 flex flex-col items-center">
  {/* User Info */}
  <div
    className={`flex items-center gap-3 w-full ${
      collapsed ? "flex-col gap-2" : "flex-row"
    }`}
  >
    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
      {user?.name?.charAt(0) || "T"}
    </div>

    {!collapsed && (
      <div className="flex flex-col">
        <p className="font-medium text-sm">{user?.name || "Teacher"}</p>
        <p className="text-gray-400 text-xs">{user?.email || "email@example.com"}</p>
      </div>
    )}
  </div>

  {/* Logout Button */}
  <button
    onClick={handleLogout}
    className={`flex items-center px-4 py-3 rounded-lg
                bg-primary hover:bg-[#1b2334] transition-colors ${
                  collapsed ? "justify-center w-16 px-0" :  "justify-start  w-full px-4"
                }`}
    title="Logout"
  >
    <LogOut size={20} />
    {!collapsed && <span className="text-sm font-medium ml-3">Logout</span>}
  </button>
</div>

    </aside>
  );
}
