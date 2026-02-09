import React, { useState, useEffect } from "react";
import {
  LayoutGrid,
  FolderKanban,
  Bell,
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

export default function TeacherSidebar() {
  const { user, logout, requestRefetchTrigger } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [teamRequestCount, setTeamRequestCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/teacher/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showLogoutModal ? "hidden" : "auto";
  }, [showLogoutModal]);

  // Fetch dynamic team request count
  useEffect(() => {
    const fetchTeamRequestsCount = async () => {
      try {
        const { data } = await axios.get(
          "/api/teacher/teams?get=request-count",
          { withCredentials: true }
        );
        if (data.success) {
          setTeamRequestCount(data.count);
        }
      } catch (err) {
        console.error("Error fetching team request count:", err);
      }
    };

    fetchTeamRequestsCount();
  }, [requestRefetchTrigger]);

  const items = [
    { id: 1, label: "Dashboard", icon: <LayoutGrid size={20} />, to: "/teacher/dashboard" },
    { id: 2, label: "Team Projects", icon: <FolderKanban size={20} />, to: "/teacher/projects" },
    { id: 3, label: "Team Requests", icon: <Bell size={20} />, to: "/teacher/requests" },
    { id: 4, label: "Team Deficits", icon: <AlertCircle size={20} />, to: "/teacher/deficits" },
    { id: 5, label: "Settings", icon: <Settings size={20} />, to: "/teacher/settings" },
  ];

  return (
    <>
      <aside
        className={`h-screen bg-primary text-white flex flex-col justify-between transition-width duration-300 ${collapsed ? "w-16" : "w-64"
          }`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-4">
            {!collapsed && (
              <div>
                <h1 className="text-xl font-semibold">Teacher Panel</h1>

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

          {/* Navigation Items */}
          <nav className="px-2">
            {items.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive ? "bg-[#0f172a]" : "hover:bg-[#1b2334]"
                  }`
                }
                title={item.label}
              >
                <div className="flex items-center gap-3">
                  {/* Icon with badge */}
                  <div className="relative">
                    {item.icon}
                    {item.label === "Team Requests" && teamRequestCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-500">
                        {teamRequestCount}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </div>
              </NavLink>

            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 space-y-4 flex flex-col items-center">
          {/* User Info */}
          <div className={`flex items-center gap-3 w-full ${collapsed ? "flex-col gap-2" : "flex-row"}`}>
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

        </div>
      </aside>


    </>
  );
}
