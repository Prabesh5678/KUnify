/*import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, FileText } from "lucide-react";
import axios from "axios";

const deficitTeams = [
  {
    id: 1,
    name: "Team Delta",
    members: ["A", "B", "C"],
    workTitle: "Week 2–3 Progress Logs",
    project: "Web Development",
    missingCount: 8,
    overdueDays: 11,
    proposalStatus: "pending", 
  },
  {
    id: 2,
    name: "Team Epsilon",
    members: ["D", "E", "F"],
    workTitle: "Incomplete proposal",
    project: "Ecommerce Platform",
    missingCount: 0,
    overdueDays: 0,
    proposalStatus: "rejected",
  },
];

export default function TeamDeficit() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  /*const [deficitTeams, setDeficitTeams] = useState([]);
  const [error, setError] = useState("");

   useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/teams/deficit"); 
        setDeficitTeams(res.data); 
        
      } catch (err) {
        setError("Failed to load team data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);
  */
 /*

  const totalMissingLogs = deficitTeams.reduce(
    (sum, team) => sum + team.missingCount,
    0
  );

  const rejectedTeamsCount = deficitTeams.filter(
    (team) => team.proposalStatus === "rejected"
  ).length;

  const statsCards = [
    {
      label: "Missing Log Entries",
      value: totalMissingLogs,
      icon: FileText,
      cardBg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      filter: "missing",
    },
    {
      label: "Rejected Proposals",
      value: rejectedTeamsCount,
      icon: AlertCircle,
      cardBg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      filter: "rejected",
    },
  ];

  const visibleTeams = deficitTeams.filter((team) => {
    if (activeFilter === "missing") return team.missingCount > 0;
    if (activeFilter === "rejected")
      return team.proposalStatus === "rejected";
    return true;
  });


  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-3xl font-bold">Team Deficits</h1>
      <p className="text-gray-500 mt-1">
        Teams with missing logsheets or rejected proposals.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
        {statsCards.map((item, index) => (
          <div
            key={index}
            onClick={() => setActiveFilter(item.filter)}
            className={`cursor-pointer rounded-2xl p-5 shadow-md hover:shadow-lg transition
              ${item.cardBg}
              ${
                activeFilter === item.filter
                  ? "ring-2 ring-offset-2 ring-gray-400"
                  : ""
              }
            `}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {visibleTeams.map((team) => {
          const isRejected = team.proposalStatus === "rejected";

          return (
            <div
              key={team.id}
              className={`rounded-2xl p-5 shadow-md hover:shadow-lg transition
                ${
                  isRejected
                    ? "bg-red-50 border border-red-200"
                    : "bg-white"
                }
              `}
            >

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{team.name}</h3>
                  <p className="text-sm text-gray-500">
                    {team.members.join(", ")}
                  </p>
                </div>

                {isRejected && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                    Proposal Rejected
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <p className="text-sm font-medium">{team.workTitle}</p>
                <p className="text-xs text-gray-500 mt-1">{team.project}</p>

                {isRejected ? (
                  <p className="text-sm text-red-700 mt-2 font-medium">
                    Rejected Proposal.
                  </p>
                ) : (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Missing log entries
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                {!isRejected && (
                  <p className="text-sm text-red-600 font-medium">
                    {team.overdueDays} days overdue
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
*/