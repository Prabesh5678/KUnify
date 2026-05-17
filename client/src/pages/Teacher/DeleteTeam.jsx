import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { Trash2 } from "lucide-react";

export default function TeamDeleteRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [selectedAccept, setSelectedAccept] = useState(null);
  const [error, setError] = useState("");
const [actionLoading, setActionLoading] = useState(false);
  const { triggerRequestRefetch } = useAppContext();

  const fetchDeleteRequests = async () => {
    try {
      const { data } = await axios.get(
        "/api/teacher/teams?get=deletion",
        { withCredentials: true }
      );

      if (data.success) {
        setRequests(data.teams);
      } else {
     toast.error(data.message||"Failed to fetch requests");
      }
    } catch (err) {
      setError("Failed to load requests");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeleteRequests();
  }, []);

  const handleAccept = async () => {
  try {
    setActionLoading(true);
    const teamId = selectedAccept?._id;
      console.log("Deleting team:", teamId);
    const { data } = await axios.post(
      `/api/teacher/delete-team/${teamId}?action=confirm`,
      {},
      { withCredentials: true }
    );
    if (data.success) {
      setRequests((prev) => prev.filter((r) => r._id !== teamId));
      setAcceptDialogOpen(false);
      triggerRequestRefetch();
      toast.success("Team deleted successfully!");
    } else {
      toast.error(data.message || "Failed to delete team");
    }
  } catch (err) {
    toast.error("Failed to accept request");
  } finally {
    setActionLoading(false);
  }
};

const handleReject = async () => {
  try {
    setActionLoading(true);
    const teamId = selected?._id;
    const { data } = await axios.post(
      `/api/teacher/delete-team/${teamId}?action=cancel`,
      {},
      { withCredentials: true }
    );
    if (data.success) {
      setRequests((prev) => prev.filter((r) => r._id !== teamId));
      setDialogOpen(false);
      triggerRequestRefetch();
      toast.success("Delete request rejected");
    } else {
      toast.error(data.message || "Failed to reject request");
    }
  } catch (err) {
    toast.error("Failed to reject request");
  } finally {
    setActionLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-primary/10">
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Team Delete Requests</h1>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        {requests.length === 0 ? (
          <p className="text-gray-500">No delete requests found.</p>
        ) : (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow-md border p-5"
              >
                <div className="flex justify-between items-start gap-4">

                  {/* LEFT SIDE */}
                  <div>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                      <Trash2 size={18} />
                      {req.name}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      Students:{" "}
                      {req.members?.map((s, i) => (
                        <span key={i}>
                          {s.name}
                          {i !== req.members.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAccept(req);
                        setAcceptDialogOpen(true);
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => {
                        setSelected(req);
                        setDialogOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {dialogOpen && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">
              Reject Delete Request
            </h2>

            <p className="text-gray-600 mb-4">
              Reject delete request for <b>{selected.name}</b>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 border rounded-md cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCEPT MODAL */}
      {acceptDialogOpen && selectedAccept && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">
              Confirm Team Deletion
            </h2>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <b>{selectedAccept.name}</b>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAcceptDialogOpen(false)}
                className="px-4 py-2 border rounded-md cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-red-600 text-white rounded-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}