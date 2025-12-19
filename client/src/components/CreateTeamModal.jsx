{/*
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const CreateTeamModal = ({ isOpen, onClose, selectedSubject }) => {
  const [teamName, setTeamName] = useState("");
  const [section, setSection] = useState("");
  const [room, setRoom] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Smooth fade-in/out effect
  useEffect(() => {
    if (isOpen) setShowModal(true);
    else {
      const timer = setTimeout(() => setShowModal(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newTeam = {
      name: teamName,
      section: section || "N/A",
      subject: selectedSubject, // auto-filled subject
      room: room || "N/A",
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };

    console.log("Team Created:", newTeam);

  
      //WHEN BACKEND IS READY:
      axios.post("/api/team/create", {
        name: teamName,
        subject: selectedSubject,
        section,
        room
      
    

    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />


      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
      
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Create Team
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

     
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
         
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. SPMP"
                className="w-full px-4 py-3.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
              />
            </div>

        
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedSubject || ""}
                disabled
                placeholder="Select subject first"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">
                Subject is auto-filled based on your selection
              </p>
            </div>

         
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-primary-600 hover:bg-blue-50 rounded-lg font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSubject}
                className="px-8 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg shadow transition disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTeamModal;
*/
}

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import TeamCodePopup from "./TeamCodePopup";

const CreateTeamModal = ({ isOpen, onClose, selectedSubject }) => {
  const [teamName, setTeamName] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Team code popup state
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [teamCode, setTeamCode] = useState("");

  // Smooth fade-in / fade-out + reset form
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setTeamName("");
    } else {
      const timer = setTimeout(() => setShowModal(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedSubject) {
      alert("Please select a subject first");
      return;
    }

    /**
     * ===============================
     * CURRENT (Backend NOT ready)
     * ===============================
     * Generate a temporary team code
     * and show popup
     */
  const tempCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  setTeamCode(tempCode);
  setShowCodePopup(true);

  // Delay closing modal so popup stays visible
  setTimeout(() => {
    onClose();
  }, 1000); // 200ms delay


  /**
   * ===============================
   * WHEN BACKEND IS READY
   * ===============================
   *
   * try {
   *   const res = await axios.post("/api/team/create", {
   *     name: teamName,
   *     subject: selectedSubject,
   *   });
   *
   *   if (res.data?.success) {
   *     setTeamCode(res.data.team.code);
   *     setShowCodePopup(true);
   *     onClose();
   *   }
   * } catch (err) {
   *   console.error(err);
   *   alert("Failed to create team");
   * }
   */
};

return (
  <>
    {/* Backdrop */}
    <div
      className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"
        }`}
      onClick={onClose}
    />

    {/* Modal */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-200 ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
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
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Subject <span className="text-red-500">*</span>
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
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSubject}
              className="px-8 py-3 bg-primary text-white rounded-lg disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Team Code Popup */}
    <TeamCodePopup
      isOpen={showCodePopup}
      onClose={() => setShowCodePopup(false)}
      teamCode={teamCode}

    />
  </>
);
};

export default CreateTeamModal;
