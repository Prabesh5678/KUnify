import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const borderColors = [
  "border-purple-400",
  "border-pink-400",
  "border-emerald-400",
  "border-orange-400",
  "border-indigo-400",
];

const StudentHome = () => {
  const navigate = useNavigate();
  const { teams, selectedSubject } = useAppContext();

  const sortedTeams = teams?.slice().sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const latestTeam = sortedTeams?.[0];

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-10">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Welcome
        </h1>
        <p className="text-gray-600 mt-1">
          Your project workspace overview
        </p>
      </div>

      {/* CURRENT PROJECT */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-green-50 rounded-2xl shadow-md p-6 border border-green-200">




          {latestTeam ? (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {latestTeam.teamName}
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Subject Code: {latestTeam.subjectCode}
              </p>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="bg-gradient-to-r from-green-600 to-green-400
             hover:opacity-90 text-white px-6 py-2 rounded-xl
             font-medium transition"
              >
                Go to Dashboard
              </button>

            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-700">
                Team not formed
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Subject Code: {selectedSubject || "Not selected"}
              </p>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="bg-primary
             hover:opacity-90 text-white px-6 py-2 rounded-xl
             font-medium transition"
              >
                Go to Dashboard
              </button>

            </>
          )}
        </div>
      </div>

      {/* ALL PROJECTS */}
      <div className="max-w-5xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          All Projects
        </h3>

        {sortedTeams?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {sortedTeams.map((team, index) => {
              const borderColor =
                borderColors[index % borderColors.length];

              return (
                <div
                  key={team._id}
                  className={`bg-white rounded-xl p-5 shadow-sm
                              hover:shadow-md transition
                              border-l-4 ${borderColor}`}
                >
                  <h4 className="text-lg font-semibold text-gray-800">
                    {team.teamName}
                  </h4>

                  <p className="text-sm text-gray-600 mb-3">
                    Subject Code: {team.subjectCode}
                  </p>

                  <button
                    onClick={() => navigate("/student/dashboard")}
                    className="text-purple-700 font-medium text-sm hover:underline"
                  >
                    Open Dashboard →
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            No projects available yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
