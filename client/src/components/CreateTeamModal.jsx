import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import TeamCodePopup from "./TeamCodePopup";

const CreateTeamModal = ({ isOpen, onClose, selectedSubject }) => {
  const [teamName, setTeamName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Team code popup state
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [teamCode, setTeamCode] = useState("");

  // Smooth fade-in / fade-out + reset form
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setTeamName("");
      setShowCodePopup(false); // Reset popup
    } else {
      const timer = setTimeout(() => setShowModal(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSubject) {
      alert("Please select a subject first");
      return;
    }

    if (!teamName.trim()) {
      alert("Please enter a team name");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "/api/student/team/create",
        {
          name: teamName.trim(),
          subject: selectedSubject,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        setTeamCode(res.data.team.code);
        onClose(); // Close the create team modal first
        
        // Show popup after a small delay (ensures modal is closed)
        setTimeout(() => {
          setShowCodePopup(true);
        }, 100);
      } else {
        alert(res.data.message || "Failed to create team");
      }
    } catch (err) {
      console.error("Create team error:", err);
      alert("Failed to create team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupClose = () => {
    setShowCodePopup(false);
    window.location.reload(); // Refresh to update team status
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-200 ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-8 py-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create Team</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. SPMP"
                className="w-full px-4 py-3 border rounded-lg focus:ring-4 focus:ring-blue-100"
                disabled={isLoading}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject <span className="text-red500">*</span>
              </label>
              <input
                type="text"
                value={selectedSubject || ""}
                disabled
                placeholder="Select subject first"
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                Subject is automatically filled from your profile
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSubject || isLoading}
                className="px-8 py-3 bg-primary text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Team Code Popup - RENDERED SEPARATELY */}
      {showCodePopup && (
        <TeamCodePopup
          isOpen={showCodePopup}
          onClose={handlePopupClose}
          teamCode={teamCode}
        />
      )}
    </>
  );
};

export default CreateTeamModal;