import { useState } from "react";
import { CheckCircle, Clock, Users, FileText, Search } from "lucide-react";

const stats = [
  {
    label: "Total Teams",
    value: 1,
    icon: Users,
    cardBg: "bg-blue-50",
    iconBg: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    label: "Pending Proposals",
    value: 1,
    icon: FileText,
    cardBg: "bg-orange-50",
    iconBg: "bg-orange-100",
    textColor: "text-orange-600",
  },
  {
    label: "Approved Projects",
    value: 1,
    icon: CheckCircle,
    cardBg: "bg-green-50",
    iconBg: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    label: "Total Logsheet Entries",
    value: 15,
    icon: Clock,
    cardBg: "bg-purple-50",
    iconBg: "bg-purple-100",
    textColor: "text-purple-600",
  },
];


const teams = [
  {
    name: "Team Alpha",
    project: "E-Learning Platform",
    members: 5,
    category: "Web Development",
    logs: 15,
    status: "pending",
    proposed: "2025-12-28",
    updated: "2025-12-30",
  },
];

export default function TeacherProjects() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [tab, setTab] = useState("teams");

  return (
    <div className="flex flex-col h-full w-full p-6">
      {/* Title */}
      <h1 className="text-3xl font-bold">Team Projects</h1>
      <p className="text-gray-500 mt-1">
        Review project proposals and track team progress through logsheets
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`rounded-2xl p-5 
                  shadow-md hover:shadow-lg 
                  transition-shadow duration-300
                  ${item.cardBg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <h2 className={`text-3xl font-bold mt-1 ${item.textColor}`}>
                  {item.value}
                </h2>
              </div>

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                <item.icon className={`${item.textColor} w-6 h-6`} />
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Search + Tabs */}
      <div className="flex justify-between items-center mt-8">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search teams"
            className="cursor-pointer bg-white rounded-2xl pl-10 py-2
           shadow-md hover:shadow-lg transition-shadow"

          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setTab("teams")}
            className={`px-5 py-2 rounded-xl font-medium shadow-md transition ${tab === "teams"
                ? "bg-blue-600 text-white shadow-blue-200"
                : "bg-white text-gray-600 hover:shadow-lg"
              }`}
          >
            Teams
          </button>
          <button
            onClick={() => setTab("logsheets")}
            className={`px-5 py-2 rounded-xl font-medium shadow-md transition ${tab === "logsheets"
                ? "bg-blue-600 text-white shadow-blue-200"
                : "bg-white text-gray-600 hover:shadow-lg"
              }`}
          >
            Logsheets
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Left section: team cards */}
        <div className="space-y-4">
          {teams.map((team, index) => (
            <div
              key={index}
              onClick={() => setSelectedTeam(team)}
              className="cursor-pointer bg-white rounded-2xl p-5 
           shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg">{team.name}</h2>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${team.status === "approved" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                    }`}>
                  {team.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{team.project}</p>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>👥 {team.members} members</p>
                <p>📄 {team.category}</p>
                <p>⏱ {team.logs} logsheet entries</p>
              </div>

              <div className="mt-3 text-xs flex justify-between text-gray-400">
                <span>Proposed: {team.proposed}</span>
                <span>Last update: {team.updated}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right section: details */}
        <div className="rounded-2xl bg-white shadow-md 
           flex items-center justify-center"
        >
          {!selectedTeam ? (
            <div className="text-center text-gray-400">
              <FileText className="w-14 h-14 mx-auto mb-3" />
              Select a team project to view details
            </div>
          ) : (
            <div className="p-6 w-full">
              <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
              <p className="text-gray-500">{selectedTeam.project}</p>
              <hr className="my-4" />
              <p>Members: {selectedTeam.members}</p>
              <p>Category: {selectedTeam.category}</p>
              <p>Logsheets: {selectedTeam.logs}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
