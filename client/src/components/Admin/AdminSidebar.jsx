import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBars, FaTimes, FaTachometerAlt, FaChalkboardTeacher,
  FaProjectDiagram, FaEnvelope, FaUserGraduate, FaSignOutAlt,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const AdminSidebar = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pendingRef = useRef(0);
  const navigate = useNavigate();
  const { setUser } = useAppContext();

  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/supervisor/pending`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const count = res.data.teams.filter(
          (t) => t.supervisorStatus === "teacherApproved"
        ).length;
        if (pendingRef.current !== count) {
          setPendingCount(count);
          pendingRef.current = count;
        }
      } else {
        toast.error(res.data.message || "Failed to fetch supervisor requests");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching supervisor requests");
    }
  };

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => setMobileOpen(true);
    window.addEventListener("adminSidebarOpen", handler);
    return () => window.removeEventListener("adminSidebarOpen", handler);
  }, []);

  const handleLogout = async () => {
    try {
      const { data } = await axios.get("/api/logout", { withCredentials: true });
      if (data.success) {
        setUser(null);
        toast.success("Logged out");
        navigate("/home", { replace: true });
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const links = [
    { label: "Dashboard", path: "/admin/dashboard",      icon: <FaTachometerAlt /> },
    { label: "Teachers",  path: "/admin/admin_teachers", icon: <FaChalkboardTeacher /> },
    { label: "Projects",  path: "/admin/projects",       icon: <FaProjectDiagram /> },
    { label: "Students",  path: "/admin/admin_std",      icon: <FaUserGraduate /> },
    { label: "Requests",  path: "/admin/requestteacher", icon: <FaEnvelope />, badge: pendingCount },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen bg-[#1F3556] p-4 flex flex-col
          transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${open ? "w-64" : "w-20"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {open && (
            <h1 className="text-lg font-bold text-white whitespace-nowrap">
              Admin Panel
            </h1>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileOpen(false);
              } else {
                setOpen(!open);
              }
            }}
            className="text-white text-xl p-2 hover:bg-white/10 rounded-lg"
          >
            {window.innerWidth < 1024 ? <FaTimes /> : open ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation — grows to fill space */}
        <nav className="flex flex-col gap-2 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center gap-4 p-3 rounded-lg transition ${
                  isActive
                    ? "bg-white text-[#1F3556]"
                    : "text-gray-200 hover:bg-white/10"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              {open && (
                <span className="font-medium whitespace-nowrap flex items-center gap-2">
                  {link.label}
                  {link.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-600 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </span>
              )}
              {!open && (
                <span className="absolute left-20 bg-gray-900 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-lg">
                  {link.label}
                  {link.badge > 0 && ` (${link.badge})`}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout — mobile only, pinned to bottom */}
        <div className="lg:hidden pt-4 border-t border-white/20 mt-4">
          <button
            onClick={() => {
              setMobileOpen(false);
              setShowLogoutModal(true);
            }}
            className="flex items-center gap-4 w-full p-3 rounded-lg text-gray-200 hover:bg-white/10 transition"
          >
            <span className="text-lg"><FaSignOutAlt /></span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-80 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to logout?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;