import { Users, Clock} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TeacherDashboard({ onStatsRefresh }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    {
      label: "Total Teams",
      value: 0,
      icon: Users,
      cardBg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Pending Requests",
      value: 0,
      icon: Clock,
      cardBg: "bg-orange-50",
      iconBg: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ]);

 
  const fetchStats = async () => {
    try {
      // Fetch all team requests
        const { data: pendingData } = await axios.get(
          "/api/teacher/teams?get=request",
          { withCredentials: true }
        );

        // Fetch all assigned/approved teams
        const { data: assignedData } = await axios.get(
          "/api/teacher/teams?get=assigned",
          { withCredentials: true }
        );

        const pendingRequests = pendingData?.teams?.length || 0;
    const totalTeams = assignedData?.teams?.length || 0;

      setStats([
        { label: "Total Teams", value: totalTeams, icon: Users, cardBg: "bg-blue-50", iconBg: "bg-blue-100", textColor: "text-blue-600" },
        { label: "Pending Requests", value: pendingRequests, icon: Clock, cardBg: "bg-orange-50", iconBg: "bg-orange-100", textColor: "text-orange-600" },
      ]);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    }
  };

useEffect(() => {
  fetchStats();
      if (onStatsRefresh) onStatsRefresh(fetchStats); 
}, []);

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
                <h2 className={`text-3xl font-bold mt-1 ${item.textColor}`}>
                  {item.value}
                </h2>
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

    </div>
  );
}