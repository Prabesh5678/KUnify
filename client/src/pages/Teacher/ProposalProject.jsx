import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import UploadProject from "./UploadProject";

const TeacherProjectDashboard = ({ teacherId, teacherName = "" }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/teacher/my-projects");

      if (res.data.success) {
        setProjects(res.data.projects);
      } else {
        toast.error(res.data.message);
        setProjects([]);
      }
    } catch (err) {
      toast.error("Failed to load your projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectPublished = () => {
    setShowUploadModal(false);
    fetchProjects();
  };

  const handleEditProject = (project) => {
    navigate(`/teacher/uploadproject`, { state: { project } });
  };

  const handleViewApplicants = (e, projectId) => {
    e.stopPropagation(); 
    navigate(`/teacher/projectapplicants/${projectId}`);
  };

  const statusBadge = (status) => (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${status === "open" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
        }`}
    >
      {status}
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">My projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Projects you've published for students to apply to. Click a project to edit it.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary cursor-pointer"
        >
          + New project
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-gray-500">Loading your projects...</div>
      ) : !Array.isArray(projects) || projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-sm text-gray-500">You haven't published any projects yet.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-3 text-sm font-medium text-primary hover:text-primary cursor-pointer"
          >
            Publish your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleEditProject(project)}
              className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="font-medium text-gray-900">{project.title}</h2>
                {statusBadge(project.status)}
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-gray-500">{project.description}</p>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {(project.technologies || []).map((tech, i) => (
                  <span
                    key={`${project._id}-tech-${i}`}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>{project.applicantCount ?? 0} applicant{project.applicantCount === 1 ? "" : "s"}</span>
                <button
                  onClick={(e) => handleViewApplicants(e, project._id)}
                  className="font-medium text-primary hover:text-primary cursor-pointer"
                >
                  View applicants →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal - still used for creating a brand new project */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              aria-label="Close"
            >
              &times;
            </button>
            <UploadProject
              teacherId={teacherId}
              teacherName={teacherName}
              onPublished={handleProjectPublished}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherProjectDashboard;