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
  const [allLogsheets, setAllLogsheets] = useState([]); // Store all logsheets for debugging
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [isProposalOpen, setIsProposalOpen] = useState(true);
  const [isLogsheetOpen, setIsLogsheetOpen] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");

  // Fetch team info
  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) {
        setError("No team ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/api/admin/teams/${teamId}`);
        if (data.success) {
          setTeam(data.team);
        } else {
          setError("Team not found");
        }
      } catch (err) {
        console.error("Error fetching team:", err);
        const errorMsg = err.response?.data?.message || "Error fetching team";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [teamId]);

  // Fetch ALL logsheets and filter on client side
  useEffect(() => {
    const fetchLogsheets = async () => {
      if (!team) return;

      try {
        setLoading(true);
        const { data } = await axios.get("/api/admin/logsheets");
        
        if (data.success) {
          setAllLogsheets(data.data); // Store all logsheets
          let filteredLogs = data.data;
          
          // Filter by team (only show logs from this team's members)
          const teamMemberIds = team?.members?.map(m => m._id) || [];
          
          filteredLogs = filteredLogs.filter(log => {
            const logMemberId = log.memberId?._id || log.memberId;
            return teamMemberIds.includes(logMemberId);
          });
          
          // Apply student filter
          if (selectedStudent !== "all") {
            filteredLogs = filteredLogs.filter(log => 
              (log.memberId?._id || log.memberId) === selectedStudent
            );
          }
          
          // Apply week filter
          if (selectedWeek !== "all") {
            filteredLogs = filteredLogs.filter(log => 
              log.logId?.week === parseInt(selectedWeek)
            );
          }
          
          setLogsheets(filteredLogs);
        }
      } catch (err) {
        console.error("Error fetching logsheets:", err);
        toast.error(err.response?.data?.message || "Error fetching logsheets");
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogsheets();
  }, [team, selectedStudent, selectedWeek]);

  const handleViewPDF = (url) => {
    if (!url) return toast.error("PDF not found");
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  const allMembers = team?.members || [];
  const uniqueWeeks = useMemo(() => {
    const weeks = logsheets.map(log => log.logId?.week).filter(Boolean);
    return [...new Set(weeks)].sort((a, b) => a - b);
  }, [logsheets]);

  if (loading && !team) return <p className="p-6 text-center">Loading...</p>;
  
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <AdminHeader />
          <div className="max-w-5xl mx-auto">
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <p className="text-sm text-gray-600 mt-2">Team ID: {teamId || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
            <p className="text-sm text-gray-500 mt-1">Team Code: {team.code} | Subject: {team.subject}</p>
            {team.supervisor && (
              <p className="text-gray-600 mt-2">
                <b>Supervisor:</b> {team.supervisor.name} ({team.supervisor.email})
              </p>
            )}
            {!team.supervisor && (
              <p className="text-amber-600 mt-2 text-sm">
                ⚠️ No supervisor assigned yet
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
              {allMembers.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No team members found</p>
              ) : (
                allMembers.map(m => (
                  <div key={m._id} className="border p-4 rounded bg-blue-50 hover:bg-blue-100 flex items-center gap-2">
                    <User size={18} className="text-blue-600" /> 
                    <span><b>{m.name}</b> ({m.email})</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Proposal */}
          {team.proposal ? (
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
                      className="bg-green-600 text-white px-4 py-2 rounded mt-2 flex items-center gap-2 hover:bg-green-700"
                    >
                      <ExternalLink size={16} /> View Proposal PDF
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <p className="text-amber-800">
                ⚠️ <b>No proposal submitted yet</b>
              </p>
            </div>
          )}

          {/* Logsheets */}
          <SectionHeader
            title={`Team Logsheets (${logsheets.length})`}
            isOpen={isLogsheetOpen}
            toggle={() => setIsLogsheetOpen(!isLogsheetOpen)}
          />
          {isLogsheetOpen && (
            <div className="bg-white p-6 rounded-xl shadow space-y-4">
              {/* Debug Info */}
              {allLogsheets.length > 0 && logsheets.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    ℹ️ There are {allLogsheets.length} total logsheet(s) in the system, but none belong to this team's members.
                  </p>
                </div>
              )}

              {/* Filters */}
              {allMembers.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1">Filter by Student</label>
                    <select 
                      value={selectedStudent} 
                      onChange={(e) => setSelectedStudent(e.target.value)} 
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Students</option>
                      {allMembers.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1">Filter by Week</label>
                    <select 
                      value={selectedWeek} 
                      onChange={(e) => setSelectedWeek(e.target.value)} 
                      className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Weeks</option>
                      {uniqueWeeks.map(w => <option key={w} value={w}>Week {w}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Logs */}
              {logsheets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded">
                  <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">No logsheets found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {allLogsheets.length === 0 
                      ? "No team members have submitted logsheets yet."
                      : "This team has no logsheets matching the selected filters."}
                  </p>
                </div>
              ) : (
                logsheets.map((log, i) => (
                  <div key={i} className="border p-4 rounded bg-yellow-50 hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Week {log.logId?.week || 'N/A'}
                      </span>
                      <p className="font-semibold">{log.memberId?.name || 'Unknown Member'}</p>
                    </div>
                    <p className="text-sm mt-1"><b>Activity:</b> {log.logId?.activity || "No activity"}</p>
                    <p className="text-sm"><b>Outcome:</b> {log.logId?.outcome || "No outcome"}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Logged on: {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}

            </div>
          )}

        </div>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default TeamDetail;