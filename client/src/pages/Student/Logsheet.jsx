import AddLogEntryModal from "../../components/AddLogEntryModal";
import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";


const memberColors = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-400" },
  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-400" },
  { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-400" },
  { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-400" },
  { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-400" },
];

const LogsList = ({ logs }) => {
  const [expandedLog, setExpandedLog] = useState(null);

  const reversedLogs = [...logs].reverse();

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {reversedLogs.map((log, index) => (
        <div
          key={index}
          className="border rounded-2xl shadow-sm p-4 hover:shadow-md transition cursor-pointer"
          onClick={() =>
            setExpandedLog(expandedLog === index ? null : index)
          }
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800 text-lg">
              {log.logName}
            </h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              <Calendar size={16} /> {log.date}
            </p>
          </div>

          {expandedLog === index && (
            <div className="mt-4 space-y-4">
              {log.teamEntries.map((member, idx) => {
                const color = memberColors[idx % memberColors.length];
                return (
                  <div
                    key={idx}
                    className={`${color.bg} ${color.border} border rounded-2xl p-4`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className={`w-10 h-10 ${color.badge} text-white rounded-full flex items-center justify-center font-bold`}
                      >
                        {idx + 1}
                      </div>
                      <p className="font-medium">{member.name}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Activity
                        </p>
                        <p>{member.activity}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Outcome
                        </p>
                        <p>{member.outcome}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const TeamLogPage = () => {
  const [logs, setLogs] = useState([
    {
      logName: "LOG-1",
      date: "2025-12-20",
      teamEntries: [
        { name: "Alice", activity: "Set up backend", outcome: "API working" },
        { name: "Bob", activity: "Designed UI", outcome: "Homepage ready" },
      ],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddLog = (newLog) => {
    setLogs((prev) => [...prev, newLog]);
    toast.success(`${newLog.logName} added successfully`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6 px-4">
        <h1 className="text-3xl font-bold">Team Logs</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-80 text-white px-5 py-2.5 rounded-xl font-semibold shadow"
        >
          + Add New Log
        </button>
      </div>

      <LogsList logs={logs} />

      {/* MODAL */}
      <AddLogEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddLog}
        existingLogs={logs}
        teamMembers={[
          { name: "Alice" },
          { name: "Bob" },
          { name: "Charlie" },
        ]}
      />
    </div>
  );
};

export default TeamLogPage;
