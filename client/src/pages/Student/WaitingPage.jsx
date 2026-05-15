
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const WaitingPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAppContext(); // Get user from context

  const [showModal, setShowModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Get team name from user context (already populated by StudentGuard check)
  const teamName = user?.teamId?.name || "your team";

  const confirmCancelRequest = async () => {
    setCancelLoading(true);
    try {
      const res = await axios.post(
        "/api/team/leave",
        {},
        { withCredentials: true }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Request cancelled.");
        
        // ✅ Refresh user context to update teamId and isApproved
        await refreshUser();
        
        // Navigation will be handled by StudentGuard after context updates
      } else {
        toast.error(res.data?.message || "Failed to cancel request.");
        setCancelLoading(false);
        setShowModal(false);
      }
    } catch (err) {
      toast.error("Failed to cancel request.");
      setCancelLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-10 shadow-lg text-center w-full max-w-md">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              Waiting for Team Approval
            </h1>
            <p className="text-gray-600">
              Your request to join{" "}
              <span className="font-semibold text-gray-800">{teamName}</span> is pending approval from the team leader.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Cancel Request
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-2">
              Cancel Team Request?
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your request to join{" "}
              <span className="font-medium">{teamName}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={cancelLoading}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 transition disabled:opacity-50"
              >
                No, Keep Waiting
              </button>

              <button
                onClick={confirmCancelRequest}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaitingPage;