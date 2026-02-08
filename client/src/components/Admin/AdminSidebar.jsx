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
  const [pendingCount, setPendingCount] = useState(0);
  const pendingRef = useRef(0); // keeps previous count to avoid flicker

  // Fetch pending supervisor requests count
  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/admin/supervisor/pending",
        { withCredentials: true }
      );
      if (res.data.success) {
        const count = res.data.teams.filter(
          (t) => t.supervisorStatus === "teacherApproved"
        ).length;

        // Only update state if count changed to avoid flickering
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

    // Optional: auto-refresh every 15 seconds
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <FaTachometerAlt /> },
    { label: "Teachers", path: "/admin/admin_teachers", icon: <FaChalkboardTeacher /> },
    { label: "Projects", path: "/admin/projects", icon: <FaProjectDiagram /> },
    { label: "Students", path: "/admin/admin_std", icon: <FaUserGraduate /> },
    { label: "Requests", path: "/admin/requestteacher", icon: <FaEnvelope />, badge: pendingCount },
  ];

  return (
    <div
      className={`${open ? "w-64" : "w-20"} bg-[#1F3556] min-h-screen p-4 transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {open && <h1 className="text-lg font-bold text-white whitespace-nowrap">Admin Panel</h1>}
        <button
          onClick={() => setOpen(!open)}
          className="text-white text-xl p-2 hover:bg-white/10 rounded-lg"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 p-3 rounded-lg transition ${
                isActive ? "bg-white text-[#1F3556]" : "text-gray-200 hover:bg-white/10"
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>

            {/* Text and badge */}
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

            {/* Tooltip when collapsed */}
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
  );
};

export default AdminSidebar;
