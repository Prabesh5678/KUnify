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
  Trash2,
  Menu,
  X
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";

export default function TeacherSidebar() {
  const { user, logout, requestRefetchTrigger } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [teamRequestCount, setTeamRequestCount] = useState(0);
  const [deletionCount, setDeletionCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Track viewport size so desktop "collapsed" state never hides labels on mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Fetch team request count
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

  // Fetch deletion request count
  useEffect(() => {
    const fetchDeletionCount = async () => {
      try {
        const { data } = await axios.get(
          "/api/teacher/teams?get=deletion",
          { withCredentials: true }
        );
        if (data.success) {
          setDeletionCount(data.teams.length);
        }
      } catch (err) {
        console.error("Error fetching deletion count:", err);
      }
    };
    fetchDeletionCount();
  }, [requestRefetchTrigger]);

  const items = [

    { id: 1, label: "Team Projects", icon: <FolderKanban size={20} />, to: "/teacher/projects" },
    { id: 2, label: "Team Requests", icon: <Bell size={20} />, to: "/teacher/requests" },
    { id: 3, label: "Settings", icon: <Settings size={20} />, to: "/teacher/settings" },
    { id: 4, label: "Delete Requests", icon: <Trash2 size={20} />, to: "/teacher/deleterequests" },
  ];

  if (location.pathname === '/teacher/profilesetup') return null;

  const effectiveCollapsed = collapsed && !isMobile;

  return (
    <>
      {/* Mobile top bar with hamburger toggle */}
      <div className="md:hidden flex items-center justify-between bg-primary text-white p-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md hover:bg-[#1b2334]"
          title="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`h-screen bg-primary text-white flex flex-col justify-between transition-all duration-300 z-50
          fixed top-0 left-0 md:static
          w-64 ${effectiveCollapsed ? "md:w-16" : "md:w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-4">
            {!effectiveCollapsed && (
              <div>
                <h1 className="text-xl font-semibold">Teacher Panel</h1>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-md hover:bg-[#1b2334] hidden md:inline-flex"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-md hover:bg-[#1b2334] md:hidden"
              title="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-2">
            {items.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive ? "bg-[#0f172a]" : "hover:bg-[#1b2334]"}`
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
                    {item.label === "Delete Requests" && deletionCount > 0 && (
                      <span className="absolute -top-2 -right-2 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-500">
                        {deletionCount}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  {!effectiveCollapsed && <span className="text-sm">{item.label}</span>}
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 space-y-4 flex flex-col items-center">
          {/* User Info */}
          <div className={`flex items-center gap-3 w-full ${effectiveCollapsed ? "flex-col gap-2" : "flex-row"}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-semibold text-white">
              {user?.name?.charAt(0) || "T"}
            </div>
            {!effectiveCollapsed && (
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