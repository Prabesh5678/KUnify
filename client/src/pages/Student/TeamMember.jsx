import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const StudentTeamMembers = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [team, setTeam] = useState({
    teamName: "Team Name",
    createdBy: "",
    supervisor: null,
    members: [],
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const isCreator = team.createdBy === user?._id;

  /* ================= FETCH TEAM ================= */
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get(`/api/team/${teamId}`, {
          withCredentials: true,
        });

        if (data.success) {
          setTeam({
            teamName: data.team.name,
            createdBy: data.team.leaderId?._id,
            supervisor: data.team.supervisor || null,
            members: data.team.members.map((member) => ({
              _id: member._id,
              student: member,
              status: member.status || "approved",
            })),
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load team data");
      }
    };

    fetchTeam();
  }, [teamId]);

  /* ================= LEAVE TEAM ================= */
  const handleLeaveTeam = async () => {
    try {
      const { data } = await axios.post(
        "/api/team/leave",
        {},
        { withCredentials: true }
      );

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

  /* ================= MEMBER ACTION ================= */
  const handleMemberAction = async (memberId, action) => {
    try {
      const { data } = await axios.post(
        `/api/team/${teamId}/approve`,
        { memberId, action },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        setTeam((prev) => ({
          ...prev,
          members: prev.members.map((m) =>
            m._id === memberId
              ? { ...m, status: action === "approve" ? "approved" : "declined" }
              : m
          ),
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update member");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* TEAM HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{team.teamName}</h1>
          <p className="text-gray-600 text-lg mt-1">
            Supervisor: {team.supervisor ? team.supervisor.name : "Not assigned yet"}
          </p>
        </div>

        {/* APPROVED MEMBERS */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Approved Members</h2>
          {team.members
            .filter((m) => m.status === "approved")
            .map((member, index) => (
              <div
                key={member._id}
                className="flex justify-between items-center rounded-xl px-4 py-3 mb-3
                           bg-gradient-to-r from-orange-50 to-amber-100 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {index + 1}. {member.student.name}
                  </p>
                  <p className="text-sm text-gray-600">{member.student.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    member._id === team.createdBy
                      ? "bg-purple-200 text-purple-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {member._id === team.createdBy ? "Leader" : "Approved"}
                </span>
              </div>
            ))}
        </div>

        {/* LEAVE TEAM */}
        <div className="mt-8 border-t pt-8 flex justify-end">
          <button
            onClick={() => setShowLeaveModal(true)}
            className="w-40 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
          >
            Leave Team
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to leave the team?</h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLeaveTeam}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-4 rounded-lg font-semibold"
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

export default StudentTeamMembers;
