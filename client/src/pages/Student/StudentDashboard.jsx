import React from "react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const goToSubjectCode = () => navigate("/subject-code");
  const goToTeam = () => navigate("/team");
  const goToLogs = () => navigate("/logs");
  const goToSupervisor = () => navigate("/request-supervisor");

  return (
    <div className="w-full min-h-screen bg-[#f4f8ff] flex flex-col items-center p-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Student Dashboard
      </h1>

      {/* Card Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl w-full">

        {/* SUBJECT CODE */}
        <div
          onClick={goToSubjectCode}
          className="bg-white shadow-md p-6 rounded-xl cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Enter Subject Code
          </h2>
          <p className="text-gray-500 text-sm">
            Add the subject code to begin your project workflow.
          </p>
        </div>

        {/* TEAM MANAGEMENT */}
        <div
          onClick={goToTeam}
          className="bg-white shadow-md p-6 rounded-xl cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Create / Join Team
          </h2>
          <p className="text-gray-500 text-sm">
            Form your team or join an existing one using a team code.
          </p>
        </div>

        {/* REQUEST SUPERVISOR */}
        <div
          onClick={goToSupervisor}
          className="bg-white shadow-md p-6 rounded-xl cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Submit your proposal
          </h2>
          <p className="text-gray-500 text-sm">
           Submit your proposal for supervisor assignment.
          </p>
        </div>

        {/* LOG SHEETS */}
        <div
          onClick={goToLogs}
          className="bg-white shadow-md p-6 rounded-xl cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Logsheets & Submissions
          </h2>
          <p className="text-gray-500 text-sm">
            Upload logsheets, view submissions, and track your progress.
          </p>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
