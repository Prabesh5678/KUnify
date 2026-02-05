import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { NotebookPen, ExternalLink, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
// import axios from "axios"; // Commented out for now

const TeamDetail = () => {
  const { teamId } = useParams();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Proposal
  const [proposal, setProposal] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  // Logsheet
  const [logsheet, setLogsheet] = useState([]);

  // Filters
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");

  // Expand/collapse states
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isLogsheetOpen, setIsLogsheetOpen] = useState(false);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);

      // -------------------------------
      // Test data for now
      const testData = {
        name: `Team ${teamId || "Alpha"}`,
        supervisor: { name: "Mr. Sharma" },
        members: [
          { _id: "1", name: "Alice", email: "alice@example.com", isLeader: true },
          { _id: "2", name: "Bob", email: "bob@example.com", isLeader: false },
          { _id: "3", name: "Charlie", email: "charlie@example.com", isLeader: false },
        ],
        proposal: {
          projectTitle: "Smart Home Automation",
          abstract: "This project focuses on automating home appliances...",
          projectKeyword: "IoT, Automation, Sensors",
          proposalFile: { url: "https://example.com/sample.pdf" },
        },
        logsheet: [
          { task: "Initial Planning", date: "2026-01-10", fileUrl: "", createdBy: { _id: "1", name: "Alice" }, week: "1" },
          { task: "Requirement Gathering", date: "2026-01-15", fileUrl: "https://example.com/sample-log.pdf", createdBy: { _id: "2", name: "Bob" }, week: "2" },
          { task: "Design Phase", date: "2026-01-18", fileUrl: "", createdBy: { _id: "3", name: "Charlie" }, week: "2" },
        ],
      };

      setTeam(testData);
      setProposal(testData.proposal);
      setPdfPreviewUrl(testData.proposal.proposalFile.url);
      setLogsheet(testData.logsheet);

    } catch (err) {
      console.error(err);
      toast.error("Error fetching team details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  const handleViewPDF = (url) => {
    if (!url) return toast.error("PDF not found");
    window.open(url, "_blank");
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (!team) return <p className="p-6 text-center">No team data found.</p>;

  // Filtered logs
  const filteredLogs = logsheet.filter(
    (log) =>
      (selectedStudent === "all" || log.createdBy?._id === selectedStudent) &&
      (selectedWeek === "all" || log.week === selectedWeek)
  );

  const uniqueWeeks = [...new Set(logsheet.map((log) => log.week || "Unknown"))];

  const SectionHeader = ({ title, isOpen, toggle }) => (
    <div
      onClick={toggle}
      className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg shadow-sm hover:bg-gray-200 transition"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {isOpen ? <ChevronUp /> : <ChevronDown />}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 overflow-auto">
        <AdminHeader adminName="Admin" />
        <div className="max-w-5xl mx-auto space-y-4">
          
          {/* Team Members */}
          <div className="space-y-2">
            <SectionHeader
              title={`Team Members (${team.members?.length || 0})`}
              isOpen={isTeamOpen}
              toggle={() => setIsTeamOpen(!isTeamOpen)}
            />
            {isTeamOpen && (
              <div className="bg-white rounded-2xl shadow p-6 space-y-3">
                {team.members?.map((member) => (
                  <div
                    key={member._id}
                    className="flex justify-between items-center p-3 rounded-lg border bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    {member.isLeader && (
                      <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                        Team Leader
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal */}
          {proposal && (
            <div className="space-y-2">
              <SectionHeader
                title="Project Proposal"
                isOpen={isProposalOpen}
                toggle={() => setIsProposalOpen(!isProposalOpen)}
              />
              {isProposalOpen && (
                <div className="bg-white rounded-2xl shadow p-6 space-y-2">
                  <p><span className="font-medium">Title:</span> {proposal.projectTitle}</p>
                  <p><span className="font-medium">Abstract:</span> {proposal.abstract}</p>
                  <p><span className="font-medium">Keywords:</span> {proposal.projectKeyword}</p>
                  {pdfPreviewUrl && (
                    <button
                      onClick={() => handleViewPDF(pdfPreviewUrl)}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <ExternalLink size={16} /> View PDF
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logsheet */}
          {logsheet.length > 0 && (
            <div className="space-y-2">
              <SectionHeader
                title="Team Logsheet"
                isOpen={isLogsheetOpen}
                toggle={() => setIsLogsheetOpen(!isLogsheetOpen)}
              />
              {isLogsheetOpen && (
                <div className="bg-white rounded-2xl shadow p-6 space-y-4">
                  {/* Filters */}
                  <div className="flex gap-4 mb-4">
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="bg-white px-4 py-2 rounded-xl shadow border"
                    >
                      <option value="all">All Students</option>
                      {team.members.map((member) => (
                        <option key={member._id} value={member._id}>{member.name}</option>
                      ))}
                    </select>

                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="bg-white px-4 py-2 rounded-xl shadow border"
                    >
                      <option value="all">All Weeks</option>
                      {uniqueWeeks.map((week) => (
                        <option key={week} value={week}>Week {week}</option>
                      ))}
                    </select>
                  </div>

                  {/* Logs */}
                  {filteredLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No logs found</p>
                  ) : (
                    filteredLogs.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 border rounded-lg bg-yellow-50 hover:bg-yellow-100 transition"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{entry.task}</p>
                          <p className="text-sm text-gray-600">
                            {entry.date} - {entry.createdBy?.name}
                          </p>
                        </div>
                        {entry.fileUrl && (
                          <button
                            onClick={() => handleViewPDF(entry.fileUrl)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <FileText size={16} /> View
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
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
