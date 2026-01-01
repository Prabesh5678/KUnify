import React, { useState } from "react";
import { NotebookPen } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const Request = () => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");

  // Form validation
  const isFormInvalid =
    !title.trim() ||
    !abstract.trim() ||
    !keywords.trim() ||
    !pdfFile ||
    uploadStatus === "uploading";

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

      await fetch("/api/proposal/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      setUploadStatus("uploaded");
      toast.success("Proposal submitted successfully!");
    } catch (err) {
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
              <h1 className="text-3xl font-bold text-gray-800">Initial Form</h1>
              <p className="text-gray-600 mt-1">
                Complete the form below to submit your proposal
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
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
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your project title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Abstract <span className="text-red-500">*</span>
              </label>
              <textarea
                value={abstract}
                onChange={(e) => {
                  const words = e.target.value.split(/\s+/);
                  if (words.length <= 250) setAbstract(e.target.value);
                }}
                rows={3}
                placeholder="Abstract of your project in 200-250 words."
                className="w-full px-4 py-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. React, ML, IoT"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Proposal (PDF only, max 2MB){" "}
                <span className="text-red-500">*</span>
              </label>

              <label className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition">
                Choose File
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (file.type !== "application/pdf") {
                      toast.error("Only PDF files are allowed");
                      e.target.value = null;
                      return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("File size must be under 2MB");
                      e.target.value = null;
                      return;
                    }

                    setPdfFile(file);
                    setUploadStatus("selected");
                    toast.success("PDF selected successfully");
                  }}
                />
              </label>

              {pdfFile && (
                <div className="mt-4 flex items-center gap-3 bg-gray-50 border rounded-lg p-3">
                  <img src="/pdf_image.png" alt="PDF" className="w-8 h-8" />
                  <div>
                    <p className="text-sm font-semibold">{pdfFile.name}</p>
                    {uploadStatus !== "idle" && (
                      <p className="text-xs text-gray-500">
                        Status: {uploadStatus}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-10">
              <button
                type="submit"
                disabled={isFormInvalid}
                className={`bg-primary text-white font-bold py-3.5 px-12 rounded-xl shadow-lg transition transform text-base
                  ${
                    isFormInvalid
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-primary/70 hover:scale-105"
                  }`}
              >
                {uploadStatus === "uploading"
                  ? "Uploading..."
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
