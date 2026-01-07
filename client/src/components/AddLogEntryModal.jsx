import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

const AddLogEntryModal = ({ isOpen, onClose, onSuccess, editLog, myLogs }) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [week, setWeek] = useState("");
  const [activity, setActivity] = useState("");
  const [outcome, setOutcome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Character limits
  const activityLimit = 500; 
  const outcomeLimit = 1000;

  // Calculate weeks that are already added (excluding current edit if editing)
  const usedWeeks = myLogs
    .filter((log) => !editLog || log._id !== editLog._id)
    .map((log) => Number(log.week));

  useEffect(() => {
    if (editLog) {
      setDate(editLog.date.split("T")[0]);
      setWeek(editLog.week);
      setActivity(editLog.activity);
      setOutcome(editLog.outcome);
    } else {
      setDate(today);
      setWeek("");
      setActivity("");
      setOutcome("");
    }
  }, [editLog, today]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!week || !activity.trim() || !outcome.trim()) {
      setError("All fields are required");
      return;
    }

    // Prevent duplicate week
    if (!editLog && usedWeeks.includes(Number(week))) {
      setError(`Week ${week} has already been updated`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editLog) {
        await axios.put(`/api/log/update/${editLog._id}`, {
          date,
          week,
          activity,
          outcome,
        });
        toast.success("Log updated successfully");
      } else {
        await axios.post("/api/log/create", {
          date,
          week,
          activity,
          outcome,
        });
        toast.success("Log added successfully");
      }
      onSuccess();
      onClose();
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
            <h2 className="text-lg font-bold">
              {editLog ? "Edit Log Entry" : "Add Log Entry"}
            </h2>
            <button onClick={onClose} className="cursor-pointer">
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

            {/* Week Dropdown */}
            <div>
              <label className="font-semibold block mb-1">Week</label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl bg-white"
              >
                <option value="">Select Week</option>
                {[...Array(16)].map((_, idx) => {
                  const wk = idx + 1;
                  return (
                    <option key={wk} value={wk} disabled={usedWeeks.includes(wk)}>
                      {usedWeeks.includes(wk)
                        ? `Week ${wk} (Already Updated)`
                        : `Week ${wk}`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Activity */}
            <div>
              <label className="font-semibold block mb-1">
                Activity (max {activityLimit} chars)
              </label>
              <textarea
                rows={3}
                value={activity}
                maxLength={activityLimit}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2.5 border border-blue-300 bg-blue-50 rounded-xl break-words"
              />
              <div className="text-sm text-gray-500 text-right">
                {activity.length}/{activityLimit}
              </div>
            </div>

            {/* Outcome */}
            <div>
              <label className="font-semibold block mb-1">
                Outcome (max {outcomeLimit} chars)
              </label>
              <textarea
                rows={4}
                value={outcome}
                maxLength={outcomeLimit}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-4 py-2.5 border border-green-300 bg-green-50 rounded-xl break-words"
              />
              <div className="text-sm text-gray-500 text-right">
                {outcome.length}/{outcomeLimit}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-100 cursor-pointer rounded-xl"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white cursor-pointer rounded-xl"
                disabled={isSubmitting}
              >
                {editLog ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;
