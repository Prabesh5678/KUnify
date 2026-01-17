import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import TeacherHeader from "../../components/Teacher/TeacherHeader";

export default function TeamRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  // ---------- TEST DATA (replace with backend later) ----------
  const testRequests = [
    {
      _id: "req1",
      teamName: "Team Alpha",
      projectTitle: "Smart Attendance System",
      keywords: "AI, Attendance, Face Recognition",
      abstract:
        "This project aims to automate attendance using face recognition and machine learning.",
      proposalFileUrl: "/pdf_image.png",
    },
    {
      _id: "req2",
      teamName: "Team Beta",
      projectTitle: "Online Examination System",
      keywords: "Web, Security, Proctoring",
      abstract:
        "This project provides a secure online exam platform with live monitoring.",
      proposalFileUrl: "/pdf_image.png",
    },
     {
      _id: "req2",
      teamName: "Team Beta",
      projectTitle: "Online Examination System",
      keywords: "Web, Security, Proctoring",
      abstract:
        "This project provides a secure online exam platform with live monitoring.",
      proposalFileUrl: "/pdf_image.png",
    },
     {
      _id: "req2",
      teamName: "Team Beta",
      projectTitle: "Online Examination System",
      keywords: "Web, Security, Proctoring",
      abstract:
        "This project provides a secure online exam platform with live monitoring.",
      proposalFileUrl: "/pdf_image.png",
    },
  ];
  // ------------------------------------------------------------

  const fetchTeamRequests = async () => {
    try {
      // BACKEND (when ready)
      // const res = await axios.get("/api/teacher/team-requests", { withCredentials: true });
      // setRequests(res.data.requests);

      // TEMP:
      setRequests(testRequests);
    } catch (err) {
      setError("Failed to load requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamRequests();
  }, []);

  const openRejectDialog = (req) => {
    setSelected(req);
    setDialogOpen(true);
  };

  const handleAccept = async (reqId) => {
    try {
      // BACKEND (when ready)
      // await axios.post("/api/teacher/team-requests/accept", { requestId: reqId }, { withCredentials: true });

      setRequests((prev) => prev.filter((r) => r._id !== reqId));
      toast.success("Project accepted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept project.");
    }
  };

  const handleReject = async () => {
    try {
      // BACKEND (when ready)
      // await axios.post("/api/teacher/team-requests/reject", { requestId: selected._id }, { withCredentials: true });

      setRequests((prev) => prev.filter((r) => r._id !== selected._id));
      setDialogOpen(false);
      toast.success("Project rejected successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject project.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-primary/10">
      <TeacherHeader teacherName="Teacher" />

      {/* MAIN CONTENT */}
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Team Requests</h1>

        {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

        {requests.length === 0 ? (
          <p className="text-gray-500">No team requests available.</p>
        ) : (
          // 1. Make this section scroll-safe with max height + overflow
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-5"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-bold text-lg">{req.projectTitle}</h2>
                    <p className="text-gray-600">Team: {req.teamName}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Keywords: {req.keywords}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => openRejectDialog(req)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Decline
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-gray-700">
                  <strong>Abstract:</strong> {req.abstract}
                </div>

                <div className="mt-2 text-gray-700">
                  <strong>Proposal PDF:</strong>{" "}
                  <a
                    href={req.proposalFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Confirmation Dialog */}
      {dialogOpen && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-2">
              Confirm Rejection
            </h2>

            <p className="text-gray-600 mb-4">
              Are you sure you want to reject the project{" "}
              <span className="font-bold">{selected.projectTitle}</span>?
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
