import React, { useState, useEffect } from "react";
import { NotebookPen } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { useParams } from "react-router-dom";

const Request = () => {
  const { teamId } = useParams();

  // Form fields
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");

  // PDF file and preview URL
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");

  // State to track submission & upload
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle | selected | uploading | uploaded | failed
  const [isProposalSubmitted, setIsProposalSubmitted] = useState(false);
  const [existingProposal, setExistingProposal] = useState(null);

  // -------------------------------
  // 1️⃣ Fetch existing proposal (on mount)
  // -------------------------------
  useEffect(() => {
    const fetchTeamProposal = async () => {
      try {
        if (!teamId) return;

        // -------------------------------
        // 🔹 TESTING: dummy data for now
        // Replace this with real API call later
        // const res = await axios.get(`/api/team/${teamId}/proposal`, { withCredentials: true });
        const res = {
          data: {
            isProposalSubmitted: Math.random() > 0.5, // simulate submission randomly
            proposal: {
              title: "Existing Project Title",
              abstract: "This is the existing abstract of the proposal.",
              keywords: "React, Node.js, MongoDB",
              pdfUrl: "/pdf_image.png",
            },
          },
        };
        // -------------------------------

        if (res.data.isProposalSubmitted && res.data.proposal) {
          const p = res.data.proposal;
          setTitle(p.title);
          setAbstract(p.abstract);
          setKeywords(p.keywords);
          setExistingProposal(p);
          setIsProposalSubmitted(true);
          toast("Proposal has already been submitted by your team");
        }
      } catch (error) {
        console.error("Error fetching proposal:", error);
      }
    };

    fetchTeamProposal();
  }, [teamId]);

  // -------------------------------
  // 2️⃣ Form validation
  // -------------------------------
  const isFormInvalid =
    !title.trim() ||
    !abstract.trim() ||
    !keywords.trim() ||
    (!pdfFile && !isProposalSubmitted) ||
    uploadStatus === "uploading";

  // -------------------------------
  // 3️⃣ PDF selection handler
  // -------------------------------
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

    // Create temporary preview URL for viewing before upload
    setPdfPreviewUrl(URL.createObjectURL(file));

    toast.success("PDF selected successfully");
  };

  // -------------------------------
  // 4️⃣ Form submit handler
  // -------------------------------
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

    try {
      setUploadStatus("uploading");

      // -------------------------------
      // 🔹 TESTING: dummy delay for now
      // Replace this with real API POST later
      // await axios.post(`/api/team/${teamId}/proposal`, formData, {
      //   withCredentials: true,
      //   headers: { "Content-Type": "multipart/form-data" },
      // });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // -------------------------------

      // Update proposal so other team members can see immediately
      const newProposal = {
        title,
        abstract,
        keywords,
        pdfUrl: pdfPreviewUrl || "/pdf_image.png", // replace with backend URL after real API
      };
      setExistingProposal(newProposal);

      setIsProposalSubmitted(true);
      setUploadStatus("uploaded");
      toast.success("Proposal submitted successfully!");
    } catch (error) {
      setUploadStatus("failed");
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
              <h1 className="text-3xl font-bold text-gray-800">
                Initial Form
              </h1>
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
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  const words = e.target.value.split(/\s+/);
                  if (words.length <= 250) setAbstract(e.target.value);
                }}
                rows={3}
                placeholder="Abstract of your project in 200-250 words."
                className="w-full px-4 py-6 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
              />
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
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Proposal (PDF only, max 2MB)
              </label>
              <label
                className={`w-full flex justify-center px-4 py-3 bg-gray-100 border rounded-lg ${
                  isProposalSubmitted
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

              {/* PDF info for selected file */}
              {pdfFile && (
                <div className="mt-4 flex items-center gap-3 bg-gray-50 border rounded-lg p-3">
                  <img src="/pdf_image.png" alt="PDF" className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-semibold">{pdfFile.name}</p>
                    <p className="text-xs text-gray-500">
                      Size: {(pdfFile.size / 1024).toFixed(2)} KB
                    </p>
                    <a
                      href={pdfPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View PDF
                    </a>
                  </div>
                </div>
              )}

              {/* PDF uploaded by any team member */}
              {existingProposal && !pdfFile && (
                <div className="mt-4 flex items-center gap-3 bg-gray-50 border rounded-lg p-3">
                  <img src="/pdf_image.png" alt="PDF" className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-semibold">
                      {existingProposal.title}
                    </p>
                    {existingProposal.pdfUrl && (
                      <a
                        href={existingProposal.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View PDF
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-10">
              <button
                type="submit"
                disabled={isFormInvalid || isProposalSubmitted}
                className={`bg-primary text-white font-bold py-3.5 px-12 rounded-xl shadow-lg transition
                  ${
                    isFormInvalid || isProposalSubmitted
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary/70 hover:scale-105"
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
