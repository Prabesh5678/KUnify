import React, { useState } from "react";
import { X } from "lucide-react";
import axios from "axios"; // ADD THIS
import toast from "react-hot-toast";

const JoinTeamModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ADD THIS

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
        {
          code: code.trim(),
        },
        {
          withCredentials: true,
        }
      );

      if (res.data?.success) {
        toast.success("Successfully joined team!");
        onClose();
        // Refresh to update dashboard
        window.location.reload();
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Join Team</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                disabled={isLoading}
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Team Code
              </label>
              <p className="text-gray-600 mb-4">
                Ask your member for the team code, then enter it here.
              </p>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                maxLength={8}
                disabled={isLoading}
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-5 space-y-3">
              <p className="font-medium text-gray-800">
                To join with a team code
              </p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  • Code must be 5–8 letters or numbers (no spaces/symbols)
                </li>
                <li>• Team can have maximum 4 members</li>
                <li>• Ask team leader for the 5-digit code</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg shadow transition disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining...
                  </>
                ) : (
                  "Join"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default JoinTeamModal;