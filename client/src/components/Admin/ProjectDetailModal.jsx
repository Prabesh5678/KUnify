// ProjectDetailModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";

// Optional: pastel border colors for select or modal elements
const pastelBorders = [
  "border-sky-200",
  "border-teal-200",
  "border-indigo-200",
  "border-rose-200",
  "border-amber-200",
];

const ProjectDetailModal = ({ isOpen, onClose, project, onAssignTeacher }) => {
  const [selectedTeacher, setSelectedTeacher] = useState("");

  if (!isOpen || !project) return null;

  const handleAssign = () => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher to assign");
      return;
    }
    onAssignTeacher(selectedTeacher, project.id);
    toast.success("Teacher assigned successfully!");
    setSelectedTeacher("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{project.title}</h2>

        <p className="mb-2 text-gray-700"><strong>Abstract:</strong> {project.abstract}</p>
        <p className="mb-2 text-gray-700"><strong>Keywords:</strong> {project.keywords}</p>
        <p className="mb-2 text-gray-700"><strong>Submitted By:</strong> {project.teamName}</p>
        <p className="mb-2 text-gray-700">
          <strong>Proposal:</strong>{" "}
          <a
            href={project.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 underline hover:text-sky-700 transition-colors"
          >
            View PDF
          </a>
        </p>

        {/* Assign Teacher */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Assign Teacher
          </label>
          <select
            className={`w-full p-2 border rounded border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300`}
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Select Teacher --</option>
            {project.teachers?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            className="mt-3 px-4 py-2 bg-primary text-white rounded hover:primary/80 transition-colors"
          >
            Assign
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
