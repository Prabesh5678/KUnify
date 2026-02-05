import { Users, Clock, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* Stats Data */
const stats = [
  {
    label: "Total Teams",
    value: 12,
    icon: Users,
    cardBg: "bg-blue-50",
    iconBg: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    label: "Pending Requests",
    value: 5,
    icon: Clock,
    cardBg: "bg-orange-50",
    iconBg: "bg-orange-100",
    textColor: "text-orange-600",
  },
];

/* Requests */
const requests = [
  {
    team: "Team Alpha",
    desc: "AI • Attendance • Face Recognition",
    time: "5 mins ago",
    status: "pending",
  },
  {
    team: "Team Beta",
    desc: "Web • Security • Proctoring",
    time: "15 mins ago",
    status: "pending",
  },
];

export default function TeacherDashboard() {
  const navigate = useNavigate();
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
