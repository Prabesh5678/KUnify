import React, { useState } from "react";
import axios from "axios";
import { X, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";

const AddLogEntryModal = ({ isOpen, onClose, onSuccess }) => {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [activity, setActivity] = useState("");
  const [outcome, setOutcome] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!activity.trim() || !outcome.trim()) {
      setError("Activity and Outcome are required");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post("/logs/my", {
        date,
        activity,
        outcome,
      });

      toast.success("Log added successfully");
      onClose();
      onSuccess();

      setActivity("");
      setOutcome("");
      setDate(today);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save log");
    } finally {
      setIsSubmitting(false);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h2 className="text-lg font-bold">Add Log Entry</h2>
            <button onClick={onClose}>
              <X />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Date */}
            <div>
              <label className="font-semibold block mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={today}
                  className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Calendar className="absolute right-4 top-3 text-gray-400" />
              </div>
            </div>

            {/* Activity */}
            <div>
              <label className="font-semibold block mb-1">
                Activity
              </label>
              <textarea
                rows={3}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-4 py-2.5 border border-blue-300 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="What did you work on?"
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="font-semibold block mb-1">
                Outcome
              </label>
              <textarea
                rows={3}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-4 py-2.5 border border-green-300 bg-green-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="What did you achieve?"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-gray-100 rounded-xl"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary text-white rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};

export default AddLogEntryModal;
