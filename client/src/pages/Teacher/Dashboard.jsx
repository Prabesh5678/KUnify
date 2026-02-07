import { Users, Clock, FileText, CheckCircle, FolderKanban, Bell, AlertCircle, } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [statsData, setStatsData] = useState({
    totalTeams: 0,
    pendingRequests: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/teacher/teams?get=all", {
          withCredentials: true,
        });
        if (data?.success) {
          const assignedTeams = data.teams?.assignedTeams || [];
          const pendingTeams = data.teams?.pendingTeams || [];

          setStatsData({
            totalTeams: assignedTeams.length,
            pendingRequests: pendingTeams.length,
          });
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /* Stats Data */
  const stats = [
    {
      label: "Total Teams",
      value: statsData.totalTeams,
      icon: Users,
      cardBg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Pending Requests",
      value: statsData.pendingRequests,
      icon: Clock,
      cardBg: "bg-orange-50",
      iconBg: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back! Here's what's happening with your team projects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow ${item.cardBg}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>

                {loading ? (
                  <div className="animate-pulse bg-gray-200 rounded h-8 w-16 mt-1"></div>
                ) : (
                  <h2 className={`text-3xl font-bold mt-1 ${item.textColor}`}>
                    {item.value}
                  </h2>
                )}
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg}`}
              >
                <item.icon className={`${item.textColor} w-6 h-6`} />
              </div>
            </div>
          </div>
        ))}
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={() => navigate("/teacher/projects")}
                    className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                               bg-gradient-to-r from-purple-50 to-purple-100 transition transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-purple-200 rounded-xl">
                        <FolderKanban className="text-purple-700" size={26} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Team Projects</p>
                        <p className="text-sm text-gray-600">
                         Review project proposals and track team progress through logsheets
                        </p>
                      </div>
                    </div>
                    <span className="text-xl text-purple-700">→</span>
                  </button>
        
                  <button
                    onClick={() => navigate("/teacher/deficits")}
                    className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                               bg-gradient-to-r from-green-50 to-green-100 transition transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-green-200 rounded-xl">
                        <AlertCircle className="text-green-700" size={26} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Team Deficits</p>
                        <p className="text-sm text-gray-600">
                          Teams with missing logsheets or rejected proposals.
                        </p>
                      </div>
                    </div>
                    <span className="text-xl text-green-700">→</span>
                  </button>
        
                  <button
                    onClick={() => navigate("/teacher/requests")}
                    className="w-full rounded-2xl p-5 shadow-sm hover:shadow-md flex justify-between items-center
                               bg-gradient-to-r from-orange-50 to-orange-100 transition transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-orange-200 rounded-xl">
                        <Bell className="text-orange-700" size={26} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800">Team Requests</p>
                        <p className="text-sm text-gray-600">
                          Review and manage incoming team project requests.
                        </p>
                      </div>
                    </div>
                    <span className="text-xl text-orange-700">→</span>
                  </button>
                </div>
    </div>
  );
}