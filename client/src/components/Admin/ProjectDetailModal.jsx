import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { ExternalLink } from "lucide-react";

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

        // Fallback to project.teachers if backend API not available
        let teachers = project.teachers || [];

        // Uncomment if backend endpoint exists
        // const res = await axios.get(`/api/admin/projects/${project._id}/suggested-teachers`);
        // teachers = res.data;

        setSuggestedTeachers(teachers);
      } catch (err) {
        console.error("Failed to fetch suggested teachers", err);
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
      setLoading(true);
      const res = await axios.post(
        `/api/admin/projects/${project._id}/assign-teacher`,
        { teacherId: selectedTeacher },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Teacher assigned successfully!");
        if (onAssignTeacher) {
          onAssignTeacher(selectedTeacher, project._id, res.data.updatedProject);
        }
        setSelectedTeacher("");
        onClose();
      } else {
        toast.error(res.data.message || "Assignment failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (url) => {
    if (!url) return toast.error("PDF not found");
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
    window.open(viewerUrl, "_blank");
  };

  const teamName = project.team?.name || project.teamName || "N/A";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white rounded-xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-md">
        {/* Project Title */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {project.proposal?.projectTitle || project.title || "Untitled Project"}
        </h2>

        {/* Project Proposal */}
        {project.proposal && (
          <div className="bg-white p-4 rounded-xl shadow mb-4 space-y-2">
            <p><b>Abstract:</b> {project.proposal.abstract || "N/A"}</p>
            <p><b>Keywords:</b> {project.proposal.projectKeyword || "N/A"}</p>
            {project.proposal.proposalFile?.url && (
              <button
                onClick={() => handleViewPDF(project.proposal.proposalFile.url)}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded inline-flex items-center gap-2"
              >
                <ExternalLink size={16} /> View PDF
              </button>
            )}
          </div>
        )}

        {/* Requested Teacher */}
        <div className="bg-white p-4 rounded-xl shadow mb-4 space-y-2">
          <p>
            {project.requestedTeacher?.name
              ? project.requestedTeacher.name
              : "No teacher requested"}
          </p>
          <p>
            <strong>Teacher Acceptance Status:</strong>{" "}
            {project.teacherAccepted ? (
              <span className="text-green-600 font-semibold">Accepted</span>
            ) : (
              <span className="text-red-600 font-semibold">Not Accepted</span>
            )}
          </p>
        </div>

        {/* Suggested Teachers */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Suggested Teachers
          </label>
          <select
            className="w-full p-2 border rounded border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={loading}
          >
            <option value="">{loading ? "Loading..." : "-- Select Teacher --"}</option>
            {suggestedTeachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} ({t.currentProjects || 0}/5)
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="mt-3 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>

        {/* Close Button */}
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
