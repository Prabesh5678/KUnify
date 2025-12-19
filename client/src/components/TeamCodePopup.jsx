import React from "react";
import { X } from "lucide-react";

const TeamCodePopup = ({ isOpen, onClose, teamCode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-3">
          Team Created Successfully 
        </h2>

        <p className="text-gray-600 mb-4">
          This is your team code. Share it with your friends so they can join
          using the same code. Every member must fill the form.
        </p>

        <div className="bg-gray-100 rounded-lg py-3 px-4 text-2xl font-bold tracking-widest mb-4">
          {teamCode}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-white rounded-lg cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default TeamCodePopup;
