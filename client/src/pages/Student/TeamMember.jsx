{/*
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
    _id: teamId,
    teamName: "Team Name Placeholder",
    createdBy: user?._id,
    members: [
      { _id: user?._id, student: user, status: "approved" }
    ],
  });
  const [loading, setLoading] = useState(false);

  const isCreator = team?.createdBy === user?._id;

  // Fetch latest team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get(`/api/team/${teamId}`, { withCredentials: true });
        if (data.success) setTeam(data.team);
      } catch (err) {
        console.error("Error fetching team:", err);
        toast.error("Failed to load team data");
      }
    };
    fetchTeam();
  }, [teamId]);

  // Handle Leave Team
  const handleLeaveTeam = async () => {
    try {
      const { data } = await axios.post(
        "/api/team/leave",
        { teamId: team._id },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("You left the team");
        navigate("/student/home");
      } else {
        toast.error(data.message || "Failed to leave team");
      }
    } catch (err) {
      console.error("Error leaving team:", err);
      toast.error("Error leaving team");
    }
  };

  // Handle Approve / Decline (Leader)
  const handleMemberAction = async (memberId, action) => {
    try {
      const { data } = await axios.post(
        `/api/team/${team._id}/approve`,
        { memberId, action },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        // Update local state
        setTeam(prev => ({
          ...prev,
          members: prev.members.map(m =>
            m._id === memberId ? { ...m, status: action === "approve" ? "approved" : "declined" } : m
          )
        }));
      }
    } catch (err) {
      console.error("Error updating member:", err);
      toast.error("Failed to update member status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
      
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{team.teamName}</h1>
          <p className="text-gray-500 text-sm mt-1">Team Members</p>
        </div>

        {isCreator && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pending Requests</h2>
            {team.members.filter(m => m.status === "pending").length === 0 ? (
              <p className="text-gray-500">No pending requests.</p>
            ) : (
              team.members
                .filter(member => member.status === "pending")
                .map(member => (
                  <div
                    key={member._id}
                    className="flex justify-between items-center border rounded-lg px-4 py-3 shadow-sm mb-2"
                  >
                    <p className="font-medium text-gray-800">{member.student.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMemberAction(member._id, "approve")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleMemberAction(member._id, "decline")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

       
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Approved Members</h2>
          {team.members.filter(m => m.status === "approved").map((member, index) => (
            <div
              key={member._id}
              className="flex justify-between items-center border rounded-lg px-4 py-3 shadow-sm mb-2"
            >
              <p className="font-medium text-gray-800">{index + 1}. {member.student.name}</p>
              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${
                  member._id === team.createdBy
                    ? "bg-blue-100 text-blue-800" // leader styling
                    : "bg-green-100 text-green-800"
                }`}
              >
                {member._id === team.createdBy ? "Leader" : "Approved"}
              </span>
            </div>
          ))}
        </div>

      
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
*/
}
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
    _id: teamId,
    teamName: "Team Name Placeholder",
    createdBy: user?._id,
    supervisor: null, // fetched supervisor
    members: [
      { _id: user?._id, student: user, status: "approved" }
    ],
  });

  const isCreator = team?.createdBy === user?._id;

  // Fetch latest team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get(`/api/team/${teamId}`, { withCredentials: true });
        if (data.success) setTeam(data.team);
      } catch (err) {
        console.error("Error fetching team:", err);
        toast.error("Failed to load team data");
      }
    };
    fetchTeam();
  }, [teamId]);

  // Leave Team
  const handleLeaveTeam = async () => {
    try {
      const { data } = await axios.post(
        "/api/team/leave",
        { teamId: team._id },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("You left the team");
        navigate("/student/home");
      } else {
        toast.error(data.message || "Failed to leave team");
      }
    } catch (err) {
      console.error("Error leaving team:", err);
      toast.error("Error leaving team");
    }
  };

  // Approve / Decline member (leader)
  const handleMemberAction = async (memberId, action) => {
    try {
      const { data } = await axios.post(
        `/api/team/${team._id}/approve`,
        { memberId, action },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        // Update local state
        setTeam(prev => ({
          ...prev,
          members: prev.members.map(m =>
            m._id === memberId ? { ...m, status: action === "approve" ? "approved" : "declined" } : m
          )
        }));
      }
    } catch (err) {
      console.error("Error updating member:", err);
      toast.error("Failed to update member status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">

        {/* TEAM HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{team.teamName}</h1>
          <p className="text-black-500 text-lg mt-1">
            Supervisor: {team.supervisor ? team.supervisor.name : "Not assigned yet"}
          </p>
        </div>

        {/* Pending Requests (Leader only) */}
        {isCreator && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pending Requests</h2>
            {team.members.filter(m => m.status === "pending").length === 0 ? (
              <p className="text-gray-500">No pending requests.</p>
            ) : (
              team.members
                .filter(member => member.status === "pending")
                .map(member => (
                  <div
                    key={member._id}
                    className="flex justify-between items-center border rounded-lg px-4 py-3 shadow-sm mb-2"
                  >
                    <p className="font-medium text-gray-800">{member.student.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMemberAction(member._id, "approve")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleMemberAction(member._id, "decline")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Approved Members */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Approved Members</h2>
          {team.members.filter(m => m.status === "approved").map((member, index) => (
            <div
              key={member._id}
              className="flex justify-between items-center border rounded-lg px-4 py-3 shadow-sm mb-2"
            >
              <p className="font-medium text-gray-800">{index + 1}. {member.student.name}</p>
              <span
                className={`px-3 py-1 rounded text-sm font-semibold ${member._id === team.createdBy
                    ? "bg-blue-100 text-blue-800" // leader styling
                    : "bg-green-100 text-green-800"
                  }`}
              >
                {member._id === team.createdBy ? "Leader" : "Approved"}
              </span>
            </div>
          ))}
        </div>

        {/* LEAVE TEAM BUTTON */}
        <div className="mt-8 border-t pt-8 flex justify-end">
          <button
            onClick={handleLeaveTeam}
            className="w-40 bg-red-800 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-lg transition"
          >
            Leave Team
          </button>
        </div>




      </div>
    </div>
  );
};

export default StudentTeamMembers;
