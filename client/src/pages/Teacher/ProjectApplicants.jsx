import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = "/api/teacher/my-projects";

const ProjectApplicants = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const [projectsRes, applicantsRes] = await Promise.all([
        axios.get(API_BASE),
        axios.get(`${API_BASE}/${projectId}/applicants`),
      ]);
      const matched = projectsRes.data.find((p) => p._id === projectId);
      setProject(matched || null);

      if (applicantsRes.data?.success) {
        setApplicants(applicantsRes.data.applicants || []);
      } else {
        setApplicants([]);
        toast.error(applicantsRes.data?.message || "Failed to load applicants");
      }
    } catch (err) {
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [projectId]);

  const handleDecision = async (studentId, decision) => {
    try {
      setActingId(studentId);
      await axios.post(`${API_BASE}/${projectId}/applicants/${studentId}`, {
        status: decision,
      });
      setApplicants((prev) =>
        prev.map((a) =>
          a.studentId === studentId ? { ...a, status: decision } : a
        )
      );
      toast.success(decision === "accepted" ? "Applicant accepted" : "Applicant rejected");
    } catch (err) {
      toast.error("Failed to update applicant");
    } finally {
      setActingId(null);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
        {status || "pending"}
      </span>
    );
  };

  if (loading) {
    return <div className="px-4 py-10 text-center text-sm text-gray-500">Loading applicants...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-0">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {project?.title || "Project"} — Applicants
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and decide on students who applied to this project.
        </p>
      </div>

      {applicants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">
          No applicants yet.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:block">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applicants.map((applicant) => (
                  <tr key={applicant.studentId}>
                    <td className="px-4 py-3 font-medium text-gray-900">{applicant.name}</td>
                    <td className="px-4 py-3 text-gray-500">{applicant.email}</td>
                    <td className="px-4 py-3">{statusBadge(applicant.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDecision(applicant.studentId, "accepted")}
                          disabled={actingId === applicant.studentId || applicant.status === "accepted"}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecision(applicant.studentId, "rejected")}
                          disabled={actingId === applicant.studentId || applicant.status === "rejected"}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {applicants.map((applicant) => (
              <div key={applicant.studentId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{applicant.name}</p>
                    <p className="text-xs text-gray-500">{applicant.email}</p>
                  </div>
                  {statusBadge(applicant.status)}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleDecision(applicant.studentId, "accepted")}
                    disabled={actingId === applicant.studentId || applicant.status === "accepted"}
                    className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecision(applicant.studentId, "rejected")}
                    disabled={actingId === applicant.studentId || applicant.status === "rejected"}
                    className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectApplicants;
