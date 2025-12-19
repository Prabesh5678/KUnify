import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Clock,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ADD THIS

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [teamStatus, setTeamStatus] = useState("Not Joined");
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch team status on page load
  useEffect(() => {
    const fetchTeamStatus = async () => {
      try {
        const res = await axios.get("/api/student/team", {
          withCredentials: true,
        });

        if (res.data?.success) {
          if (res.data.hasTeam) {
            setTeamStatus("Joined");
            setTeamName(res.data.team.name);
          } else {
            setTeamStatus("Not Joined");
            setTeamName("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch team status:", err);
        setTeamStatus("Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamStatus();
  }, []);

  // Team status icon and color
  const getTeamStatusInfo = () => {
    if (teamStatus === "Joined") {
      return {
        icon: <CheckCircle className="text-green-600" size={28} />,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        statusText: "Joined",
      };
    } else if (teamStatus === "Not Joined") {
      return {
        icon: <XCircle className="text-red-600" size={28} />,
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        statusText: "Not Joined",
      };
    } else {
      return {
        icon: <Users className="text-gray-600" size={28} />,
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        statusText: "Loading...",
      };
    }
  };

  const teamInfo = getTeamStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Top Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Team Status Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${teamInfo.bgColor} rounded-xl`}>
                {teamInfo.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Status</p>
                {isLoading ? (
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div>
                    <p
                      className={`text-lg font-bold ${teamInfo.textColor} mb-1`}
                    >
                      {teamInfo.statusText}
                    </p>
                    {teamName && (
                      <p className="text-sm text-gray-600 truncate max-w-[150px]">
                        {teamName}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Supervisor Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="text-purple-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Supervisor</p>
                <p className="text-lg font-bold text-orange-600">Pending</p>
              </div>
            </div>
          </div>

          {/* Hours Logged Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="text-blue-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Logged</p>
                <p className="text-lg font-bold text-gray-800">6 hours</p>
              </div>
            </div>
          </div>

          {/* Log Entries Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="text-orange-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Log Entries</p>
                <p className="text-lg font-bold text-gray-800">2 entries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Quick Actions + Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Quick Actions
            </h2>
            <div className="space-y-4">
              {/* Note: We removed the team button from here since team is managed via + button */}
              <button
                onClick={() => navigate("/student/requestsupervisor")}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FileText className="text-purple-600" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      Request Supervisor
                    </p>
                    <p className="text-sm text-gray-500">
                      Submit supervisor request
                    </p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate("/student/logsheet")}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Plus className="text-blue-600" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Add Log Entry</p>
                    <p className="text-sm text-gray-500">Update your logsheet</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Upcoming Deadlines
            </h2>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <AlertCircle className="text-orange-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Team Formation
                    </p>
                    <p className="text-sm text-gray-600">Week 2</p>
                  </div>
                </div>
                <span className="bg-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <AlertCircle className="text-orange-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Supervisor Request
                    </p>
                    <p className="text-sm text-gray-600">Week 3</p>
                  </div>
                </div>
                <span className="bg-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                <Calendar className="text-gray-500" size={22} />
                <div>
                  <p className="font-medium text-gray-700">
                    First Progress Report
                  </p>
                  <p className="text-sm text-gray-500">Week 7</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                <Calendar className="text-gray-500" size={22} />
                <div>
                  <p className="font-medium text-gray-700">Final Submission</p>
                  <p className="text-sm text-gray-500">Week 14</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;