import React, { useState } from "react";
import { X, Calendar, Users } from "lucide-react";

const memberColors = [
    { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-400" },
    { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-400" },
    { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-400" },
    { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-400" },
    { bg: "bg-pink-50", border: "border-pink-200", badge: "bg-pink-400" },
];

const AddLogEntryModal = ({ isOpen, onClose, onAdd }) => {
    const [date, setDate] = useState("");
    const [totalHours, setTotalHours] = useState("");

    const [members, setMembers] = useState([
        { id: 1, name: "", activity: "", outcome: "" },
        { id: 2, name: "", activity: "", outcome: "" },
        { id: 3, name: "", activity: "", outcome: "" },
        { id: 4, name: "", activity: "", outcome: "" },
        { id: 5, name: "", activity: "", outcome: "" },
    ]);

    if (!isOpen) return null;

    const updateMember = (id, field, value) => {
        setMembers(prev =>
            prev.map(m => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const filledMembers = members
            .filter(m => m.name.trim() !== "")
            .map((m, idx) => ({
                ...m,
                color: memberColors[idx % memberColors.length],
            }));

        const logEntry = {
            date,
            hours: Number(totalHours),
            teamEntries: filledMembers,
        };

        if (onAdd) onAdd(logEntry);
        onClose();
    };

    return (
        <>
            {/* Soft blurred backdrop */}
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">

                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <Users className="text-blue-600" size={30} />
                                Add Team Log Entry
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={26} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Date & Hours */}
                        {/* Date & Hours – Sticky when scrolling */}
                        <div className="sticky top-0 bg-white z-10 -mx-8 px-8 py-6 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
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
                                        />
                                        <Calendar className="absolute right-4 top-4 text-gray-400" size={20} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total Team Hours <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="e.g. 15"
                                        value={totalHours}
                                        onChange={(e) => setTotalHours(e.target.value)}
                                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Team Members - Short Name Field */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-6">
                                Team Member Contributions
                            </h3>

                            <div className="space-y-7">
                                {members.map((member, index) => {
                                    const color = memberColors[index];

                                    return (
                                        <div
                                            key={member.id}
                                            className={`${color.bg} ${color.border} border rounded-2xl p-6 shadow-sm`}
                                        >
                                            {/* Name Row - Badge + Short Input */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w-11 h-11 ${color.badge} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0`}>
                                                    {index + 1}
                                                </div>

                                                {/* Shorter name input - only takes needed space */}
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Your name"
                                                    value={member.name}
                                                    onChange={(e) => updateMember(member.id, "name", e.target.value)}
                                                    className="w-64 px-5 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-800"
                                                />
                                            </div>

                                            {/* Activity & Outcome */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                                                        Activity
                                                    </label>
                                                    <textarea
                                                        required
                                                        rows={4}
                                                        placeholder="What did you work on?"
                                                        value={member.activity}
                                                        onChange={(e) => updateMember(member.id, "activity", e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 block">
                                                        Outcome
                                                    </label>
                                                    <textarea
                                                        required
                                                        rows={4}
                                                        placeholder="What did you achieve?"
                                                        value={member.outcome}
                                                        onChange={(e) => updateMember(member.id, "outcome", e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
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
                                onClick={onClose}
                                className="px-8 py-3.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition hover:scale-105"
                            >
                                Save Entry
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddLogEntryModal;