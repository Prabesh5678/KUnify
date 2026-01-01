import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ProjectDetailModal = ({ isOpen, onClose, project, onAssignTeacher }) => {
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [suggestedTeachers, setSuggestedTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch suggested teachers when modal opens
  useEffect(() => {
    if (!isOpen || !project) return;

    const fetchSuggestedTeachers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/admin/projects/${project.id}/suggested-teachers`
        );

        // Sort by cosine similarity (highest first)
        const sorted = res.data.sort(
          (a, b) => b.similarityScore - a.similarityScore
        );

        setSuggestedTeachers(sorted);
      } catch (error) {
        console.error("Failed to fetch suggested teachers", error);
        toast.error("Unable to load suggested teachers");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedTeachers();
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleAssign = async () => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher to assign");
      return;
    }

    try {
      await onAssignTeacher(selectedTeacher, project.id);
      toast.success("Teacher assigned successfully!");
      setSelectedTeacher("");
      onClose();
    } catch (error) {
      console.error(error.stack)
      toast.error("Assignment failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white rounded-xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {project.title}
        </h2>

        <p className="mb-2 text-gray-700">
          <strong>Abstract:</strong> {project.abstract}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Keywords:</strong> {project.keywords}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Submitted By:</strong> {project.teamName}
        </p>
        <p className="mb-4 text-gray-700">
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
            Suggested Teachers (Based on Cosine Similarity)
          </label>

          <select
            className="w-full p-2 border rounded border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={loading}
          >
            <option value="">
              {loading ? "Loading suggestions..." : "-- Select Teacher --"}
            </option>

            {suggestedTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} ({(teacher.similarityScore * 100).toFixed(1)}%)
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            className="mt-3 px-4 py-2 bg-primary text-white rounded
                       hover:bg-primary/80 transition-colors"
          >
            Assign
          </button>
        </div>

        {/* Close */}
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
