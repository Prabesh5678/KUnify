import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const StudentProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null); // null | "pending" | "accepted" | "rejected"
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");

  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const fetchData = async () => {
  try {
    const [projectsRes, applicationsRes] = await Promise.all([
      axios.get("/api/student/projects"),
      axios.get("/api/student/projects/my-applications"),
    ]);

    if (!projectsRes.data.success) {
      setError(projectsRes.data.message || "Failed to load project details.");
      return;
    }

    const projectsList = projectsRes.data.projects || [];
    const found = projectsList.find((p) => p._id === projectId);

    if (!found) {
      setError("Project not found.");
    } else {
      setProject(found);
    }

    if (applicationsRes.data.success) {
      const applications = applicationsRes.data.applications || [];
      const existingApplication = applications.find(
        (app) => app.project?._id === projectId || app.project === projectId
      );
      if (existingApplication) {
        setApplicationStatus(existingApplication.status);
      }
    }
  } catch (err) {
    setError("Failed to load project details.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post(`/api/student/projects/${projectId}/apply`);
      setApplicationStatus("pending");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplying(false);
      setShowApplyConfirm(false);
    }
  };

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await axios.delete(`/api/student/projects/${projectId}/apply`);
      setApplicationStatus(null);
    } catch (err) {
        toast.error("Failed to load project details.");
      setError(err.response?.data?.message || "Failed to revoke application.");
    } finally {
      setRevoking(false);
      setShowRevokeConfirm(false);
    }
  };

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!project) return null;

const renderActionButton = () => {
  if (applicationStatus === "accepted") {
    return (
      <span className="inline-block bg-green-100 text-green-700 px-5 py-3 rounded-xl font-semibold">
        Enrolled
      </span>
    );
  }

 if (applicationStatus === "pending") {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="inline-flex justify-center rounded-xl bg-yellow-100 px-5 py-3 font-semibold text-yellow-700 text-center">
        Application Pending
      </span>

      <button
        onClick={() => setShowRevokeConfirm(true)}
        className="w-full rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 cursor-pointer sm:w-auto"
      >
        Revoke Application
      </button>
    </div>
  );
}

  if (applicationStatus === "rejected") {
    return (
      <span className="inline-block bg-red-100 text-red-700 px-5 py-3 rounded-xl font-semibold">
        Application Rejected
      </span>
    );
  }

  if (project.status !== "open") {
    return (
      <span className="inline-block bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold">
        Project Closed
      </span>
    );
  }

  return (
    <button
      onClick={() => setShowApplyConfirm(true)}
      disabled={applying}
      className="bg-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {applying ? "Applying..." : "Apply Now"}
    </button>
  );
};

return (
  <div className="min-h-screen bg-gray-50 p-4 md:p-6">
    <div className="max-w-4xl mx-auto">
     
      {/* Project Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <p className="mt-2 text-white/90">
                By {project.teacher?.name || "N/A"}
              </p>
            </div>

            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                project.status === "open"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Project Description
            </h2>

            <p className="text-gray-600 leading-7 whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Technologies */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Technologies Required
            </h2>

            <div className="flex flex-wrap gap-3">
              {project.technologies?.map((tech, i) => (
                <span
                  key={i}
                  className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="border-t pt-6 flex justify-end">
            {renderActionButton()}
          </div>
        </div>
      </div>
    </div>

    {/* Apply Confirmation Dialog */}
    {showApplyConfirm && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Apply to this project?
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to apply on the project?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowApplyConfirm(false)}
              disabled={applying}
              className="px-5 py-2 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-5 py-2 rounded-xl font-medium text-white bg-primary hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {applying ? "Applying..." : "Yes, Apply"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Revoke Confirmation Dialog */}
    {showRevokeConfirm && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Revoke your application?
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to revoke your submitted application? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowRevokeConfirm(false)}
              disabled={revoking}
              className="px-5 py-2 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRevoke}
              disabled={revoking}
              className="px-5 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 cursor-pointer"
            >
              {revoking ? "Revoking..." : "Yes, Revoke"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};
export default StudentProjectDetail;