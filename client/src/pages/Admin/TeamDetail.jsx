import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { ExternalLink, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom";

axios.defaults.withCredentials = true;

const TeamDetail = () => {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isLogsheetOpen, setIsLogsheetOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const [existingProposal, setExistingProposal] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  // Fetch team, proposal and logs
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch basic team info
        const { data: projectsData } = await axios.get("/api/admin/projects");
        const allTeams = [
          ...projectsData.assignedTeams,
          ...projectsData.unassignedTeams,
        ];
        const foundTeam = allTeams.find((t) => t._id === teamId);
        if (!foundTeam) {
          toast.error("Team not found");
          setLoading(false);
          return;
        }
        setTeam(foundTeam);

        // 2️⃣ Fetch proposal submitted by team
        try {
          const { data: proposalData } = await axios.get(
            `/api/proposal/${teamId}`,
            { withCredentials: true }
          );
          if (proposalData?.team?.proposal) {
            setExistingProposal(proposalData.team.proposal);
            if (proposalData.team.proposal.proposalFile?.url)
              setPdfPreviewUrl(proposalData.team.proposal.proposalFile.url);
          }
        } catch (err) {
          console.error("No proposal found for this team", err);
        }

        // 3️⃣ Fetch team logsheet
        try {
          const { data: logsData } = await axios.get(
            `/api/logsheet/${teamId}`,
            { withCredentials: true }
          );
          setTeam((prev) => ({
            ...prev,
            logsheet: logsData.logs || [],
          }));
        } catch (err) {
          console.error("No logs found for this team", err);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading team data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleViewPDF = (url) => {
  if (!url) return toast.error("PDF not found");
  // Use Google Docs Viewer to force inline viewing instead of download
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  window.open(viewerUrl, "_blank");
};

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!team) return <p className="p-6 text-center">No team data found.</p>;

  const logsheet = team.logsheet || [];
  const proposal = existingProposal;

  const filteredLogs = logsheet.filter(
    (log) =>
      (selectedStudent === "all" || log.createdBy?._id === selectedStudent) &&
      (selectedWeek === "all" || log.week === selectedWeek)
  );

  const uniqueWeeks = [...new Set(logsheet.map((l) => l.week))];

  const SectionHeader = ({ title, isOpen, toggle }) => (
    <div
      onClick={toggle}
      className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg"
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

          {/* Team Members */}
          <SectionHeader
            title={`Team Members (${team.members.length})`}
            isOpen={isTeamOpen}
            toggle={() => setIsTeamOpen(!isTeamOpen)}
          />
          {isTeamOpen && (
            <div className="bg-white p-6 rounded-xl shadow space-y-3">
              {team.members.map((m) => (
                <div key={m._id} className="border p-3 rounded bg-blue-50">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm">{m.email}</p>
                </div>
              ))}
            </div>
          )}

          {/* Proposal */}
          {proposal && (
            <>
              <SectionHeader
                title="Project Proposal"
                isOpen={isProposalOpen}
                toggle={() => setIsProposalOpen(!isProposalOpen)}
              />
              {isProposalOpen && (
                <div className="bg-white p-6 rounded-xl shadow space-y-2">
                  <p><b>Title:</b> {proposal.projectTitle}</p>
                  <p><b>Abstract:</b> {proposal.abstract}</p>
                  <p><b>Keywords:</b> {proposal.projectKeyword}</p>

                  {pdfPreviewUrl && (
                    <button
                      onClick={() => handleViewPDF(pdfPreviewUrl)}
                      className="mt-2 bg-green-600 text-white px-4 py-2 rounded inline-flex items-center gap-2"
                    >
                      <ExternalLink size={16} /> View PDF
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Logsheet */}
          {logsheet.length > 0 && (
            <>
              <SectionHeader
                title="Team Logsheet"
                isOpen={isLogsheetOpen}
                toggle={() => setIsLogsheetOpen(!isLogsheetOpen)}
              />
              {isLogsheetOpen && (
                <div className="bg-white p-6 rounded-xl shadow space-y-3">
                  <div className="flex gap-4 mb-4">
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="border px-3 py-2 rounded"
                    >
                      <option value="all">All Students</option>
                      {team.members.map((m) => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="border px-3 py-2 rounded"
                    >
                      <option value="all">All Weeks</option>
                      {uniqueWeeks.map((w) => (
                        <option key={w} value={w}>Week {w}</option>
                      ))}
                    </select>
                  </div>

                  {filteredLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No logs found</p>
                  ) : (
                    filteredLogs.map((log, i) => (
                      <div key={i} className="border p-3 rounded bg-yellow-50">
                        <p className="font-medium">{log.task}</p>
                        <p className="text-sm">
                          {log.date} - {log.createdBy?.name}
                        </p>
                        {log.fileUrl && (
                          <button
                            onClick={() => handleViewPDF(log.fileUrl)}
                            className="text-blue-600 flex items-center gap-1"
                          >
                            <FileText size={16} /> View
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

        </div>

        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default TeamDetail;
