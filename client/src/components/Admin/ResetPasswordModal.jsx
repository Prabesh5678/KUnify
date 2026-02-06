import React, { useState } from "react";
import { toast } from "react-hot-toast";

const ResetPasswordModal = ({ isOpen, onClose, teacher, onReset }) => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    // Show confirmation dialog
    setConfirmDialog(true);
  };

  const handleConfirmReset = async () => {
    setLoading(true);
    setConfirmDialog(false);
    try {
      await onReset(newPassword);
      toast.success("Password reset successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
      setNewPassword("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
        <h3 className="text-lg font-semibold mb-4">Reset Password for {teacher.name}</h3>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full p-3 border rounded mb-4"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border hover:bg-gray-100 cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-11/12 max-w-sm shadow-lg text-center">
              <p className="mb-4 font-medium">Are you sure you want to reset the password?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setConfirmDialog(false)}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
