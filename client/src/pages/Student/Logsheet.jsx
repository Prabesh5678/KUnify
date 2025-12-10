// src/pages/Student/Logsheet.jsx
import React, { useState } from "react";
import { Calendar, Clock, Plus, Trash2, Activity, FileText, Server, PenTool } from "lucide-react";
import AddLogEntryModal from "../../components/AddLogEntryModal";

const initialEntries = [
  {
    id: 1,
    date: "Dec 1, 2025",
    hours: 4,
    activity: "Initial project research and literature review",
    outcome: "Identified 5 relevant research papers and documented key findings",
    color: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: <FileText className="text-blue-600" size={20} />,
  },
  {
    id: 2,
    date: "Dec 5, 2025",
    hours: 2,
    activity: "Team meeting to discuss project scope and requirements",
    outcome: "Finalized project objectives and created initial timeline",
    color: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: <Activity className="text-purple-600" size={20} />,
  },
  {
    id: 3,
    date: "Dec 8, 2025",
    hours: 3,
    activity: "UI/UX design and wireframing",
    outcome: "Created high-fidelity mockups using Figma",
    color: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    icon: <PenTool className="text-green-600" size={20} />,
  },
  {
    id: 4,
    date: "Dec 10, 2025",
    hours: 5,
    activity: "Backend setup and database design",
    outcome: "Designed ER diagram and implemented initial models",
    color: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: <Server className="text-orange-600" size={20} />,
  },
];

const Logsheet = () => {
  const [entries, setEntries] = useState(initialEntries);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  // Handler to delete an entry
  const handleDelete = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  // Handler to add a new entry from modal
  const handleAddEntry = (newEntry) => {
    setEntries([...entries, { id: Date.now(), ...newEntry }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar className="text-blue-600" size={26} />
                Project Logsheet
              </h1>
              <p className="text-base text-gray-600 mt-1.5">
                <span className="font-medium">Total Hours: {totalHours} hours</span>
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition text-sm"
            >
              <Plus size={18} />
              Add Entry
            </button>
          </div>
        </div>

        {/* Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-2xl shadow-sm border ${entry.color} p-5 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${entry.iconBg}`}>
                    {entry.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{entry.date}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={15} />
                      {entry.hours}h
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Activity</p>
                  <p className="text-gray-800 text-base mt-1 leading-relaxed">{entry.activity}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Outcome</p>
                  <p className="text-gray-800 text-base mt-1 leading-relaxed">{entry.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-28 h-28 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="text-gray-400" size={56} />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">No log entries yet</h3>
            <p className="text-gray-500 mt-2">Click "Add Entry" to start tracking!</p>
          </div>
        )}

        {/* Modal */}
        <AddLogEntryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddEntry}
        />

      </div>
    </div>
  );
};

export default Logsheet;
