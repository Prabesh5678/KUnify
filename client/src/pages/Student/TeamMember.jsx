import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const StudentTeamMembers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, leaveTeam } = useAppContext();

  // ----------------------------
  // MOCK DATA (REMOVE WHEN BACKEND READY)
  // ----------------------------
  useEffect(() => {
    const mockTeam = {
      _id: teamId,
      teamName: "Project KUnify", 
      createdBy: "user_1",
      members: [
        { _id: "m1", student: { _id: "user_1", name: "Deekshya Badal" }, status: "approved" },
        { _id: "m2", student: { _id: "user_2", name: "Subehchha Karki" }, status: "pending" },
        { _id: "m3", student: { _id: "user_3", name: "Prabesh Acharya"}, status: "approved" },
      ],
    };

    setTeam(mockTeam);
    setLoading(false);
  }, [teamId]);

  // ----------------------------
  // BACKEND FETCH (ENABLE LATER)
  // ----------------------------
  /*
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get(`/api/team/${teamId}`);
        if (data.success) setTeam(data.team);
      } catch (error) {
        toast.error("Failed to load team");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);
  */

  const isCreator = team?.createdBy === user?._id;

  // ----------------------------
  // HANDLERS
  // ----------------------------
  const handleApprove = (memberId) => {
    setTeam((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m._id === memberId ? { ...m, status: "approved" } : m
      ),
    }));
    toast.success("Member approved");

    // BACKEND:
    // await axios.patch(`/api/team/${teamId}/approve/${memberId}`);
  };

  const handleReject = (memberId) => {
    setTeam((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m._id !== memberId),
    }));
    toast.error("Member rejected");

    // BACKEND:
    // await axios.delete(`/api/team/${teamId}/reject/${memberId}`);
  };

  const handleLeaveTeam = async () => {
    toast.success("You left the team");
    navigate("/student/home");

    // BACKEND:
    // await leaveTeam(teamId);
    // navigate("/student/home");
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading team...</div>;
  if (!team) return <div className="p-6 text-center text-gray-500">Team not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">

        {/* TEAM HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{team.teamName}</h1>
          <p className="text-gray-500 text-sm mt-1">Team Members</p>
        </div>

        {/* MEMBERS LIST */}
        <div className="space-y-3">
          {team.members.map((member) => (
            <div
              key={member._id}
              className="flex justify-between items-center border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition"
            >
              {/* LEFT: Name + Status */}
              <div className="flex items-center gap-4">
                <p className="font-medium text-gray-800">{member.student.name}</p>
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    member.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {member.status.toUpperCase()}
                </span>
              </div>

              {/* RIGHT: Actions for creator */}
              {isCreator && member.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(member._id)}
                    className="w-24 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(member._id)}
                    className="w-24 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* LEAVE TEAM BUTTON */}
        <div className="mt-8 border-t pt-6">
          <button
            onClick={handleLeaveTeam}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold text-lg transition"
          >
            Leave Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTeamMembers;
