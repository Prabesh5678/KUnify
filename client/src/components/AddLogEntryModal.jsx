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

  // Weeks already added (excluding current edit)
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

    // Prevent duplicate week for new logs
    if (!editLog && usedWeeks.includes(Number(week))) {
      setError(`Week ${week} has already been updated`);
      return;
    }

    setIsSubmitting(true); // disable buttons

    try {
      let res;
      if (editLog) {
        res = await axios.put(`/api/log/update/${editLog._id}`, {
          date,
          week,
          activity,
          outcome,
        });
      } else {
        res = await axios.post("/api/log/create", {
          date,
          week,
          activity,
          outcome,
        });
      }

      if (res.data.success) {
        toast.success(editLog ? "Log updated successfully" : "Log added successfully");

        // Refresh parent logs
        if (onSuccess) await onSuccess();

        onClose(); // close modal
      } else {
        toast.error(res.data.message || "Unable to save log");
      }
    } catch (err) {
      // console.error(err);
      toast.error(err.response?.data?.message || "Failed to save log");
    } finally {
      setIsSubmitting(false); // enable buttons
    }
  };

 return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[95vh] overflow-y-auto">

          {/* Header */}
          <div className="flex justify-between items-center px-4 sm:px-5 py-4 border-b sticky top-0 bg-white z-10">
            <h2 className="text-base sm:text-lg font-bold">
              {editLog ? "Edit Log Entry" : "Add Log Entry"}
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="font-semibold block mb-1 text-sm sm:text-base">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
                className="w-full px-4 py-2.5 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Week Dropdown */}
            <div>
              <label className="font-semibold block mb-1 text-sm sm:text-base">Week</label>
              <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              <label className="font-semibold block mb-1 text-sm sm:text-base">
                Task Accomplished{" "}
                <span className="font-normal text-gray-400">(max {activityLimit} chars)</span>
              </label>
              <textarea
                rows={3}
                value={activity}
                maxLength={activityLimit}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border border-blue-300 bg-blue-50 rounded-xl text-sm sm:text-base resize-none break-words focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="text-xs text-gray-400 text-right mt-0.5">
                {activity.length}/{activityLimit}
              </div>
            </div>

            {/* Outcome */}
            <div>
              <label className="font-semibold block mb-1 text-sm sm:text-base">
                Task to be Accomplished{" "}
                <span className="font-normal text-gray-400">(max {outcomeLimit} chars)</span>
              </label>
              <textarea
                rows={4}
                value={outcome}
                maxLength={outcomeLimit}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border border-green-300 bg-green-50 rounded-xl text-sm sm:text-base resize-none break-words focus:outline-none focus:ring-2 focus:ring-green-200"
              />
              <div className="text-xs text-gray-400 text-right mt-0.5">
                {outcome.length}/{outcomeLimit}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 cursor-pointer rounded-xl text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white hover:opacity-90 rounded-xl transition cursor-pointer disabled:opacity-50 text-sm sm:text-base"
              >
                {isSubmitting
                  ? editLog ? "Updating..." : "Saving..."
                  : editLog ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;
