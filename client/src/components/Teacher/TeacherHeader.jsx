import React, { useState } from "react";
import { Menu } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const TeacherHeader = () => {
  const navigate = useNavigate();
  const { logout, user } = useAppContext();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/teacher/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex justify-between items-center gap-3 bg-primary p-4 sm:p-5 mt-4 px-4 sm:px-8 shadow-md rounded-2xl">

      {/* Left Section */}
      <NavLink to="/teacher/projects" className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <img src={assets.ku_logo} alt="ku_logo" className="h-9 sm:h-12 shrink-0" />
        {/* Welcome text + KU details: desktop only */}
        <div className="text-white min-w-0 hidden sm:block">
          <div className="text-base sm:text-xl font-semibold truncate">
            Welcome, {user?.name || "Teacher"}
          </div>
          <div className="text-lg font-semibold">Kathmandu University</div>
          <div className="text-sm">Student Project Management Platform</div>
        </div>
      </NavLink>

      {/* Logout Button - desktop only, mobile uses the sidebar drawer instead */}
      <button
        onClick={() => setShowLogoutModal(true)}
        className="hidden sm:inline-flex bg-primary text-white font-semibold px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-primary transition-all duration-200 cursor-pointer shrink-0 whitespace-nowrap"
      >
        Logout
      </button>

      {/* Hamburger - mobile only, opens the sidebar drawer */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("teacher-toggle-mobile-menu"))}
        className="sm:hidden p-2 rounded-md text-white hover:bg-[#1b2334] cursor-pointer shrink-0"
        title="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Logout Modal (desktop trigger) */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] px-4"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to logout?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 cursor-pointer rounded-lg font-semibold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 cursor-pointer rounded-lg font-semibold"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHeader;