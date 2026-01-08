import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import AddLogEntryModal from "../../components/AddLogEntryModal";
import { useAppContext } from "../../context/AppContext";

const Logsheet = () => {
  const { user } = useAppContext();

  const [myLogs, setMyLogs] = useState([]);
  const [teamLogs, setTeamLogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my"); // my | team
  const [editLog, setEditLog] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState({}); // Tracks expanded logs

  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  const userId = user._id;
  const teamId = user.teamId._id;

  const activityLimit = 100; // preview limit
  const outcomeLimit = 150; // preview limit

  useEffect(() => {
    if (activeTab === "my") fetchMyLogs();
    else fetchTeamLogs();
  }, [activeTab]);

  const fetchMyLogs = async () => {
    try {
      const { data } = await axios.get(`/api/log/user/${userId}`);
      if (data.success) setMyLogs(data.logs);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to fetch my logs");
    }
  };

  const fetchTeamLogs = async () => {
    try {
      const { data } = await axios.get(`/api/log/team/${teamId}`);
      if (data.success) setTeamLogs(data.logs);
      else toast.error(data.message);
    } catch {
      toast.error("Failed to fetch team logs");
    }
  };

  const groupLogsByWeek = (logs) => {
    return logs.reduce((acc, log) => {
      const week = log.week || "Unknown Week";
      if (!acc[week]) acc[week] = [];
      acc[week].push(log);
      return acc;
    }, {});
  };

  const logsToShow = activeTab === "my" ? myLogs : teamLogs;
  const groupedLogs = groupLogsByWeek(logsToShow);

  // Edit log
  const handleEdit = (log) => {
    setEditLog(log);
    setOpen(true);
  };

  // Delete log
  const handleDelete = (id) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const confirmDeleteLog = async () => {
    const { id } = confirmDelete;
    try {
      await axios.delete(`/api/log/delete/${id}`);
      toast.success("Log deleted");
      activeTab === "my" ? fetchMyLogs() : fetchTeamLogs();
    } catch {
      toast.error("Failed to delete log");
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const toggleExpand = (id) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderText = (text, limit, id) => {
    if (!text) return null;
    const isLong = text.length > limit;
    const expanded = expandedLogs[id];
    return (
      <span className="break-words">
        {isLong && !expanded ? text.slice(0, limit) + "..." : text}{" "}
        {isLong && (
          <button
            onClick={() => toggleExpand(id)}
            className="text-blue-500 underline ml-1"
          >
            {expanded ? "See less" : "See more"}
          </button>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8 px-4">
        <h1 className="text-3xl font-extrabold text-gray-800">Logsheet</h1>
        {activeTab === "my" && (
          <button
            onClick={() => {
              setEditLog(null);
              setOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 transition text-white px-6 py-2.5 rounded-xl shadow"
          >
            + Add Log
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto flex gap-3 mb-8 px-4">
        <button
          onClick={() => setActiveTab("my")}
          className={`px-5 py-2 rounded-full font-medium transition cursor-pointer ${activeTab === "my"
            ? "bg-primary text-white shadow"
            : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
        >
          My Logs
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`px-5 py-2 rounded-full font-medium transition cursor-pointer ${activeTab === "team"
            ? "bg-primary text-white shadow"
            : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
        >
          Team Logs
        </button>
      </div>

      {/* Logs */}
      <div className="max-w-5xl mx-auto space-y-5 px-4">
        {Object.keys(groupedLogs).length === 0 && (
          <p className="text-gray-500 text-center py-10">No logs found</p>
        )}


        {Object.keys(groupedLogs).length === 0 && (
          <p className="text-gray-500 text-center py-10">No logs found</p>
        )}

        {Object.entries(groupedLogs)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([week, logs]) => (
            <div key={week} className="space-y-4">
              {/* Week Header */}
              <h2 className="text-xl font-bold text-gray-700 border-b pb-1 ml-2">
                Week {week}
              </h2>

              {logs.map((log) => (
                <div
                  key={log._id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-gray-800">
                      {new Date(log.date).toLocaleDateString()}
                    </h3>

                    {activeTab === "team" && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                        {log.createdBy?.name || "User"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold text-blue-600">Activity:</span>{" "}
                      {renderText(log.activity, activityLimit, log._id + "_activity")}
                    </p>

                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">Outcome:</span>{" "}
                      {renderText(log.outcome, outcomeLimit, log._id + "_outcome")}
                    </p>
                  </div>

                  {activeTab === "my" && (
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        className="text-blue-600 font-semibold cursor-pointer"
                        onClick={() => handleEdit(log)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 font-semibold cursor-pointer"
                        onClick={() => handleDelete(log._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>


      {/* Add/Edit Modal */}
      <AddLogEntryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSuccess={fetchMyLogs}
        myLogs={myLogs}
        editLog={editLog}
      />

      {/* Delete Confirmation */}
      {confirmDelete.isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setConfirmDelete({ isOpen: false, id: null })}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
              <h2 className="text-lg font-bold mb-3">Delete Log</h2>
              <p className="text-gray-700 mb-5">
                Are you sure you want to delete this log?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete({ isOpen: false, id: null })}
                  className="px-5 py-2 bg-gray-100 rounded-xl cursor-pointer "
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteLog}
                  className="px-5 py-2 bg-red-600 text-white rounded-xl cursor-pointer "
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Logsheet;
