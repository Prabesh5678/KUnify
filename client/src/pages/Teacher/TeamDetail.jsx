import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ExternalLink, User, FileText, ChevronDown, ChevronUp } from "lucide-react";

axios.defaults.withCredentials = true;

export default function TeamDetails() {
  const location = useLocation();
  const [team, setTeam] = useState(location.state?.team || null);
  const [proposal, setProposal] = useState(null);

  const [logsheets, setLogsheets] = useState([]);
  const [logsheetsLoading, setLogsheetsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [allWeeks, setAllWeeks] = useState([]);

  const [activeTab, setActiveTab] = useState("team");
  const [loading, setLoading] = useState(!team);
  const [error, setError] = useState("");
  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [isProposalOpen, setIsProposalOpen] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(true);

  useEffect(() => {
    const fetchFullTeam = async () => {
      if (!team?._id) return;
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/team/${team._id}`, { withCredentials: true });
        if (data.success) {
          setTeam(data.team);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch team");
      } finally {
        setLoading(false);
      }
    };
    fetchFullTeam();
  }, [team?._id]);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!team?._id) return;
      try {
        const { data } = await axios.get(`/api/proposal/${team._id}`, { withCredentials: true });
        if (data?.success && data.team?.proposal) {
          setProposal(data.team.proposal);
        }
      } catch (err) {
        console.error("Error fetching proposal:", err);
      }
    };
    fetchProposal();
  }, [team]);


  useEffect(() => {
    if (!team?._id) return;

    const fetchLogsheets = async () => {
      try {
        setLogsheetsLoading(true);
        const params = {};
        if (selectedStudent !== "all") params.studentId = selectedStudent;
        if (selectedWeek !== "all") params.week = selectedWeek;

        const { data } = await axios.get(`/api/teacher/teams/${team._id}/logsheets`, { params });

        if (data.success) {
          const formattedLogs = data.data.map(log => ({
            ...log,
            week: log.week?.toString() || "1",
            activity: log.activity || "No activity",
            outcome: log.outcome || "No outcome",
            createdBy: log.memberId || { name: "Unknown" },
            createdAt: log.createdAt,
          }));

          setLogsheets(formattedLogs);

          const weeks = [...new Set(formattedLogs.map(log => log.week))].sort(
            (a, b) => Number(a) - Number(b)
          );
          setAllWeeks(weeks);
        }
      } catch (err) {
        console.error("Error fetching logsheets:", err);
      } finally {
        setLogsheetsLoading(false);
      }
    };

    fetchLogsheets();
  }, [team?._id, selectedStudent, selectedWeek]);

  const handleViewProposal = () => {
  if (!proposal?.proposalFile?.url) return;

  // Use Google Docs Viewer
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(proposal.proposalFile.url)}&embedded=true`;
  window.open(viewerUrl, "_blank");
};


  const allMembers = team?.members || [];

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 mt-10 text-center">{error}</div>;
  if (!team) return <div className="text-center mt-10 text-red-500">No team data. Please go back and select a team.</div>;

  const SectionHeader = ({ title, isOpen, toggle }) => (
    <div
      onClick={toggle}
      className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </div>
  );

  return (
    <div className="h-screen bg-gray-50 flex">
      <div className="flex-1 overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex-1 overflow-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-pink-600">{team.name}</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setActiveTab("team")}
                className={`cursor-pointer px-5 py-2 rounded-xl font-medium shadow-md transition ${activeTab === "team" ? "bg-blue-600 text-white shadow-blue-200" : "bg-white text-gray-600 hover:shadow-lg"}`}
              >
                Team Details
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`cursor-pointer px-5 py-2 rounded-xl font-medium shadow-md transition ${activeTab === "logs" ? "bg-blue-600 text-white shadow-blue-200" : "bg-white text-gray-600 hover:shadow-lg"}`}
              >
                Logsheets
              </button>
            </div>

            {/* Content */}
            <div className="mt-6 h-full overflow-auto pr-2">

              {/* TEAM DETAILS TAB */}
              {activeTab === "team" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Project Details */}
                  <div className="rounded-xl border border-purple-200 p-5 shadow-sm">
                    <h2 className="font-bold text-lg text-blue-700">Project Details</h2>
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-600">Project Title</h3>
                      <p className="text-gray-700">{proposal?.projectTitle || "N/A"}</p>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-600">Abstract</h3>
                      <p className="text-gray-700">{proposal?.abstract || "N/A"}</p>
                    </div>
                    {proposal?.proposalFile?.url && (
                      <div className="mt-4">
                        <button
                          onClick={handleViewProposal}
                          className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          View Proposal PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Team Members */}
                  <div className="rounded-xl border border-blue-200 p-5 shadow-sm">
                    <h2 className="font-bold text-lg text-blue-700">Team Members</h2>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {allMembers.map((member, idx) => (
                        <div key={member._id || idx} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                          <User size={16} className="text-blue-600 inline mr-2" />
                          <span className="font-semibold text-gray-700">{member.name || "Unknown"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* LOGSHEETS TAB */}
              {activeTab === "logs" && (
                <>
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-[200px]">
                      <label>Filter by Student</label>
                      <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full border px-3 py-2 rounded cursor-pointer"
                      >
                        <option value="all">All Students</option>
                        {allMembers.map(m => (
                          <option key={m._id} value={m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label>Filter by Week</label>
                      <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(e.target.value)}
                        className="w-full border px-3 py-2 rounded cursor-pointer"
                      >
                        <option value="all">All Weeks</option>
                        {allWeeks.map(w => (
                          <option key={w} value={w}>Week {w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="rounded-xl border border-green-200 p-5 shadow-sm">
                    {logsheetsLoading ? (
                      <p>Loading logs...</p>
                    ) : logsheets.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded">
                        <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>No logs found</p>
                      </div>
                    ) : (
                      logsheets.map((log, index) => (
                        <div key={index} className="border p-4 rounded bg-yellow-50 mb-3">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Week {log.week}</span>
                          <p className="font-semibold mt-1">{log.createdBy?.name || "Unknown"}</p>
                          <p className="text-sm">{log.activity}</p>
                          <p className="text-sm">{log.outcome}</p>
                          <p className="text-xs text-gray-500 mt-1">Logged on: {new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
