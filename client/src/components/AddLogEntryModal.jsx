import React, { useState, useEffect } from "react";
import { X, Calendar, Users } from "lucide-react";

const memberColors = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-400" },
  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-400" },
  { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-400" },
  { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-400" },
  { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-400" },
];

const AddLogEntryModal = ({ isOpen, onClose, onAdd, teamMembers, existingLogs }) => {
  const [date, setDate] = useState("");
  const [members, setMembers] = useState([]);
  const [logNumber, setLogNumber] = useState(1);

  useEffect(() => {
    // Initialize members from backend or sample data
    const data = teamMembers && teamMembers.length > 0 ? teamMembers : [
      { name: "Alice" },
      { name: "Bob" },
      { name: "Charlie" }
    ];

    const initializedMembers = data.map((member, idx) => ({
      id: idx + 1,
      name: member.name,
      activity: "",
      outcome: "",
    }));

    setMembers(initializedMembers);

    // Auto-increment log number based on existing logs
    setLogNumber(existingLogs ? existingLogs.length + 1 : 1);
  }, [teamMembers, existingLogs]);

  if (!isOpen) return null;

  const updateMember = (id, field, value) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if all members filled activity and outcome
    for (const m of members) {
      if (!m.activity.trim() || !m.outcome.trim()) {
        alert(`All members must fill their activity and outcome. Please complete for ${m.name}`);
        return;
      }
    }

    const filledMembers = members.map((m, idx) => ({
      ...m,
      color: memberColors[idx % memberColors.length],
    }));

    const logEntry = {
      logName: `LOG-${logNumber}`,
      date,
      teamEntries: filledMembers,
    };

    console.log("Submitted log entry:", logEntry);

    // TODO: Replace console.log with backend API call
    if (onAdd) onAdd(logEntry);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="text-blue-600" size={30} />
                Add Team Log Entry - LOG-{logNumber}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={26} className="text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* Date */}
            <div className="sticky top-0 bg-white z-10 -mx-8 px-8 py-6 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Calendar className="absolute right-4 top-4 text-gray-400" size={20} />
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">
                Team Member Contributions
              </h3>

              <div className="space-y-7">
                {members.map((member, index) => {
                  const color = memberColors[index % memberColors.length];
                  return (
                    <div
                      key={member.id}
                      className={`${color.bg} ${color.border} border rounded-2xl p-6 shadow-sm`}
                    >
                      {/* Name */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-11 h-11 ${color.badge} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0`}>
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={member.name}
                          readOnly
                          className="w-64 px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl font-medium text-gray-800 cursor-not-allowed"
                        />
                      </div>

                      {/* Activity & Outcome */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                            Activity <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={4}
                            placeholder="What did you work on?"
                            value={member.activity}
                            onChange={(e) => updateMember(member.id, "activity", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                            Outcome <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={4}
                            placeholder="What did you achieve?"
                            value={member.outcome}
                            onChange={(e) => updateMember(member.id, "outcome", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 bg-primary hover:bg-primary-80 text-white font-bold rounded-xl shadow-lg transition hover:scale-105"
              >
                Save Entry
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;

