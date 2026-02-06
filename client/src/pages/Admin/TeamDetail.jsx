import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { ExternalLink, FileText, ChevronDown, ChevronUp, User } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

const TeamDetail = () => {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [logsheets, setLogsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allWeeks, setAllWeeks] = useState([]); 

  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [isProposalOpen, setIsProposalOpen] = useState(true);
  const [isLogsheetOpen, setIsLogsheetOpen] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");

  // Fetch team info
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/admin/teams`);
        if (data.success) {
          const allTeams = [...data.assignedTeams, ...data.unassignedTeams];
          const selectedTeam = allTeams.find(t => t._id === teamId);
          setTeam(selectedTeam);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching team");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  // Fetch all logsheets whenever filters change or team is loaded
  useEffect(() => {
    if (!team) return;

    const fetchLogsheets = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedStudent !== "all") params.studentId = selectedStudent;
        if (selectedWeek !== "all") params.week = selectedWeek;

        const { data } = await axios.get(`/api/admin/teams/${teamId}/logsheets`, { params });

        if (data.success) {
          const formattedLogs = data.data.map(log => ({
            ...log,
            week: (log.logId?.week ?? log.week ?? "1").toString(),
            activity: log.logId?.activity || log.activity || "No activity",
            outcome: log.logId?.outcome || log.outcome || "No outcome",
            createdBy: log.createdBy || log.memberId,
            createdAt: log.createdAt || log.logId?.createdAt
          }));
          setLogsheets(formattedLogs);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching logsheets");
      } finally {
        setLoading(false);
      }
    };

    fetchLogsheets();
  }, [teamId, selectedStudent, selectedWeek, team]);

  // Fetch all weeks independently of student filter for dropdown
  useEffect(() => {
    if (!team) return;

    const fetchAllWeeks = async () => {
      try {
        const { data } = await axios.get(`/api/admin/teams/${teamId}/logsheets`);
        if (data.success) {
          const weeks = [
            ...new Set(
              data.data
                .map(log => log.logId?.week || log.week)
                .filter(Boolean)
                .map(String)
            )
          ].sort((a, b) => Number(a) - Number(b));
          setAllWeeks(weeks);
        }
      } catch (err) {
        console.error("Error fetching all weeks:", err);
      }
    };

    fetchAllWeeks();
  }, [team, teamId]);

  const handleViewPDF = (url) => {
    if (!url) return toast.error("PDF not found");
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  const allMembers = team?.members || [];

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!team) return <p className="p-6 text-center">No team data found.</p>;

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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <AdminHeader />
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Team Header */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
            {team.supervisor && (
              <p className="text-gray-600 mt-2">
                <b>Supervisor:</b> {team.supervisor.name} ({team.supervisor.email})
              </p>
            )}
          </div>

          {/* Members */}
          <SectionHeader
            title={`Team Members (${allMembers.length})`}
            isOpen={isTeamOpen}
            toggle={() => setIsTeamOpen(!isTeamOpen)}
          />
          {isTeamOpen && (
            <div className="bg-white p-6 rounded-xl shadow space-y-3">
              {allMembers.map(m => (
                <div key={m._id} className="border p-4 rounded bg-blue-50 hover:bg-blue-100">
                  <User size={18} className="text-blue-600" /> {m.name} ({m.email})
                </div>
              ))}
            </div>
          )}

          {/* Proposal */}
          {team.proposal && (
            <>
              <SectionHeader
                title="Project Proposal"
                isOpen={isProposalOpen}
                toggle={() => setIsProposalOpen(!isProposalOpen)}
              />
              {isProposalOpen && (
                <div className="bg-white p-6 rounded-xl shadow space-y-2">
                  <p><b>Title:</b> {team.proposal.projectTitle}</p>
                  <p><b>Abstract:</b> {team.proposal.abstract}</p>
                  {team.proposal.proposalFile?.url && (
                    <button
                      onClick={() => handleViewPDF(team.proposal.proposalFile.url)}
                      className="bg-green-600 text-white px-4 py-2 rounded mt-2 flex items-center gap-2"
                    >
                      <ExternalLink size={16} /> View Proposal PDF
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Logsheets */}
          <SectionHeader
            title={`Team Logsheets (${logsheets.length})`}
            isOpen={isLogsheetOpen}
            toggle={() => setIsLogsheetOpen(!isLogsheetOpen)}
          />
          {isLogsheetOpen && (
            <div className="bg-white p-6 rounded-xl shadow space-y-4">

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <label>Filter by Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full border px-3 py-2 rounded"
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
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="all">All Weeks</option>
                    {allWeeks.map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Logs */}
              {logsheets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded">
                  <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>No logs found</p>
                </div>
              ) : logsheets.map((log, i) => (
                <div key={i} className="border p-4 rounded bg-yellow-50">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Week {log.week}</span>
                  <p className="font-semibold mt-1">{log.createdBy?.name || "Unknown"}</p>
                  <p className="text-sm">{log.activity}</p>
                  <p className="text-sm">{log.outcome}</p>
                  <p className="text-xs text-gray-500 mt-1">Logged on: {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}

            </div>
          )}

        </div>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default TeamDetail;