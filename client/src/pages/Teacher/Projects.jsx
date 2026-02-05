import { useState, useEffect } from "react";
import { CheckCircle, Clock, Users, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function TeacherProjects() {
  const navigate = useNavigate();
  //const [selectedTeam, setSelectedTeam] = useState(null);
  //const [tab, setTab] = useState("teams");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState([
    { label: "Total Teams", value: 0, icon: Users, cardBg: "bg-blue-50", iconBg: "bg-blue-100", textColor: "text-blue-600" },
    { label: "Pending Teams", value: 0, icon: FileText, cardBg: "bg-orange-50", iconBg: "bg-orange-100", textColor: "text-orange-600" },
    { label: "Approved Projects", value: 0, icon: CheckCircle, cardBg: "bg-green-50", iconBg: "bg-green-100", textColor: "text-green-600" },
    { label: "Total Logsheet Entries", value: 0, icon: Clock, cardBg: "bg-purple-50", iconBg: "bg-purple-100", textColor: "text-purple-600" },
  ]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await axios.get("/api/teacher/teams?get=all");
        console.log(data)
        if(data.success){
        const teamList = data?.teams || [];
        setTeams(teamList.assignedTeams);
        const totalTeams = teamList.assignedTeams.length;
        const pendingProposals = teamList.pendingTeams.length;
        const approvedProjects = teamList.approvedTeams.length;
        // const totalLogs = teamList.reduce((sum, t) => sum + t.logs, 0);
        const totalLogs=1;

        setStats([
          { label: "Total  Teams", value: totalTeams, icon: Users, cardBg: "bg-blue-50", iconBg: "bg-blue-100", textColor: "text-blue-600" },
          { label: "Pending Teams", value: pendingProposals, icon: FileText, cardBg: "bg-orange-50", iconBg: "bg-orange-100", textColor: "text-orange-600" },
          { label: "Approved Projects", value: approvedProjects, icon: CheckCircle, cardBg: "bg-green-50", iconBg: "bg-green-100", textColor: "text-green-600" },
          { label: "Total Logsheet Entries", value: totalLogs, icon: Clock, cardBg: "bg-purple-50", iconBg: "bg-purple-100", textColor: "text-purple-600" },
        ]);}
        else{
          toast.error('Unable to fetch teams!')
          console.log('hi')
          console.error(data?.message);
        }
      } catch (err) {
        console.error("Failed to fetch teams:", err.stack);
        setError("Failed to load teams. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.project.toLowerCase().includes(search.toLowerCase())
  );

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


      {/* Search*/}
      <div className="flex justify-between items-center mt-8">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search teams or projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cursor-pointer bg-white rounded-2xl pl-10 py-2 shadow-md hover:shadow-lg transition-shadow w-full"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
       {error ? (
          <p className="text-center col-span-2 mt-10 text-red-500">{error}</p>
        ) : filteredTeams.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center">
            No teams found
          </p>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => navigate(`/teacher/teamdetails/${team.id}`)}
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
          ))
        )}
      </div>
    </div>
  );
}
