import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import AddLogEntryModal from "../../components/AddLogEntryModal";

const LogsList = ({ logs }) => {
  const [expandedLog, setExpandedLog] = useState(null);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {logs.map((log, index) => (
        <div
          key={index}
          className="border rounded-2xl shadow-sm p-4 cursor-pointer"
          onClick={() =>
            setExpandedLog(expandedLog === index ? null : index)
          }
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold">{log.logName}</h3>
            <span className="text-sm text-gray-500">{log.date}</span>
          </div>

          {expandedLog === index && (
            <div className="mt-4 space-y-4">
              {log.teamEntries.map((m, idx) => (
                <div key={idx} className="border rounded-xl p-4">
                  <p className="font-semibold">{m.name}</p>
                  <p><b>Activity:</b> {m.activity}</p>
                  <p><b>Outcome:</b> {m.outcome}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TeamLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchTeamMembers();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get(`/logs/team/YOUR_TEAM_ID`);
    if (res.data.success) setLogs(res.data.logs);
  };

  const fetchTeamMembers = async () => {
    const res = await axios.get("/student/team/members");
    if (res.data.success) setMembers(res.data.members);
  };

  const handleAddLog = async (payload) => {
    const res = await axios.post("/logs", payload);
    if (res.data.success) {
      toast.success(res.data.message);
      fetchLogs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster />

      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Logs</h1>
        <button onClick={() => setOpen(true)} className="bg-primary text-white px-5 py-2 rounded-xl">
          + Add New Log
        </button>
      </div>

      <LogsList logs={logs} />

      <AddLogEntryModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onAdd={handleAddLog}
        teamMembers={members}
      />
    </div>
  );
};

export default TeamLogPage;
