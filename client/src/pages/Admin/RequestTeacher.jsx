
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
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
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  // Fetch requests from backend on mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await axios.get("/api/admin/supervisor/pending"); 
      console.log(res.data.teams)
      if (res.data.success) {
        setRequests(res.data.teams || []);
        if (isRefresh) {
          toast.success("Requests refreshed successfully");
        }
      } else {
        toast.error(res.data.message || "Failed to fetch supervisor requests");
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to fetch supervisor requests";
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      const url =
        decision === "APPROVED"
          ? "/api/admin/supervisor/approve"
          : "/api/admin/supervisor/decline";

      const response = await axios.post(url, { teamId: request.id });

      if (response.data.success) {
        // Update frontend state immediately
        setRequests((prev) =>
          prev.map((r) =>
            r.id === request.id ? { ...r, status: decision } : r
          )
        );

        toast.success(
          `Request for ${request.teamName} ${decision.toLowerCase()} successfully`
        );
      } else {
        throw new Error(response.data.message || "Failed to update request");
      }
    } catch (err) {
      console.error("Error updating request:", err.stack);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to update request";
      toast.error(errorMessage);
      
      // Refresh the list in case of error to ensure data consistency
      fetchRequests(true);
    } finally {
      setActionLoading(false);
      setShowModal(false);
      setModalData(null);
    }
  };

  const handleRefresh = () => {
    fetchRequests(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 font-semibold";
      case "REJECTED":
        return "text-red-600 font-semibold";
      case "PENDING":
        return "text-yellow-600 font-semibold";
      default:
        return "text-gray-600 font-semibold";
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case "APPROVED":
        return `${baseClasses} bg-green-100 text-green-700`;
      case "REJECTED":
        return `${baseClasses} bg-red-100 text-red-700`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 overflow-auto">
        <AdminHeader adminName="Admin" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Project Teacher Requests
          </h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Team Name
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      Teacher
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="p-4 text-center text-sm font-semibold text-gray-700">
                      Action
                    </th>
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
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          title="View Team Details"
                        >
                          {req.name}
                        </button>
                      </td>
                      <td className="p-4 text-gray-700">
                        {req.supervisor.name || "N/A"}
                      </td>
                      <td className="p-4 text-center">
                        <span className={getStatusBadge(req.status)}>
                          {req.supervisorStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        {req.supervisorStatus === "pending" ? (
                          <div className="flex justify-center gap-2">
                            <button
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleDecision(req, "APPROVED")}
                              disabled={actionLoading}
                            >
                              Accept
                            </button>
                            <button
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleDecision(req, "REJECTED")}
                              disabled={actionLoading}
                            >
                              Reject
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
          ) : (
            <div className="p-12 text-center">
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
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-3 rounded-full flex-shrink-0 ${
                    modalData.decision === "APPROVED" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <AlertCircle
                    size={24}
                    className={
                      modalData.decision === "APPROVED" ? "text-green-600" : "text-red-600"
                    }
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {modalData.decision === "APPROVED"
                      ? "Approve Request"
                      : "Reject Request"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to{" "}
                    <span className="font-semibold">
                      {modalData.decision === "APPROVED" ? "approve" : "reject"}
                    </span>{" "}
                    the teacher request for team{" "}
                    <span className="font-semibold text-gray-800">
                      {modalData.request.teamName}
                    </span>
                    ?
                  </p>
                  {modalData.request.teacherName && (
                    <p className="text-sm text-gray-500 mt-2">
                      Teacher: <span className="font-medium">{modalData.request.teacherName}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setModalData(null);
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-5 py-2.5 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    modalData.decision === "APPROVED"
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
