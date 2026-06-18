import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { ExternalLink, User, FileText, ChevronDown, ChevronUp, Download, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

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
  const [exportLoading, setExportLoading] = useState(false);
  const [checkingLogId, setCheckingLogId] = useState(null);
  const [correctionLogId, setCorrectionLogId] = useState(null);
  const [selectedMarks, setSelectedMarks] = useState({});

  const [activeTab, setActiveTab] = useState("team");
  const [loading, setLoading] = useState(!team);
  const [error, setError] = useState("");
  const [isTeamOpen, setIsTeamOpen] = useState(true);
  const [isProposalOpen, setIsProposalOpen] = useState(true);
  const [isLogsOpen, setIsLogsOpen] = useState(true);

  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [correctionTargetLogId, setCorrectionTargetLogId] = useState(null);
  const [correctionNoteInput, setCorrectionNoteInput] = useState("");

  const openCorrectionDialog = (logId) => {
    setCorrectionTargetLogId(logId);
    setCorrectionNoteInput("");
    setCorrectionDialogOpen(true);
  };

  const closeCorrectionDialog = () => {
    setCorrectionDialogOpen(false);
    setCorrectionTargetLogId(null);
    setCorrectionNoteInput("");
  };

  const submitCorrectionRequest = async () => {
    if (!correctionNoteInput.trim()) return;
    await handleRequestCorrection(correctionTargetLogId, correctionNoteInput.trim());
    closeCorrectionDialog();
  };

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
            createdBy: log.createdBy || log.memberId,
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
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(proposal.proposalFile.url)}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  const handleExportLogs = async () => {
    if (!team?._id) return;
    try {
      setExportLoading(true);
      const response = await axios.get(`/api/teacher/export/${team._id}`, {
        withCredentials: true,
        responseType: "blob",
      });

      // Determine filename from content-disposition header if available
      const contentDisposition = response.headers["content-disposition"];
      let filename = `${team.name || "team"}_logs.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, "");
        }
      }

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } 
    catch (err) {
  console.error("Error exporting logs:", err);
  toast.error("Failed to export logs. Please try again.");
}
  finally {
      setExportLoading(false);
    }
  };

  const updateLogsheet = (updatedLog) => {
    setLogsheets((prev) =>
      prev.map((log) => (log._id === updatedLog._id ? { ...log, ...updatedLog } : log))
    );
  };

  const handleCheckLog = async (logId) => {
    const mark = Number(selectedMarks[logId] ?? 5);
    try {
      setCheckingLogId(logId);
      const { data } = await axios.patch(`/api/teacher/logs/${logId}/check`, { mark });

      if (data.success) {
        updateLogsheet(data.log);
        toast.success("Log checked successfully");
      } else {
        toast.error(data.message || "Unable to check log");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check log");
    } finally {
      setCheckingLogId(null);
    }
  };

const handleRequestCorrection = async (logId, correctionNote) => {
  try {
    setCorrectionLogId(logId);

    const { data } = await axios.patch(
      `/api/teacher/logs/${logId}/request-correction`,
      {
        correctionNote,
      }
    );

    if (data.success) {
      updateLogsheet(data.log);
      toast.success("Correction requested");
    } else {
      toast.error(data.message || "Unable to request correction");
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Failed to request correction"
    );
  } finally {
    setCorrectionLogId(null);
  }

      return;

    try {
      setCorrectionLogId(logId);
      const { data } = await axios.patch(`/api/teacher/logs/${logId}/request-correction`, {
        correctionNote,
      });

      if (data.success) {
        updateLogsheet(data.log);
        toast.success("Correction requested");
      } else {
        toast.error(data.message || "Unable to request correction");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request correction");
    } finally {
      setCorrectionLogId(null);
    }
  };

  const handleMarkChange = (logId, mark) => {
    setSelectedMarks((prev) => ({ ...prev, [logId]: mark }));
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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-pink-600 break-words">
                {team.name}
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mt-6">
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
                      <h3 className="font-semibold text-gray-600 truncate">Project Title</h3>
                      <p className="text-gray-700 break-words">{proposal?.projectTitle || "N/A"}</p>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-600 break-words">Abstract</h3>
                      <p className="text-gray-700 break-words whitespace-pre-wrap">
                        {proposal?.abstract || "N/A"}
                      </p>
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
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  {/* Filters + Export */}
                 <div className="flex flex-col lg:flex-row gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Filter by Student</label>
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
                      <label className="block mb-1 text-sm font-medium text-gray-700">Filter by Week</label>
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

                    {/* Export Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={handleExportLogs}
                        disabled={exportLoading}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        {exportLoading ? "Exporting..." : "Export"}
                      </button>
                    </div>
                  </div>

                  {/* Logs */}
                  {/* Logs */}
                  <div>
                    {logsheetsLoading ? (
                      <p>Loading logs...</p>
                    ) : logsheets.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded">
                        <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>No logs found</p>
                      </div>
                    ) : (
                      logsheets.map((log, index) => (
                        <div
                          key={index}
                          className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5 mb-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Week {log.week}
                            </span>
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Activity Accomplished
                              </h4>
                              <p className="text-sm break-words mt-1">{log.activity}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Activity to Accomplish
                              </h4>
                              <p className="text-sm break-words mt-1">{log.outcome}</p>
                            </div>
                          </div>

                          <div className="flex flex-col mt-2">
                            <p className="text-xs text-gray-500">
                              Log written on: {new Date(log.createdAt).toLocaleString()}
                            </p>
                            {log.checkedAt && (
                              <p className="text-xs text-gray-500">
                                Checked by supervisor on: {new Date(log.checkedAt).toLocaleString()}
                              </p>
                            )}
                          </div>

                          {log.mark !== null && log.mark !== undefined && (
                            <p className="text-base font-semibold text-green-700 mt-1">
                              Mark: {log.mark}/5
                            </p>
                          )}
                          {log.correctionNote && (
                            <p className="text-xs text-amber-700 mt-1">
                              Correction: {log.correctionNote}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            {!log.isChecked && (
                              <select
                                value={selectedMarks[log._id] ?? 5}
                                onChange={(e) => handleMarkChange(log._id, Number(e.target.value))}
                                disabled={checkingLogId === log._id}
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {[0, 1, 2, 3, 4, 5].map((mark) => (
                                  <option key={mark} value={mark}>
                                    {mark}/5
                                  </option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => handleCheckLog(log._id)}
                              disabled={log.isChecked || checkingLogId === log._id}
                              className={`px-3 py-1 rounded text-sm font-medium ${log.isChecked
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                }`}
                            >
                              {log.isChecked
                                ? "Checked"
                                : checkingLogId === log._id
                                  ? "Checking..."
                                  : "Mark Checked"}
                            </button>

                            {!log.isChecked && (
                              <button
                                onClick={() => openCorrectionDialog(log._id)}
                                disabled={correctionLogId === log._id}
                                className="px-3 py-1 rounded text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 cursor-pointer disabled:cursor-not-allowed"
                              >
                                {correctionLogId === log._id ? "Requesting..." : "Request Correction"}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Correction Dialog */}
                  {correctionDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800">Request Correction</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Enter the reason for requesting a correction on this log.
                        </p>

                        <textarea
                          value={correctionNoteInput}
                          onChange={(e) => setCorrectionNoteInput(e.target.value)}
                          rows={4}
                          placeholder="e.g. Please clarify the outcome for Tuesday's task..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />

                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={closeCorrectionDialog}
                            className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={submitCorrectionRequest}
                            disabled={!correctionNoteInput.trim() || correctionLogId === correctionTargetLogId}
                            className="px-3 py-1.5 rounded text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {correctionLogId === correctionTargetLogId ? "Requesting..." : "Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
