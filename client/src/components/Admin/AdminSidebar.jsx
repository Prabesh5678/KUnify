import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaProjectDiagram,
  FaEnvelope,
  FaUserGraduate,
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

const AdminSidebar = () => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pendingRef = useRef(0);

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

  const links = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      label: "Teachers",
      path: "/admin/admin_teachers",
      icon: <FaChalkboardTeacher />,
    },
    {
      label: "Projects",
      path: "/admin/projects",
      icon: <FaProjectDiagram />,
    },
    {
      label: "Students",
      path: "/admin/admin_std",
      icon: <FaUserGraduate />,
    },
    {
      label: "Requests",
      path: "/admin/requestteacher",
      icon: <FaEnvelope />,
      badge: pendingCount,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#1F3556] text-white p-3 rounded-lg shadow-md"
      >
        <FaBars />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static
          top-0 left-0
          z-50
          h-screen
          bg-[#1F3556]
          p-4
          flex flex-col
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

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
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
      </div>
    </>
  );
};

export default AdminSidebar;