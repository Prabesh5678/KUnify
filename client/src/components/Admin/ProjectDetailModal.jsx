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

        // Use project.teachers as fallback
        let teachers = project.teachers || [];

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

  const teamName = project.team?.name || project.teamName || "Untitled Project";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-lg">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Project Title */}
        <h2 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">
          {project.proposal?.projectTitle || project.title || teamName}
        </h2>

        {/* Requested Teacher */}
        <div className="bg-gray-50 p-4 rounded-xl shadow mb-4 space-y-1">
          <p className="font-medium">
            Requested Teacher:{" "}
            <span className="text-gray-700">
              {project.requestedTeacher?.name || "None"}
            </span>
          </p>
          <p className="font-medium">
            Teacher Acceptance Status:{" "}
            {project.teacherAccepted ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                Accepted
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                Not Accepted
              </span>
            )}
          </p>
        </div>

        {/* Suggested Teachers */}
        <div className="mt-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Suggested Teachers
          </label>
          <select
            className="w-full p-2 border rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
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
            className="mt-3 w-full px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition cursor-pointer"
          >
            {loading ? "Assigning..." : "Assign Teacher"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
