import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import { ExternalLink, FileText, ChevronDown, ChevronUp, User, Download, CheckCircle } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

const TeamDetail = () => {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [logsheets, setLogsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsheetsLoading, setLogsheetsLoading] = useState(false);
  const [allWeeks, setAllWeeks] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [isProposalOpen, setIsProposalOpen] = useState(true);
  const [isLogsheetOpen, setIsLogsheetOpen] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");

  // Skeleton Components
  const SkeletonLine = ({ width = "w-full" }) => (
    <div className={`h-4 bg-gray-200 rounded animate-pulse ${width}`}></div>
  );

  const SkeletonCard = () => (
    <div className="border p-4 rounded bg-gray-50 space-y-2">
      <SkeletonLine width="w-1/4" />
      <SkeletonLine width="w-3/4" />
      <SkeletonLine width="w-full" />
      <SkeletonLine width="w-2/3" />
    </div>
  );

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
        setLogsheetsLoading(true);
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
            createdAt: log.createdAt || log.logId?.createdAt,
            isChecked: log.logId?.isChecked ?? log.isChecked,
            mark: log.logId?.mark ?? log.mark,
            checkedAt: log.logId?.checkedAt ?? log.checkedAt,
            correctionRequested: log.logId?.correctionRequested ?? log.correctionRequested,
            correctionNote: log.logId?.correctionNote ?? log.correctionNote,
            correctionRequestedAt: log.logId?.correctionRequestedAt ?? log.correctionRequestedAt,
          }));
          setLogsheets(formattedLogs);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching logsheets");
      } finally {
        setLogsheetsLoading(false);
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
        // console.error("Error fetching all weeks:", err);
      }
    };

    fetchAllWeeks();
  }, [team, teamId]);

  const handleViewPDF = (url) => {
    if (!url) return toast.error("PDF not found");
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  // Export logs as Excel/CSV via backend
  const handleExportLogs = async () => {
    try {
      setExportLoading(true);
      const response = await axios.get(`/api/admin/export/${teamId}`, {
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = `${team?.name || "team"}_logs_${Date.now()}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Logs exported successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to export logs");
    } finally {
      setExportLoading(false);
    }
  };

  const allMembers = team?.members || [];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
        <AdminSidebar />
        <div className="flex-1 p-8 overflow-auto">
          <AdminHeader />
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-xl shadow space-y-3">
              <SkeletonLine width="w-1/3" />
              <SkeletonLine width="w-2/3" />
            </div>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
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
    <div className="flex min-h-screen h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto h-full">
        <AdminHeader />
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Team Header */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h1 className="text-2xl font-bold text-gray-800 break-words">{team.name}</h1>

            {team.supervisor && team.supervisorStatus === "adminApproved" ? (
              <p className="text-gray-600 mt-2">
                <b>Supervisor:</b> {team.supervisor.name} ({team.supervisor.email})
              </p>
            ) : team.supervisor ? (
              <p className="text-red-600 mt-2 italic">
                <b>Requested Supervisor:</b> {team.supervisor.name} (Pending Approval)
              </p>
            ) : (
              <p className="text-gray-500 mt-2 italic">No supervisor assigned</p>
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
                  <p className="break-words"><b>Title:</b> {team.proposal.projectTitle}</p>
                  <p className="break-words"><b>Abstract:</b> {team.proposal.abstract}</p>
                  <p className="break-words"><b>Keywords:</b>{team.proposal.projectKeyword}</p>
                  {team.proposal?.proposalFile?.url && (
                    <button
                      onClick={() => handleViewPDF(team.proposal.proposalFile.url)}
                      className="bg-primary text-white px-4 py-2 rounded mt-2 flex items-center gap-2 cursor-pointer"
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

              {/* Filters + Export */}
              <div className="flex flex-wrap gap-4 mb-4 p-4 bg-gray-50 rounded-lg items-end">
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
                <button
                  onClick={handleExportLogs}
                  disabled={exportLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded cursor-pointer transition-colors whitespace-nowrap"
                >
                  <Download size={16} />
                  {exportLoading ? "Exporting..." : "Export Logs"}
                </button>
              </div>

              {/* Logs */}
              {logsheetsLoading ? (
                <div className="space-y-4">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : logsheets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded">
                  <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>No logs found</p>
                </div>
              ) : logsheets.map((log, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Week {log.week}</span>
                    {log.isChecked && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        <CheckCircle size={14} />
                        Checked
                      </span>
                    )}
                    {log.correctionRequested && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded">
                        Correction requested
                      </span>
                    )}
                  </div>
                  <p className="font-semibold mt-1">{log.createdBy?.name || "Unknown"}</p>

                  {/* Activity & Outcome */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task Accomplished</p>
                      <p className="text-sm break-words mt-0.5">{log.activity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task to be Accomplished</p>
                      <p className="text-sm break-words mt-0.5">{log.outcome}</p>
                    </div>
                  </div>

                  {/* Timestamps*/}
                  <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Log written on: {new Date(log.createdAt).toLocaleString()}</p>
                    {log.checkedAt && (
                      <p className="text-xs text-gray-500">
                        Checked by supervisor on: {new Date(log.checkedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {log.mark !== null && log.mark !== undefined && (
                    <p className="text-base font-semibold text-green-700 mt-1">Mark: {log.mark}/5</p>
                  )}
                  {log.correctionNote && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                      <span className="font-semibold">Latest correction:</span> {log.correctionNote}
                      {log.correctionRequestedAt && (
                        <span className="block mt-1 text-amber-700">
                          Requested on: {new Date(log.correctionRequestedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
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
