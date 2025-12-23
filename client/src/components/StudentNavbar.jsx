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
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ logout modal state

  const plusButtonRef = useRef(null);
  const navigate = useNavigate();
  const { selectedSubject, setUser } = useAppContext();

  /* =========================
     LOGOUT
  ========================= */
  const logout = async () => {
    try {
      const { data } = await axios.get("/api/student/logout", {
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
      console.error(error);
    }
  };

  /* =========================
     CLOSE PLUS MENU ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        plusButtonRef.current &&
        !plusButtonRef.current.contains(event.target)
      ) {
        setIsPlusMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-primary text-secondary backdrop-blur-sm">
        <div className="w-full px-0 lg:px-4 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div className="px-4 md:px-6">
                <img src={assets.ku_logo} alt="ku_logo" className="h-12" />
              </div>
              <div>
                <div className="text-lg font-semibold">Kathmandu University</div>
                <div className="text-sm">Student Project Management Platform</div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-4 lg:space-x-8">
              <span className="text-sm font-bold cursor-default">
                {selectedSubject || "No Subject Selected"}
              </span>

              {/* PLUS MENU */}
              <div className="relative" ref={plusButtonRef}>
                <button
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  className="hover:text-secondary/60 transition p-1"
                >
                  <Plus size={25} strokeWidth={2.5} />
                </button>

                {isPlusMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-600 rounded-lg shadow-lg py-2 z-50">
                    <button
                      onClick={() => {
                        setIsCreateModalOpen(true);
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-500 transition"
                    >
                      Create Team
                    </button>

                    <button
                      onClick={() => {
                        setIsJoinModalOpen(true);
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-500 transition border-t border-gray-300"
                    >
                      Join Team
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PROFILE */}
            <div className="relative group px-1 md:px-3">
              <div className="bg-white rounded-full p-1">
                <img
                  src="/avatar.png"
                  alt="User Avatar"
                  className="h-10 md:h-12 rounded-full cursor-pointer object-cover"
                />
              </div>

              <ul
                className="absolute right-3 mt-2 w-36 bg-primary shadow-lg rounded-md
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200"
              >
                <li
                  onClick={() => navigate("/student/profile")}
                  className="p-1.5 pl-3 hover:bg-primary cursor-pointer"
                >
                  My Profile
                </li>

                <li
                  onClick={() => setShowLogoutModal(true)} // ✅ open modal instead of immediate logout
                  className="p-1.5 pl-3 hover:bg-primary cursor-pointer"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* MODALS */}
      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        selectedSubject={selectedSubject}
      />

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to logout?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg font-semibold"
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
