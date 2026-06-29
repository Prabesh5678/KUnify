import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSidebar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true;


const RequestTeacher = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/supervisor/pending`,
      );
      if (res.data.success) {
        setRequests(res.data.teams || []);
      } else {
        toast.error(res.data.message || "Failed to fetch supervisor requests");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch supervisor requests";
      toast.error(errorMessage);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = (req, decision) => {
    setModalData({ request: req, decision });
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!modalData) return;
    const { request, decision } = modalData;
    setActionLoading(true);

    try {
      const endpoint = decision === "APPROVED" ? "approve" : "decline";
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/admin/supervisor/${endpoint}`;
      const response = await axios.post(url, { teamId: request._id });

      if (response.data.success) {
        toast.success(
          `Request for ${request.name || request.teamName} ${decision === "APPROVED" ? "approved" : "rejected"
          } successfully`
        );
        await fetchRequests();
      } else {
        throw new Error(response.data.message || "Failed to update request");
      }
    } catch (err) {
      console.error("Error updating request:", err.stack);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update request";
      toast.error(errorMessage);
      await fetchRequests();
    } finally {
      setActionLoading(false);
      setShowModal(false);
      setModalData(null);
    }
  };

  const getStatusBadge = (supervisorStatus) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (supervisorStatus) {
      case "teacherApproved":
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case "adminApproved":
        return `${baseClasses} bg-green-100 text-green-700`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const getStatusLabel = (supervisorStatus) => {
    if (supervisorStatus === "teacherApproved") return "Pending Admin";
    if (supervisorStatus === "adminApproved") return "Approved";
    if (supervisorStatus === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <div className="flex min-h-screen h-screen bg-gray-50 overflow-x-hidden">
      <AdminSidebar />

      <div className="flex-1 p-4 sm:p-8 overflow-auto h-full">
        <AdminHeader adminName="Admin" />

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Project Teacher Requests
        </h2>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {requests.length > 0 ? (
            <>
              {/* Desktop table — hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">Team Name</th>
                      <th className="p-4 text-left text-sm font-semibold text-gray-700">Teacher</th>
                      <th className="p-4 text-center text-sm font-semibold text-gray-700">Status</th>
                      <th className="p-4 text-center text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((req) => (
                      <tr
                        key={req._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4">
                          <button
                            onClick={() => navigate(`/admin/teamdetail/${req._id}`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                            title="View Team Details"
                          >
                            {req.name}
                          </button>
                        </td>
                        <td className="p-4 text-gray-700">
                          {req.supervisor ? (
                            <button
                              onClick={() =>
                                navigate(`/admin/allteachers/${req.supervisor._id}`, {
                                  state: { teacher: req.supervisor },
                                })
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                              title="View Teacher Profile"
                            >
                              {req.supervisor.name}
                            </button>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className={getStatusBadge(req.supervisorStatus)}>
                            {getStatusLabel(req.supervisorStatus)}
                          </span>
                        </td>
                        <td className="p-4">
                          {req.supervisorStatus === "teacherApproved" ? (
                            <div className="flex justify-center gap-2">
                              <button
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
                                onClick={() => handleDecision(req, "APPROVED")}
                                disabled={actionLoading}
                              >
                                APPROVE
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                                onClick={() => handleDecision(req, "REJECTED")}
                                disabled={actionLoading}
                              >
                                DECLINE
                              </button>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-sm">
                              No action available
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards — visible only on small screens */}
              <div className="md:hidden divide-y divide-gray-200">
                {requests.map((req) => (
                  <div key={req._id} className="p-4 space-y-3">
                    {/* Team name + status row */}
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => navigate(`/admin/teamdetail/${req._id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm cursor-pointer text-left"
                        title="View Team Details"
                      >
                        {req.name}
                      </button>
                      <span className={getStatusBadge(req.supervisorStatus)}>
                        {getStatusLabel(req.supervisorStatus)}
                      </span>
                    </div>

                    {/* Teacher */}
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="font-medium text-gray-600">Teacher:</span>
                      {req.supervisor ? (
                        <button
                          onClick={() =>
                            navigate(`/admin/allteachers/${req.supervisor._id}`, {
                              state: { teacher: req.supervisor },
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          title="View Teacher Profile"
                        >
                          {req.supervisor.name}
                        </button>
                      ) : (
                        <span>N/A</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    {req.supervisorStatus === "teacherApproved" ? (
                      <div className="flex gap-2 pt-1">
                        <button
                          className="flex-1 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
                          onClick={() => handleDecision(req, "APPROVED")}
                          disabled={actionLoading}
                        >
                          APPROVE
                        </button>
                        <button
                          className="flex-1 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                          onClick={() => handleDecision(req, "REJECTED")}
                          disabled={actionLoading}
                        >
                          DECLINE
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-xs pt-1">No action available</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Requests Found
              </h3>
              <p className="text-gray-500 mb-4">
                There are currently no supervisor requests to review.
              </p>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showModal && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl transform transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-3 rounded-full flex-shrink-0 ${modalData.decision === "APPROVED" ? "bg-green-100" : "bg-red-100"
                    }`}
                >
                  <AlertCircle
                    size={24}
                    className={
                      modalData.decision === "APPROVED" ? "text-green-600" : "text-red-600"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    {modalData.decision === "APPROVED" ? "Approve Request" : "Reject Request"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to{" "}
                    <span className="font-semibold">
                      {modalData.decision === "APPROVED" ? "approve" : "reject"}
                    </span>{" "}
                    the teacher request for team{" "}
                    <span className="font-semibold text-gray-800">
                      {modalData.request.name || modalData.request.teamName}
                    </span>
                    ?
                  </p>
                  {modalData.request.supervisor?.name && (
                    <p className="text-sm text-gray-500 mt-2">
                      Teacher: <span className="font-medium">{modalData.request.supervisor.name}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setModalData(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 cursor-pointer"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-white font-medium transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${modalData.decision === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                    }`}
                  disabled={actionLoading}
                >
                  {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestTeacher;
