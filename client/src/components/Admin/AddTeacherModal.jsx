import React from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const ProjectDetailModal = ({ isOpen, onClose, project, onAssignTeacher }) => {
  if (!isOpen || !project) return null;

  const handleAssign = (teacherId) => {
    if (!teacherId) return toast.error("Select a teacher first");
    onAssignTeacher(teacherId, project._id);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-3xl shadow-lg relative overflow-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {project.name || "Team Details"}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <FaTimes />
          </button>
        </div>

        {/* Team info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <p>
            <span className="font-medium">Semester:</span> {project.semester || "N/A"}
          </p>
          <p>
            <span className="font-medium">Department:</span> {project.department || "N/A"}
          </p>
          <p>
            <span className="font-medium">Supervisor:</span> {project.supervisor?.name || "Not assigned"}
          </p>
          <p>
            <span className="font-medium">Project Title:</span> {project.proposal?.projectTitle || "N/A"}
          </p>
        </div>

        {/* Proposal */}
        {project.proposal && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p>
              <span className="font-medium">Abstract:</span> {project.proposal.abstract || "N/A"}
            </p>
            <p>
              <span className="font-medium">Keywords:</span> {project.proposal.keywords || "N/A"}
            </p>
            {project.proposal.proposalFile?.url && (
              <button
                onClick={() => window.open(project.proposal.proposalFile.url, "_blank")}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                View PDF
              </button>
            )}
          </div>
        )}

        {/* Assigned Teacher info */}
        <div className="mb-4">
          <p className="font-medium mb-2">Assigned Teacher:</p>
          {project.assignedTeacher ? (
            <div className="p-2 bg-blue-50 rounded flex justify-between items-center">
              <span>{project.assignedTeacher.name}</span>
              <span className="text-sm text-gray-600">
                Current Projects: {project.assignedTeacher.currentProjects || 0}
              </span>
            </div>
          ) : (
            <p className="text-gray-500">No teacher assigned</p>
          )}
        </div>

        {/* Assign teacher dropdown */}
        {project.teachers && project.teachers.length > 0 && (
          <div className="mb-4">
            <p className="font-medium mb-2">Assign Teacher:</p>
            <div className="flex gap-2 flex-wrap">
              {project.teachers.map((teacher) => (
                <button
                  key={teacher._id}
                  onClick={() => handleAssign(teacher._id)}
                  disabled={teacher.currentProjects >= 5} // max projects per teacher
                  className={`px-3 py-1 rounded text-white transition ${
                    teacher.currentProjects >= 5
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/80"
                  }`}
                >
                  {teacher.name} ({teacher.currentProjects || 0}/5)
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailModal;
