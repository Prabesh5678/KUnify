import React, { useState, useEffect } from "react";
import { X, Calendar, Users } from "lucide-react";

const memberColors = [
  { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-400" },
  { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-400" },
  { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-400" },
  { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-400" },
  { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-400" },
];

const AddLogEntryModal = ({ isOpen, onClose, onAdd, teamMembers }) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (teamMembers?.length > 0) {
      setMembers(
        teamMembers.map((m, idx) => ({
          id: idx + 1,
          name: m.name,
          activity: "",
          outcome: "",
        }))
      );
    }
  }, [teamMembers]);

  if (!isOpen) return null;

  const updateMember = (id, field, value) => {
    setMembers(prev =>
      prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (const m of members) {
      if (!m.activity.trim() || !m.outcome.trim()) {
        alert(`Please fill activity & outcome for ${m.name}`);
        return;
      }
    }

    // 🔥 THIS MATCHES BACKEND
    const payload = {
      date,
      teamEntries: members.map(m => ({
        name: m.name,
        activity: m.activity,
        outcome: m.outcome,
      })),
    };

    onAdd(payload);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-white/80 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="border-b px-8 py-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold flex gap-3">
              <Users /> Add Team Log
            </h2>
            <button onClick={onClose}><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">

            {/* Date */}
            <div>
              <label className="font-semibold block mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xl"
                />
                <Calendar className="absolute right-4 top-4 text-gray-400" />
              </div>
            </div>

            {/* Members */}
            {members.map((member, index) => {
              const color = memberColors[index % memberColors.length];
              return (
                <div key={member.id} className={`${color.bg} ${color.border} border rounded-2xl p-6`}>
                  <p className="font-bold mb-4">{member.name}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <textarea
                      placeholder="Activity"
                      required
                      value={member.activity}
                      onChange={(e) =>
                        updateMember(member.id, "activity", e.target.value)
                      }
                      className="border rounded-xl p-3"
                    />
                    <textarea
                      placeholder="Outcome"
                      required
                      value={member.outcome}
                      onChange={(e) =>
                        updateMember(member.id, "outcome", e.target.value)
                      }
                      className="border rounded-xl p-3"
                    />
                  </div>
                </div>
              );
            })}

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-8 py-3 bg-primary text-white rounded-xl">
                Save Log
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;
