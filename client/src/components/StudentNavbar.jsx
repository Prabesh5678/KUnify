import React, { useState, useEffect, useRef } from "react";
import { Menu, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import CreateTeamModal from "./CreateTeamModal";
import JoinTeamModal from "./JoinTeamModal";
import { assets } from "../assets/assets";

const StudentNavbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const plusButtonRef = useRef(null);
  const navigate = useNavigate();

  const { selectedSubject, saveSelectedSubject } = useAppContext();

  const subjects = [
    "COMP 201",
    "COMP 202",
    "COMP 203",
    "COMP 204",
    "COMP 301",
    "COMP 302",
    "COMP 303",
    "COMP 401",
  ];

  // Close plus menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (plusButtonRef.current && !plusButtonRef.current.contains(event.target)) {
        setIsPlusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-primary text-secondary backdrop-blur-sm">
        <div className="w-full px-0 lg:px-4 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* LEFT SECTION */}
            <div className="flex items-center gap-3 pl-0 ml-0">
              <button
                className="p-2 pl-0 hover:bg-blue-100 rounded-lg hover:text-blue-700 transition"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={26} strokeWidth={2.5} />
              </button>

              <div className="px-4 md:px-6">
                <img src={assets.ku_logo} alt="ku_logo" className="h-12" />
              </div>

              <div className="leading-tight">
                <div className="text-lg font-semibold">
                  Kathmandu University
                </div>
                <div className="text-sm">
                  Student Project Management Platform
                </div>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-right space-x-4 lg:space-x-8">
              <button
                onClick={() => setIsSubjectModalOpen(true)}
                className="text-sm font-bold cursor-pointer"
              >
                {selectedSubject || "Select Subject"}
              </button>

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
              <div className="relative group px-1 md:px-3">
                <div className="bg-white rounded-full p-1">
                  {" "}
                  {/* White background and round */}
                  <img
                    src="/avatar.png"
                    alt="User Avatar"
                    className="h-10 md:h-12 rounded-full cursor-pointer object-cover"
                  />
                </div>
              </div>

              <ul
                className="absolute right-3 mt-2 w-35 bg-primary shadow-lg rounded-md
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200"
              >
                <li
                  onClick={() => navigate("student/profile")}
                  className="p-1.5 pl-3 hover:bg-primary cursor-pointer"
                >
                  My Profile
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

      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md rounded-lg p-4 shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Select Subject</h2>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="text-xl"
              >
                ×
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search subject code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-3 focus:outline-none"
            />

            {/* Subject List */}
            <ul className="max-h-60 overflow-y-auto">
              {subjects
                .filter((sub) =>
                  sub.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((sub, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      saveSelectedSubject(sub); // ✅ context + backend
                      setIsSubjectModalOpen(false);
                      setSearchTerm("");
                    }}
                    className="p-2 cursor-pointer rounded hover:bg-primary/10"
                  >
                    {sub}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentNavbar;
