import React, { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets";
import { Menu, Plus } from "lucide-react";
import JoinTeamModal from "./JoinTeamModal";
import CreateTeamModal from "./CreateTeamModal";

const StudentNavbar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const plusButtonRef = useRef(null);
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

            {/* Left Section */}
            <div className="flex items-center gap-3 pl-0 ml-0">

              {/* Hamburger */}
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
                <div className="text-lg font-semibold">Kathmandu University</div>
                <div className="text-sm">Student Project Management Platform</div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="text-sm font-bold">Comp 201</div>

              {/* Plus button with dropdown */}
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
                        setIsJoinModalOpen(true); // open modal
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-500 transition border-t border-gray-300"
                    >
                      Join Team
                    </button>
                  </div>
                )}
              </div>

              <div className="px-1 md:px-3">
                <img src={assets.avatar} alt="Avatar" className="h-10 md:h-12 rounded-full" />
              </div>
            </div>

          </div>
        </div>
      </nav>

      <JoinTeamModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

export default StudentNavbar;