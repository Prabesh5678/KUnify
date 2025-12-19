import React from "react";
import { X, Copy, Check } from "lucide-react";

const TeamCodePopup = ({ isOpen, onClose, teamCode }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 text-center relative mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
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
          Team Created Successfully! 🎉
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          Share this code with your team members. They can join your team by
          entering this code in the "Join Team" option.
        </p>

        {/* Team Code Display */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl py-4 px-6 mb-4">
          <p className="text-sm text-gray-600 mb-2">Your Team Code</p>
          <div className="flex items-center justify-center gap-3">
            <div className="text-3xl font-bold tracking-widest text-gray-800">
              {teamCode}
            </div>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition ${
                copied
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 hover:bg-blue-200 text-blue-600"
              }`}
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {copied ? "Copied to clipboard!" : "Click to copy"}
          </p>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
          <p className="font-medium text-yellow-800 mb-2">Important Notes:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Share this code ONLY with your team members (max 4)</li>
            <li>• Each member must join using this exact code</li>
            <li>• You are the team leader (you created the team)</li>
            <li>• Code will expire if team is not formed within 7 days</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition"
          >
            Done
          </button>
          <button
            onClick={() => {
              handleCopy();
              alert("Code copied! Share it with your team.");
            }}
            className="flex-1 px-4 py-3 bg-white border border-primary text-primary hover:bg-blue-50 font-medium rounded-lg transition"
          >
            Copy & Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCodePopup;