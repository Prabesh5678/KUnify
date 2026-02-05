import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

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

        // Use backend endpoint if exists, otherwise fallback to project.teachers
        let teachers = project.teachers || [];

        // If you have a backend API for suggestions uncomment:
        // const res = await axios.get(`/api/admin/projects/${project._id}/suggested-teachers`);
        // teachers = res.data;

        setSuggestedTeachers(teachers);
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
      setLoading(true);

      // Backend API call to assign teacher
      const res = await axios.post(
        `/api/admin/projects/${project._id}/assign-teacher`,
        { teacherId: selectedTeacher },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Teacher assigned successfully!");

        // Update parent component state
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="relative bg-white rounded-xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {project.proposal?.projectTitle || project.title}
        </h2>

        <p className="mb-2 text-gray-700">
          <strong>Abstract:</strong> {project.proposal?.abstract || "N/A"}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Keywords:</strong> {project.proposal?.keywords || "N/A"}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>Submitted By:</strong> {project.teamName || "N/A"}
        </p>
        {project.proposal?.proposalFile?.url && (
          <p className="mb-4 text-gray-700">
            <strong>Proposal:</strong>{" "}
            <a
              href={project.proposal.proposalFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 underline hover:text-sky-700 transition-colors"
            >
              View PDF
            </a>
          </p>
        )}

        {/* Requested Teacher Section */}
        <div className="mb-4 p-4 border rounded border-sky-200 bg-sky-50">
          <p className="font-semibold text-gray-700">
            Requested Teacher by Students:
          </p>
          {project.requestedTeacher ? (
            <p className="text-gray-700">{project.requestedTeacher.name}</p>
          ) : (
            <p className="text-gray-700">No teacher requested</p>
          )}

          <p className="mt-2 text-gray-700">
            <strong>Teacher Acceptance Status:</strong>{" "}
            {project.teacherAccepted ? (
              <span className="text-green-600 font-semibold">Accepted</span>
            ) : (
              <span className="text-red-600 font-semibold">Not Accepted</span>
            )}
          </p>
        </div>

        {/* Assign Teacher */}
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
            <option value="">
              {loading ? "Loading..." : "-- Select Teacher --"}
            </option>
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
