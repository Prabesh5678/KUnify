/* this is to be implemented later do not remove
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const RequestTeacher = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch supervisor requests from backend on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get("/admin/supervisor/requests"); // Your endpoint to get requests
      setRequests(response.data.requests);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch requests");
    }
  };

  const handleDecision = (req, decision) => {
    setModalData({ request: req, decision });
    setShowModal(true);
  };

  const confirmAction = async () => {
    const { request, decision } = modalData;
    setActionLoading(true);

    try {
      if (decision === "APPROVED") {
        await axios.post("/admin/supervisor/approve", { id: request.id });
      } else {
        await axios.post("/admin/supervisor/decline", { id: request.id });
      }

      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id ? { ...r, status: decision } : r
        )
      );

      toast.success(
        `Request for ${request.teamName} ${decision.toLowerCase()} successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update request");
    } finally {
      setActionLoading(false);
      setShowModal(false);
      setModalData(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 font-semibold";
      case "REJECTED":
        return "text-red-600 font-semibold";
      default:
        return "text-yellow-600 font-semibold";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
     
      <AdminSidebar />

    
      <div className="flex-1 p-8 overflow-auto">
        <AdminHeader adminName="Admin" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Project Teacher Requests
        </h2>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-gray-600 text-left">Team</th>
                <th className="p-3 text-gray-600 text-left">Teacher</th>
                <th className="p-3 text-gray-600 text-center">Status</th>
                <th className="p-3 text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr
                  key={req.id}
                  className={`border-b hover:shadow-md transition-all duration-200 ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                  }`}
                >
                  <td
                    className="p-3 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/teamdetail/${req.id}`)}
                    title="View Team Details"
                  >
                    {req.teamName}
                  </td>
                  <td className="p-3">{req.teacherName}</td>
                  <td
                    className={`p-3 text-center ${getStatusStyle(req.status)}`}
                  >
                    {req.status}
                  </td>
                  <td className="p-3 text-center">
                    {req.status === "PENDING" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          onClick={() => handleDecision(req, "APPROVED")}
                          disabled={actionLoading}
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          onClick={() => handleDecision(req, "REJECTED")}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Action</span>
                    )}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

       
        {showModal && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-full ${
                    modalData.decision === "APPROVED"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <AlertCircle
                    size={22}
                    className={
                      modalData.decision === "APPROVED"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {modalData.decision === "APPROVED"
                    ? "Approve Project Request?"
                    : "Reject Project Request?"}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to{" "}
                <span className="font-semibold">
                  {modalData.decision === "APPROVED" ? "accept" : "decline"}
                </span>{" "}
                the request for team{" "}
                <span className="font-semibold">{modalData.request.teamName}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded-xl text-white ${
                    modalData.decision === "APPROVED"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Yes"}
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
*/
import React, { useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Axios config
axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

const RequestTeacher = () => {
  const [requests, setRequests] = useState([
    { id: "69737319f89ac97dc2b446d9", teamName: "Team Alpha", teacherName: "Mr. Sharma", status: "PENDING" },
    { id: "64f1c8a2b5d2e5a9f1e12346", teamName: "Team Beta", teacherName: "Ms. Joshi", status: "PENDING" },
    { id: "64f1c8a2b5d2e5a9f1e12347", teamName: "Team Gamma", teacherName: "Dr. KC", status: "APPROVED" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const handleDecision = (req, decision) => {
    setModalData({ request: req, decision });
    setShowModal(true);
  };

  const confirmAction = async () => {
    const { request, decision } = modalData;
    setActionLoading(true);

    try {
      const url =
        decision === "APPROVED"
          ? "/api/admin/supervisor/approve"
          : "/api/admin/supervisor/decline";

      // ✅ Send teamId as required by backend
      await axios.post(url, { teamId: request.id });

      // Update frontend state immediately
      setRequests((prev) =>
        prev.map((r) =>
          r.id === request.id ? { ...r, status: decision } : r
        )
      );

      toast.success(
        `Request for ${request.teamName} ${decision.toLowerCase()} successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update request"
      );
    } finally {
      setActionLoading(false);
      setShowModal(false);
      setModalData(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 font-semibold";
      case "REJECTED":
        return "text-red-600 font-semibold";
      default:
        return "text-yellow-600 font-semibold";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-8 overflow-auto">
        <AdminHeader adminName="Admin" />

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Project Teacher Requests
        </h2>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-gray-600 text-left">Team</th>
                <th className="p-3 text-gray-600 text-left">Teacher</th>
                <th className="p-3 text-gray-600 text-center">Status</th>
                <th className="p-3 text-gray-600 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr
                  key={req.id}
                  className={`border-b hover:shadow-md transition-all duration-200 ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                  }`}
                >
                  <td
                    className="p-3 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/admin/teamdetail/${req.id}`)}
                    title="View Team Details"
                  >
                    {req.teamName}
                  </td>
                  <td className="p-3">{req.teacherName}</td>
                  <td className={`p-3 text-center ${getStatusStyle(req.status)}`}>
                    {req.status}
                  </td>
                  <td className="p-3 text-center">
                    {req.status === "PENDING" ? (
                      <div className="flex justify-center gap-2">
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          onClick={() => handleDecision(req, "APPROVED")}
                          disabled={actionLoading}
                        >
                          Accept
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                          onClick={() => handleDecision(req, "REJECTED")}
                          disabled={actionLoading}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">No Action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-2 rounded-full ${
                    modalData.decision === "APPROVED" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <AlertCircle
                    size={22}
                    className={
                      modalData.decision === "APPROVED" ? "text-green-600" : "text-red-600"
                    }
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {modalData.decision === "APPROVED"
                    ? "Approve Project Request?"
                    : "Reject Project Request?"}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to{" "}
                <span className="font-semibold">
                  {modalData.decision === "APPROVED" ? "accept" : "decline"}
                </span>{" "}
                the request for team{" "}
                <span className="font-semibold">{modalData.request.teamName}</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-100"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 rounded-xl text-white ${
                    modalData.decision === "APPROVED"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Yes"}
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
