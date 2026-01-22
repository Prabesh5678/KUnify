import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaProjectDiagram,
  FaCog,
    FaUserGraduate,
} from "react-icons/fa";

const AdminSidebar = () => {
  const [open, setOpen] = useState(true);

  const links = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      label: "Teachers",
      path: "/admin/teachers",
      icon: <FaChalkboardTeacher />,
    },
    {
      label: "Projects",
      path: "/admin/projects",
      icon: <FaProjectDiagram />,
    },
    {
      label: "Students",
      path: "/admin/students",
      icon: <  FaUserGraduate />,
    },
  ];

  return (
    <div
      className={`${
        open ? "w-64" : "w-20"
      } bg-[#1F3556] min-h-screen p-4 transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {open && (
          <h1 className="text-lg font-bold text-white whitespace-nowrap">
            Admin Panel
          </h1>
        )}

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
                isActive
                  ? "bg-white text-[#1F3556]"
                  : "text-gray-200 hover:bg-white/10"
              }`
            }
          >
            {/* Icon */}
            <span className="text-lg">{link.icon}</span>

            {/* Text (only when open) */}
            {open && (
              <span className="font-medium whitespace-nowrap">
                {link.label}
              </span>
            )}

            {/* Tooltip (only when closed) */}
            {!open && (
              <span className="absolute left-20 bg-gray-900 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-lg">
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
