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

      // 🔹 If request is pending, go to waiting page
      if (res.data.teamStatus === "pending") {
        navigate("/student/waiting");
      } else {
        // Otherwise, refresh dashboard to see the team immediately
        navigate(0);
      }
    } else {
      toast.error(res.data.message || "Failed to join team");
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
          <div className="px-8 py-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Join Team</h2>
              <button onClick={onClose} disabled={isLoading}>
                <X />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Team Code"
              disabled={isLoading}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose}>
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
