import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const JoinTeamModal = ({ isOpen, onClose, selectedSubject }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Please enter a team code");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        "/api/team/join",
        { code: code.trim(), subject: selectedSubject },
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success("Join request sent!");
        onClose();

        // 🔹 Redirect based on approval status
        const isApproved = res.data.student?.isApproved; 
        if (isApproved === false) {
          navigate("/student/waiting"); // pending approval
        } else {
          navigate(0); // already approved, refresh dashboard
        }
      } else {
        toast.error(res.data.message || "Failed to join team");
        console.error(res.data.message);
        
      }
    } catch (err) {
      console.error("Join team error:", err);
      toast.error("Failed to join team. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="px-8 py-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Join Team</h2>
            <button onClick={onClose} disabled={isLoading}>
              <X />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Team Code */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Team Code <span className="text-red-500">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Team Code"
                disabled={isLoading}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            {/* Subject Code (readonly) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={selectedSubject || ""}
                disabled
                className="w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Subject is automatically filled from your profile
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 hover:bg-gray-100 rounded-lg"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white px-6 py-2 rounded-lg"
              >
                {isLoading ? "Joining..." : "Join"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default JoinTeamModal;
