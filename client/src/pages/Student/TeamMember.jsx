import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const StudentTeamMembers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // FETCH TEAM FROM BACKEND
  // ----------------------------
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/team/${teamId}`, {
          withCredentials: true,
        });

        if (data.success) {
          setTeam(data.team);
        } else {
          toast.error(data.message || "Failed to fetch team");
          setTeam(null);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching team");
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId]);

  // ----------------------------
  // MOCK DATA (for reference / testing only)
  // ----------------------------
  /*
  useEffect(() => {
    const mockTeam = {
      _id: teamId,
      teamName: "Project KUnify",
      createdBy: "user_1", // leader
      members: [
        { _id: "m1", student: { _id: "user_1", name: "Deekshya Badal" }, status: "approved" },
        { _id: "m2", student: { _id: "user_2", name: "Subehchha Karki" }, status: "pending" },
        { _id: "m3", student: { _id: "user_3", name: "Prabesh Acharya" }, status: "pending" },
      ],
    };

    setTeam(mockTeam);
    setLoading(false);
  }, [teamId]);
  */

  const isCreator = team?.createdBy === user?._id;

  // ----------------------------
  // HANDLERS
  // ----------------------------
  const handleApprove = async (memberId) => {
    const approvedCount = team.members.filter((m) => m.status === "approved").length;
    if (approvedCount >= 5) {
      toast.error("Team is full! Cannot approve more members");
      return;
    }

    try {
      const { data } = await axios.patch(`/api/team/${teamId}/approve/${memberId}`, {}, {
        withCredentials: true,
      });

      if (data.success) {
        setTeam((prev) => ({
          ...prev,
          members: prev.members.map((m) =>
            m._id === memberId ? { ...m, status: "approved" } : m
          ),
        }));
        toast.success("Member approved");
      } else {
        toast.error(data.message || "Failed to approve member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error approving member");
    }
  };

  const handleReject = async (memberId) => {
    try {
      const { data } = await axios.delete(`/api/team/${teamId}/reject/${memberId}`, {
        withCredentials: true,
      });

      if (data.success) {
        setTeam((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m._id !== memberId),
        }));
        toast.success("Member rejected");
      } else {
        toast.error(data.message || "Failed to reject member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rejecting member");
    }
  };

  const handleLeaveTeam = async () => {
    try {
      const { data } = await axios.post(`/api/team/${teamId}/leave`, {}, {
        withCredentials: true,
      });

      if (data.success) {
        toast.success("You left the team");
        navigate("/student/home");
      } else {
        toast.error(data.message || "Failed to leave team");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error leaving team");
    }
  };

  // ----------------------------
  // LOADING / ERROR STATES
  // ----------------------------
  if (loading) return <div className="p-6 text-center text-gray-500">Loading team...</div>;
  if (!team) return <div className="p-6 text-center text-gray-500">Team not found</div>;

  // Sort members: approved first, then pending by request order
  const sortedMembers = [
    ...team.members.filter(m => m.status === "approved"),
    ...team.members.filter(m => m.status === "pending"),
  ];

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
          {sortedMembers.map((member, index) => (
            <div
              key={member._id}
              className="flex justify-between items-center border rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition"
            >
              {/* LEFT: Name + Order */}
              <div>
                <p className="font-medium text-gray-800">
                  {index + 1}. {member.student.name}
                </p>
              </div>

              {/* RIGHT: Status / Actions */}
              <div className="flex gap-2 items-center">
                {member.status === "approved" && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">
                    APPROVED
                  </span>
                )}

                {member.status === "pending" && isCreator && team.members.filter(m => m.status === "approved").length < 5 ? (
                  <>
                    <button
                      onClick={() => handleApprove(member._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-600 transition"
                    >
                      ACCEPT
                    </button>
                    <button
                      onClick={() => handleReject(member._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600 transition"
                    >
                      DECLINE
                    </button>
                  </>
                ) : member.status === "pending" ? (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                    PENDING
                  </span>
                ) : null}
              </div>
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
