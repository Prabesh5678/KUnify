import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";


const TeamCodePopup = ({ isOpen, onClose, teamCode }) => {
  const [copied, setCopied] = useState(false);

  // Don't return null - let the component render but be hidden
  if (!isOpen) {
    return (
      <div className="hidden">
        {/* Hidden div to keep component mounted */}
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 10000);
  };

  const handleClose = () => {
    console.log("Closing popup, will refresh page");
    if (onClose) onClose(); // Call parent's onClose
    setTimeout(() => {
      window.location.reload(); // Refresh after popup closes
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 text-center relative mx-4 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition z-10"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Team Created Successfully! 
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Share this code with your team members. They can join your team by
          entering this code in the "Join Team" option.
        </p>

        {/* Team Code Display - BIGGER and BOLDER */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-xl py-6 px-8 mb-6">
          <p className="text-sm text-gray-600 mb-3">Your Team Code</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-4xl font-bold tracking-widest text-gray-800 font-mono">
              {teamCode}
            </div>
            <button
              onClick={handleCopy}
              className={`p-3 rounded-xl transition ${
                copied
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-600"
              }`}
            >
              {copied ? <Check size={24} /> : <Copy size={24} />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {copied ? "✅ Copied to clipboard!" : "Click the copy icon to copy"}
          </p>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6 text-left">
          <p className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <span>⚠️</span> Important Notes:
          </p>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Share this code <span className="font-bold">ONLY</span> with your team members (max 4 total)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Each member must join using this exact code: <span className="font-bold bg-yellow-100 px-2 py-1 rounded">{teamCode}</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>You are the <span className="font-bold">team leader</span> (you created the team)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Code will expire if team is not formed within 7 days</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition text-lg"
          >
            ✅ Done
          </button>
          <button
            onClick={() => {
              handleCopy();
              toast.success("Code copied! Share it with your team.");
            }}
            className="flex-1 px-6 py-4 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition text-lg"
          >
            📋 Copy & Share
          </button>
        </div>

        {/* Add some CSS animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default TeamCodePopup;