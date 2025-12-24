import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    
    // Reset error when modal opens
    setError("");
    
    // Set default date to today
    if (isOpen && !date) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    }
  }, [teamMembers, existingLogs, isOpen, date]);

  if (!isOpen) return null;

  const updateMember = (id, field, value) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate date
    if (!date) {
      setError("Please select a date");
      return;
    }

    // Check if all members filled activity and outcome
    for (const m of members) {
      if (!m.activity.trim() || !m.outcome.trim()) {
        setError(`All members must fill their activity and outcome. Please complete for ${m.name}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Prepare the log entry data for API
      const logEntry = {
        logNumber: logNumber,
        date: date,
        teamEntries: members.map((m, idx) => ({
          memberId: m.id,
          memberName: m.name,
          activity: m.activity,
          outcome: m.outcome,
          color: memberColors[idx % memberColors.length]
        }))
      };

      // Make API call to save log
      const response = await axios.post('/api/log', logEntry);
      
      console.log("Log saved successfully:", response.data);
      
      // If the parent component provided an onAdd callback, call it
      if (onAdd) {
        onAdd({
          ...logEntry,
          logName: `LOG-${logNumber}`,
          _id: response.data._id || response.data.id,
          createdAt: response.data.createdAt || new Date().toISOString()
        });
      }
      
      // Reset form and close modal
      setMembers(members.map(m => ({ ...m, activity: "", outcome: "" })));
      setDate("");
      onClose();
      
    } catch (err) {
      console.error("Error saving log:", err);
      setError(err.response?.data?.message || err.message || "Failed to save log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setError("");
    setMembers(members.map(m => ({ ...m, activity: "", outcome: "" })));
    setDate("");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40" onClick={handleCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">

          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="text-blue-600" size={30} />
                Add Team Log Entry - LOG-{logNumber}
              </h2>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={26} className="text-gray-500" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

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
                  max={new Date().toISOString().split('T')[0]}
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
                            disabled={isSubmitting}
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
                            disabled={isSubmitting}
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
                onClick={handleCancel}
                className="px-8 py-3.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-10 py-3.5 bg-primary hover:bg-primary-80 text-white font-bold rounded-xl shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  "Save Entry"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;