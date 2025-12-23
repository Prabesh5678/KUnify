import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const TeamMembers = () => {
  const { teamId } = useParams();
  const { user } = useAppContext();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  // 🔹 Fetch team details
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/team/${teamId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setTeam(res.data.team);
      } else {
        toast.error(res.data.message || "Failed to fetch team");
      }
    } catch (err) {
      toast.error("Failed to load team");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  //  Approve member (Leader only)
  const handleApprove = async (studentId) => {
    try {
      setApprovingId(studentId);
      const res = await axios.post(`/api/team/approve/${teamId}`, {
        studentId,
      });
      if (res.data.success) {
        toast.success("Member approved");
        fetchTeam(); // refresh data
      } else {
        toast.error(res.data.message || "Approval failed");
      }
    } catch (err) {
      toast.error("Approval failed");
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) return <p className="p-4">Loading team...</p>;
  if (!team) return <p className="p-4 text-red-500">Team not found</p>;

  //  Split members by status
  const approvedMembers =
    team.members?.filter((m) => m.status === "approved") || [];
  const pendingMembers =
    team.members?.filter((m) => m.status === "pending") || [];

  //  Check if current user is the leader
  const isLeader = team?.leader?._id === user?._id;

  //  Current user's membership
  const myMembership = team.members?.find(
    (m) => m.student?._id === user?._id
  );
  const myStatus = myMembership?.status;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h2 className="text-2xl font-bold mb-4">{team?.name || "Team"}</h2>

      {/* My status (pending member) */}
      {myStatus === "pending" && !isLeader && (
        <p className="mb-4 text-yellow-600 font-medium">
           Your join request is pending leader approval
        </p>
      )}

      {/*  Approved Members */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Approved Members ({approvedMembers.length})
        </h3>
        {approvedMembers.map((m, i) => (
          <div
            key={m.student?._id || i}
            className="flex justify-between items-center border p-2 rounded mb-2"
          >
            <span>{m.student?.name || "Unknown"}</span>
            <span className="text-green-600 font-medium">Approved</span>
          </div>
        ))}
        {approvedMembers.length === 0 && (
          <p className="text-gray-500">No approved members yet.</p>
        )}
      </div>

      {/* Pending Requests (Leader Only) */}
      {isLeader && pendingMembers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">
            Pending Requests ({pendingMembers.length})
          </h3>
          {pendingMembers.map((m) => (
            <div
              key={m.student?._id || Math.random()}
              className="flex justify-between items-center border p-2 rounded mb-2"
            >
              <span>{m.student?.name || "Unknown"}</span>
              <button
                onClick={() => handleApprove(m.student?._id)}
                disabled={approvingId === m.student?._id}
                className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                {approvingId === m.student?._id ? "Approving..." : "Approve"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/*  Message for members still pending */}
      {!isLeader && myStatus === "pending" && (
        <p className="text-sm text-gray-500 mt-4">
          You will be added to the team after leader approval.
        </p>
      )}
    </div>
  );
};

export default TeamMembers;
