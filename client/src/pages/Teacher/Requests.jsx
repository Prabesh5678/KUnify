import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

export default function TeamRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const { triggerRequestRefetch } = useAppContext();

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
  ];
  // ------------------------------------------------------------

  const fetchTeamRequests = async () => {
    try {
      // BACKEND (when ready)
      const {data} = await axios.get("/api/teacher/teams?get=request", { withCredentials: true });
      if(data.success)
      {
      setRequests(data.teams);
      }else{
        toast.error('Unable to get teams!')
        console.error(data.message)
      }
      // TEMP:
      // setRequests(testRequests);
    } catch (err) {
      setError("Failed to load requests");
      console.error(err.stack);
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
      const {data}=  await axios.post("/api/teacher/team-request?action=accept", { requestId: reqId }, { withCredentials: true });
      if(data.success){
        toast.success("Project accepted successfully!");
        triggerRequestRefetch();
        setRequests((prev) => prev.filter((r) => r._id !== reqId));}
      else{
        toast.error('Unable to accept team')
        console.error(data.message)
      }
    } catch (err) {
      console.error(err.stack);
      toast.error("Failed to accept project.");
    }
  };

  const handleReject = async () => {
    try {
      // BACKEND (when ready)
      const {data}=  await axios.post("/api/teacher/team-request?action=decline", { requestId: selected._id }, { withCredentials: true });
      if(data.success){
        setRequests((prev) => prev.filter((r) => r._id !== selected._id));
        triggerRequestRefetch();
      setDialogOpen(false);
      toast.success("Project decline successfully!");}
      else{
        toast.error('Failed to decline team!')
        console.error(data.message)
      }
    } catch (err) {
      console.error(err.stack);
      toast.error("Failed to decline project.");
    }
  };


  return (
    <div className="min-h-screen bg-primary/10">
      
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
                key={req._id}// this will be teamId
                className="bg-white rounded-xl shadow-md border border-gray-200 p-5"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-bold text-lg">{req.proposal.projectTitle}</h2>
                    <p className="text-gray-600">Team: {req.name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Keywords: {req.proposal.projectKeyword}
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
                  <strong>Abstract:</strong> {req.proposal.abstract}
                </div>

                <div className="mt-2 text-gray-700">
                  <strong>Proposal PDF:</strong>{" "}
                  <a
                    href={req.proposal.proposalFile.url}
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
              <span className="font-bold">{selected.proposal.projectTitle}</span>?
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
