
import React, { useState, useEffect } from "react";
import { NotebookPen, ExternalLink, ChevronDown } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const Request = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");

  // PDF file and preview URL
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  // State to track submission & upload
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [isProposalSubmitted, setIsProposalSubmitted] = useState(false);
  const [existingProposal, setExistingProposal] = useState(null);

  // Supervisors
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredSupervisor, setHoveredSupervisor] = useState(null);

  const abstractWordCount = abstract.trim()
    ? abstract.trim().split(/\s+/).length
    : 0;

  // Fetch existing proposal
  useEffect(() => {
    const fetchTeamProposal = async () => {
      try {
        if (!teamId) return;

        const { data } = await axios.get(`/api/proposal/${teamId}`, {
          withCredentials: true,
        });

        if (!data) return;

        if (data.team.proposal) {
          const p = data.team.proposal;
          setTitle(p.projectTitle);
          setAbstract(p.abstract);
          setKeywords(p.projectKeyword);

          if (p.proposalFile && p.proposalFile.url) {
            setPdfPreviewUrl(p.proposalFile.url);
          }

          setExistingProposal(p);
          setIsProposalSubmitted(true);
          //  toast("Proposal has already been submitted by your team");
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      }
    };

    fetchTeamProposal();
  }, [teamId]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const { data } = await axios.get("/api/student/get-teachers", {
          withCredentials: true,
        });

        if (data.success) {
          setSupervisors(data.teachers);
        } else {
          toast.error("Unable to find teachers");
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching supervisors", error);
      }
    };

    fetchSupervisors();
  }, []);

  // Form validation
  const isFormInvalid =
    !title.trim() ||
    !abstract.trim() ||
    !keywords.trim() ||
    (!pdfFile && !isProposalSubmitted) ||
    uploadStatus === "uploading";

  // PDF selection handler
  const handlePdfSelect = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB");
      return;
    }

    setPdfFile(file);
    setUploadStatus("selected");
    setPdfPreviewUrl(URL.createObjectURL(file));
    toast.success("PDF selected successfully");
  };

  // Open PDF in new tab with custom viewer
  const handleViewPDFBefore = (url) => {
    if (!url) {
      toast.error("PDF file not found");
      return;
    }

    // Open PDF viewer in new tab
    window.open(url, "_blank");
  };
  const handleViewPDFAfter = (url, filename) => {
    if (!url) {
      toast.error("PDF file not found");
      return;
    }

    // Open PDF viewer in new tab
    const viewerUrl = `/view-pdf?url=${encodeURIComponent(url)}&title=${encodeURIComponent(filename || 'Proposal')}`;
    window.open(viewerUrl, "_blank");
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFormInvalid) {
      toast.error("Please complete all required fields before submitting");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("abstract", abstract);
    formData.append("keywords", keywords);
    formData.append("proposal", pdfFile);
    formData.append("supervisor", selectedSupervisor);

    try {
      setUploadStatus("uploading");

      const { data } = await axios.post(
        `/api/proposal/upload/${teamId}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        const newProposal = {
          projectTitle: title,
          abstract,
          projectKeyword: keywords,
          proposalFile: {
            url: data.proposal.proposalFile.url,
          },
        };

        setExistingProposal(newProposal);
        setPdfPreviewUrl(data.proposal.proposalFile.url);
        setPdfFile(null);
        setIsProposalSubmitted(true);
        setUploadStatus("uploaded");
        toast.success("Proposal submitted successfully!");
      } else {
        setUploadStatus("failed");
        toast.error(data.message);
      }
    } catch (error) {
      setUploadStatus("failed");
      console.error(error.stack);
      toast.error("Upload failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-9 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg border-b">
          <div className="px-8 py-6 flex items-center gap-4">
            <NotebookPen className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Initial Form</h1>
              <p className="text-gray-600 mt-1">
                {isProposalSubmitted
                  ? "View the submitted proposal"
                  : "Complete the form below to submit your proposal"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-10 -mt-1">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Project Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                disabled={isProposalSubmitted}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your project title"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Abstract <span className="text-red-500">*</span>
              </label>

              <textarea
                value={abstract}
                disabled={isProposalSubmitted}
                onChange={(e) => {
                  const words = e.target.value.trim().split(/\s+/);
                  if (words.length <= 250) {
                    setAbstract(e.target.value);
                  }
                }}
                rows={4}
                placeholder="Abstract of your project in 200–250 words."
                className="w-full px-4 py-6 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              {/* Word Counter */}
              <div className="mt-1 text-right text-xs">
                <span
                  className={`font-medium ${abstractWordCount === 250
                      ? "text-red-600"
                      : "text-gray-500"
                    }`}
                >
                  {abstractWordCount}/250 words
                </span>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={keywords}
                disabled={isProposalSubmitted}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. React, ML, IoT"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Supervisor Dropdown */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Supervisor
                </label>

                {/* Dropdown button */}
                <button
                  type="button"
                  disabled={isProposalSubmitted}
                  onClick={() => {
                    setIsOpen(!isOpen);
                    if (isOpen) setHoveredSupervisor(null); // Clear tooltip when closing
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-gray-100
      ${isProposalSubmitted ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-200"}
    `}
                >
                  <span>
                    {selectedSupervisor
                      ? supervisors.find((s) => s._id === selectedSupervisor)?.name
                      : "Select Supervisor"}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown list */}
                {isOpen && !isProposalSubmitted && (
                  <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {supervisors.map((sup) => (
                      <div
                        key={sup._id}
                        onClick={() => {
                          setSelectedSupervisor(sup._id);
                          setIsOpen(false);
                          setHoveredSupervisor(null); // Clear tooltip on selection
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredSupervisor({
                            ...sup,
                            top: rect.top + rect.height / 2,
                            left: rect.right + 10,
                          });
                        }}
                        onMouseLeave={() => setHoveredSupervisor(null)}
                        className="relative px-4 py-2 cursor-pointer hover:bg-blue-50"
                      >
                        {sup.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tooltip rendered outside of dropdown item */}
                {isOpen && hoveredSupervisor && (
                  <div
                    className="fixed w-64 bg-white text-black text-xs rounded-lg px-3 py-2 shadow-lg z-50 pointer-events-none"
                    style={{
                      top: hoveredSupervisor.top,
                      left: hoveredSupervisor.left,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <p className="font-semibold mb-1">Specialization</p>
                    <p>{hoveredSupervisor.specialization}</p>
                  </div>
                )}
              </div>


              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Proposal (PDF only, max 2MB)
                </label>
                <label
                  className={`w-full flex justify-center px-4 py-3 bg-gray-100 border rounded-lg ${isProposalSubmitted
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:bg-gray-200"
                    }`}
                >
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    disabled={isProposalSubmitted}
                    onChange={(e) => handlePdfSelect(e.target.files[0])}
                  />
                </label>

                {/* PDF info for newly selected file (before submission) */}
                {pdfFile && !isProposalSubmitted && (
                  <div className="mt-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <img src="/pdf_image.png" alt="PDF" className="w-10 h-10" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {(pdfFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewPDFBefore(pdfPreviewUrl)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink size={16} />
                      View
                    </button>
                  </div>
                )}

                {/* PDF uploaded by team (after submission) */}
                {isProposalSubmitted && existingProposal && (
                  <div className="mt-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <img src="/pdf_image.png" alt="PDF" className="w-10 h-10" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {existingProposal.projectTitle || title || "Team Proposal"}
                      </p>
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Submitted successfully
                      </p>
                    </div>
                    {(existingProposal.proposalFile?.url || pdfPreviewUrl) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleViewPDFAfter(
                            existingProposal.proposalFile?.url || pdfPreviewUrl,
                            existingProposal.projectTitle || title || "Proposal"
                          )
                        }
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <ExternalLink size={16} />
                        View
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-10">
              <button
                type="submit"
                disabled={isFormInvalid || isProposalSubmitted}
                className={`bg-primary text-white font-bold py-3.5 px-12 rounded-xl shadow-lg transition
      ${isFormInvalid || isProposalSubmitted
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-primary/70 hover:scale-105 cursor-pointer"
                  }`}
              >
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : isProposalSubmitted
                    ? "Proposal Already Submitted"
                    : "Submit Request"}
              </button>
            </div>

          </form>

          <Toaster position="top-right" />
        </div>
      </div>
    </div>
  );
};

export default Request;