import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { AlertCircle } from "lucide-react";

const TeamMembers = () => {
  const { teamId } = useParams();
  const { user } = useAppContext();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/team/${teamId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setTeam(res.data.team);
      } else {
        toast.error(res.data.message || "Failed to load team");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!team) return <p className="p-6 text-center">No team data found.</p>;

  const isLeader = team.leaderId?._id === user?._id;

  const currentUserMember = team.members?.find(
    (member) => member._id === user?._id
  );

  const isCurrentUserApproved = currentUserMember?.isApproved === true;
  const isCurrentUserPending = currentUserMember?.isApproved === false;

  const approvedMembers =
    team.members?.filter((m) => m.isApproved === true) || [];

  const pendingMembers =
    team.members?.filter((m) => m.isApproved === false) || [];

  const handleMemberAction = async (memberId, action) => {
    try {
      setActionLoading(memberId);
      const res = await axios.post(
        `/api/team/approve/${teamId}`,
        { memberId, action,memberCount:approvedMembers.length },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        fetchTeam();
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update member");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveTeam = async () => {
    try {
      const res = await axios.post(
        "/api/team/leave",
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/student/dashboard");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error leaving team");
    } finally {
      setShowLeaveModal(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      setDeleting(true);
      const res = await axios.post(
        "/api/team/delete",
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Team deleted successfully");
        navigate("/student/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete team");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{team.name}</h2>
        <p className="text-gray-500 mt-1">
          Supervisor:{" "}
          <span className="font-medium">
            {team.supervisor?.name || "Not assigned yet"}
          </span>
        </p>
      </div>

      {/* DELETE TEAM — ONLY CREATOR & ONLY SINGLE MEMBER */}
      {isLeader && team.members.length === 1 && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-50 text-red-600 border border-red-200 px-5 py-3 rounded-xl
                       hover:bg-red-100 transition font-medium flex items-center gap-2 cursor-pointer"
          >
            <AlertCircle size={18} />
            Delete Team
          </button>
        </div>
      )}

      {/* Approved Members */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Approved Members ({approvedMembers.length})
        </h3>

        {approvedMembers.length > 0 ? (
          approvedMembers.map((m) => (
            <div
              key={m._id}
              className="flex justify-between items-center p-4 mb-3 rounded-lg border bg-emerald-50"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {m.name}
                  {team.leaderId?._id === m._id && (
                    <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      Team Creator
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">{m.email}</p>
              </div>
              <span className="text-emerald-600 font-semibold">Approved</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No approved members yet.</p>
        )}
      </div>

      {/* Pending Members (Leader only) */}
      {isLeader && pendingMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-yellow-700">
            Pending Requests ({pendingMembers.length})
          </h3>

          {pendingMembers.map((m) => (
            <div
              key={m._id}
              className="flex justify-between items-center p-4 mb-3 rounded-lg border bg-yellow-50"
            >
              <div>
                <p className="font-medium text-gray-800">{m.name}</p>
                <p className="text-sm text-gray-600">{m.email}</p>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={actionLoading === m._id}
                  onClick={() => handleMemberAction(m._id, "approve")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm disabled:opacity-50 cursor-pointer"
                >
                  Approve
                </button>

                <button
                  disabled={actionLoading === m._id}
                  onClick={() => handleMemberAction(m._id, "decline")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm disabled:opacity-50 cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending message for non-leader */}
      {!isLeader && isCurrentUserPending && (
        <div className="mb-6">
          <p className="text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            Your join request is pending leader approval
          </p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      {/* Leave Team (approved non-leader) */}
      {!isLeader && isCurrentUserApproved && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
          >
            Leave Group
          </button>
        </div>
      )}

      {/* DELETE TEAM MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={22} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 cursor-pointer">
                Delete Team?
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              You are the only member in this team.
              Deleting will permanently remove the team.
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 cursor-pointer">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteTeam}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700
                          cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE TEAM MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 cursor-pointer">
          <div className="bg-white rounded-xl p-6 w-[360px] shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              {isCurrentUserPending
                ? "Are you sure you want to cancel your join request?"
                : "Are you sure you want to leave the group?"}
            </h3>

            <div className="flex justify-center gap-4 cursor-pointer">
              <button
                onClick={handleLeaveTeam}
                className={`${
                  isCurrentUserPending
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white px-6 py-2 rounded-lg`}
              >
                Yes
              </button>

              <button
                onClick={() => setShowLeaveModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
