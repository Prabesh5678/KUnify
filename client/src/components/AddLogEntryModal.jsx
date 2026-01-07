import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

const AddLogEntryModal = ({ isOpen, onClose, onSuccess }) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [week, setWeek] = useState("");
  const [activity, setActivity] = useState("");
  const [outcome, setOutcome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!week.trim() || !activity.trim() || !outcome.trim()) {
      setError("All fields are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await axios.post("/api/log/create", {
        date,
        week,
        activity,
        outcome,
      });

      if (data.success) {
        toast.success("Log added successfully");
        onClose();
        onSuccess();
        setWeek("");
        setActivity("");
        setOutcome("");
        setDate(today);
      }
      else {
  toast.error(data.message || "Failed to add log");
}
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save log");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="text-lg font-bold">Add Log Entry</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="font-semibold block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>

            {/* Week */}
            <div>
              <label className="font-semibold block mb-1">Week</label>
              <input
                type="text"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="e.g. Week 1"
                className="w-full px-4 py-2.5 border rounded-xl"
              />
            </div>

            {/* Activity */}
            <div>
              <label className="font-semibold block mb-1">Activity</label>
              <textarea
                rows={3}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2.5 border border-blue-300 bg-blue-50 rounded-xl"
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="font-semibold block mb-1">Outcome</label>
              <textarea
                rows={3}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-4 py-2.5 border border-green-300 bg-green-50 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white rounded-xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;
