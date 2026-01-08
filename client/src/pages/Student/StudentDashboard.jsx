import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Copy,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { selectedSubject, user } = useAppContext();
  console.log(user._id)
  if (!user || !user._id) {
    toast.error('user not found')
    console.error('nothing')
    return;
  }
  const userId = user._id;

  const [teamStatus, setTeamStatus] = useState("Not Joined");
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamId, setTeamId] = useState(null);
  const [teamCode, setTeamCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchTeamStatus = async () => {
    try {
      const res = await axios.get(
        "/api/student/is-auth?populateTeam=true",
        { withCredentials: true }
      );

      if (res.data.success) {
        const team = res.data.student.teamId;

        if (team) {
          setTeamStatus("Joined");
          setTeamName(team.name);
          setTeamId(team._id);
          setTeamMembers(team.members || []);
          setTeamCode(team.code);
        } else {
          setTeamStatus("Not Joined");
          setTeamName("");
          setTeamId(null);
          setTeamMembers([]);
          setTeamCode(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch team status:", err);
      setTeamStatus("Error");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: run once
  useEffect(() => {
    fetchTeamStatus();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      toast.success("Team code copied!");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy team code");
    }
  };
  useEffect(() => {
    if (user?.teamId && user?.isApproved === false) {
      navigate("/student/waiting");
    }
  }, [user, navigate]);


  const getTeamStatusInfo = () => {
    if (teamStatus === "Joined") {
      return {
        icon: <CheckCircle className="text-green-600" size={28} />,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        statusText: "Joined",
      };
    }
    return {
      icon: <XCircle className="text-red-600" size={28} />,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      statusText: "Not Joined",
    };
  };

  const teamInfo = getTeamStatusInfo();


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto relative">

        {/* 🔝 TEAM CODE */}
        {teamCode && (
          <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-3 text-sm font-medium shadow">
            <span>Team Code:</span>
            <span className="font-mono tracking-wider">{teamCode}</span>
            <button
              onClick={handleCopy}
              className="hover:bg-blue-200 p-1 rounded transition"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Dashboard
        </h1>

        {/* STATUS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 border hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${teamInfo.bgColor} rounded-xl`}>
                {teamInfo.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Status</p>
                {isLoading ? (
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                ) : (
                  <>
                    <p className={`text-lg font-bold ${teamInfo.textColor}`}>
                      {teamInfo.statusText}
                    </p>
                    {teamName && (
                      <p className="text-sm text-gray-600 truncate">
                        {teamName}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl  ">
                <FileText className="text-purple-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Supervisor</p>
                <p className="text-lg font-bold text-orange-600">Pending</p>
              </div>
            </div>
          </div>

          <button
            disabled={!teamId}
            onClick={() => navigate(`/student/member/${teamId}`)}
            className={`bg-white rounded-2xl shadow-sm p-6 border flex items-center gap-4
              ${teamId ? "hover:shadow-md transition" : "opacity-60 cursor-not-allowed"}`}
          >
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="text-blue-600" size={28} />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-lg font-bold text-gray-800">
                {teamMembers.length} member{teamMembers.length !== 1 && "s"}
              </p>
            </div>
          </button>

          <button
            disabled={teamStatus !== "Joined"}
            onClick={() => navigate("/student/logsheet")}
            className={`bg-white rounded-2xl shadow-sm p-6 border flex items-center gap-4  transition text-left
    ${teamStatus === "Joined"
                ? "hover:shadow-md cursor-pointer"
                : "opacity-60 cursor-not-allowed"
              }`}
          >
            <div className="p-3 bg-orange-100 rounded-xl">
              <Calendar className="text-orange-600" size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Log Entries</p>
              <p className="text-xs text-gray-500">
                {teamStatus === "Joined"
                  ? "View & add logs"
                  : "Join a team first"}
              </p>
            </div>
          </button>
        </div>

        {/* ✅ QUICK ACTIONS — ONLY IF IN TEAM */}
        {teamStatus === "Joined" && (
          <div>
            <h2 className="text-xl font-bold mb-5">Quick Actions</h2>

            <button
              onClick={() => navigate("/student/guidelines")}
              className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                         bg-gradient-to-r from-orange-50 to-amber-100 mb-4"
            >
              <div className="flex gap-4">
                <div className="p-3 bg-orange-200 rounded-xl">
                  <Plus className="text-orange-700" size={26} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">See the Instructions</p>
                  <p className="text-sm text-gray-600">
                    Read the instructions carefully.
                  </p>
                </div>
              </div>
              <span className="text-xl text-orange-700">→</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate(`/student/requestsupervisor/${teamId}`)}
                className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                           bg-gradient-to-r from-purple-50 to-lavender-100"
              >
                <div className="flex gap-4">
                  <div className="p-3 bg-purple-200 rounded-xl">
                    <FileText className="text-purple-700" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Submit Proposal</p>
                    <p className="text-sm text-gray-600">
                      Submit after team formation
                    </p>
                  </div>
                </div>
                <span className="text-xl text-purple-700">→</span>
              </button>

              <button
                onClick={() => navigate(`/student/logsheet`)}
                className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                           bg-gradient-to-r from-orange-50 to-amber-100"
              >
                <div className="flex gap-4">
                  <div className="p-3 bg-orange-200 rounded-xl">
                    <Plus className="text-orange-700" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Add Log Entry</p>
                    <p className="text-sm text-gray-600">
                      Update your logsheet
                    </p>
                  </div>
                </div>
                <span className="text-xl text-orange-700">→</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;
