import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const WaitingPage = () => {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const checkApproval = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "/api/student/is-auth?populateTeam=true",
        { withCredentials: true }
      );

      if (res.data.success) {
        const student = res.data.student;
        const team = student.teamId;

        if (!team) {
          toast("You are not part of any team.");
          navigate("/student/home");
          return;
        }

        setTeamName(team.name || "");

        const member = team.members.find(
          (m) => m._id === student._id
        );

        if (member?.status === "approved") {
          toast.success("Your request has been approved!");
          navigate("/student/dashboard");
        } else if (member?.status === "declined") {
          toast.error("Your request has been declined.");
          navigate("/student/home");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to check status.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancelRequest = async () => {
    setCancelLoading(true);
    try {
      const res = await axios.post(
        "/api/student/cancel-join-request",
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/student/home");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel request.");
    } finally {
      setCancelLoading(false);
      setShowModal(false);
    }
  };

  useEffect(() => {
    checkApproval();
  }, []);

  return (
    <>
      {/* Main Page */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl p-10 shadow-lg text-center w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            Waiting for Team Approval
          </h1>

          <p className="text-gray-600 mb-6">
            Your request to join{" "}
            <span className="font-semibold">{teamName}</span> is pending.
          </p>

          {loading && (
            <p className="text-sm text-gray-400">
              Checking status...
            </p>
          )}

          {!loading && (
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={checkApproval}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
              >
                Check Status
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Cancel Request
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            Your status will update when you click "Check Status".
          </p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Leave Team Request?
            </h3>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel your request to join{" "}
              <span className="font-medium">{teamName}</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100"
              >
                No
              </button>

              <button
                onClick={confirmCancelRequest}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
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
