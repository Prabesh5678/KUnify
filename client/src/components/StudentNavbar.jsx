import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { useAppContext } from "../context/AppContext";
import CreateTeamModal from "./CreateTeamModal";
import JoinTeamModal from "./JoinTeamModal";
import { assets } from "../assets/assets";

const StudentNavbar = () => {
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const plusRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const { selectedSubject, setUser } = useAppContext();

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/logout", {
        withCredentials: true,
      });

      if (data.success) {
        setUser(null);
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
      } else {
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) {
        setIsPlusMenuOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary text-secondary shadow">
        <div className="flex items-center justify-between h-16 px-3 md:px-6">

          {/* Left */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer min-w-0"
          >
            <img
              src={assets.ku_logo}
              alt="KU"
              className="h-9 md:h-12 flex-shrink-0"
            />

            <div>
              <div className="hidden md:block">
                <h2 className="font-semibold text-lg">
                  Kathmandu University
                </h2>
                <p className="text-sm">
                  Student Project Management Platform
                </p>
              </div>

            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 md:gap-5">

            {/* Subject */}
            <span
              className="
                max-w-[110px]
                sm:max-w-[170px]
                md:max-w-xs
                truncate
                text-xs
                md:text-sm
                font-semibold
              "
            >
              {selectedSubject || "No Subject"}
            </span>

            {/* Plus */}
            <div className="relative" ref={plusRef}>
              <button
                onClick={() => setIsPlusMenuOpen((prev) => !prev)}
                className="p-1 hover:text-secondary/70"
              >
                <Plus className="w-6 h-6" />
              </button>

              {isPlusMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg bg-gray-700 shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                      setIsPlusMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-600"
                  >
                    Create Team
                  </button>

                  <button
                    onClick={() => {
                      setIsJoinModalOpen(true);
                      setIsPlusMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 border-t border-gray-500 hover:bg-gray-600"
                  >
                    Join Team
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="bg-white rounded-full p-1"
              >
                <img
                  src="/avatar.png"
                  alt="avatar"
                  className="h-9 w-9 md:h-11 md:w-11 rounded-full object-cover"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-primary rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      navigate("/student/profile");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-primary/80"
                  >
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-primary/80"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Join Modal */}
      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        selectedSubject={selectedSubject}
      />

      {/* Create Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedSubject={selectedSubject}
      />

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold text-center text-gray-800">
              Logout
            </h2>

            <p className="text-center text-gray-600 mt-3">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
              >
                Yes
              </button>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
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

export default StudentNavbar;