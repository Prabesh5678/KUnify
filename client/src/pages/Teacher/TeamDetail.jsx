import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function TeamDetails() {
  const { id } = useParams();

  const [team, setTeam] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const teamData = {
      id,
      teamName: "Team Alpha",
      projectTitle: "Smart Attendance System",
      abstract:
        "This project builds a smart attendance system using face recognition...",
      keywords: ["AI", "Face Recognition", "Attendance", "Python"],
      proposalFile: "proposal.pdf",
      members: ["Student A", "Student B", "Student C", "Student D"],
    };

    setTeam(teamData);

    setLogs([
      { id: 1, date: "2026-01-10", message: "Project idea approved." },
      { id: 2, date: "2026-01-12", message: "Proposal submitted." },
      { id: 3, date: "2026-01-14", message: "Initial design completed." },
      { id: 4, date: "2026-01-16", message: "Prototype demo finished." },
    ]);
  }, [id]);

  if (!team) return <div>Loading...</div>;

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex-1 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-pink-600">
                {team.teamName}
              </h1>
              <span className="text-sm text-primary-600/80">
                Team ID: {team.id}
              </span>
            </div>

            {/* CONTENT */}
            <div className="mt-6 h-full flex flex-col overflow-hidden">
              {/* Scrollable area */}
              <div className="overflow-auto pr-2">

                {/* 2-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Project Details */}
                  <div className="rounded-xl border border-purple-200 p-5 shadow-sm">
                    <h2 className="font-bold text-lg text-blue-700">
                      Project Details
                    </h2>

                    <div className="mt-4">
                      <h3 className="font-semibold text-primary-600">Project Title</h3>
                      <p className="text-gray-700">{team.projectTitle}</p>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-primary-600">Abstract</h3>
                      <p className="text-gray-700">{team.abstract}</p>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-primary-600">Keywords</h3>
                      <p className="text-gray-700">{team.keywords.join(", ")}</p>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-primary-600">Proposal File</h3>
                      <a
                        href={`/${team.proposalFile}`}
                        download
                        className="text-blue-600 hover:underline"
                      >
                        Download Proposal
                      </a>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="rounded-xl border border-blue-200 p-5 shadow-sm">
                    <h2 className="font-bold text-lg text-blue-700">
                      Team Members
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {team.members.map((member, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-3"
                        >
                          <p className="font-semibold text-gray-700">{member}</p>
                          <p className="text-xs text-gray-400">
                            Member #{idx + 1}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logs below */}
                <div className="mt-6 rounded-xl border border-green-200 p-5 shadow-sm">
                  <h2 className="font-bold text-lg text-blue-700">
                    Logs
                  </h2>

                  <div className="mt-4 max-h-64 overflow-y-auto space-y-3 pr-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="border border-gray-200 rounded-lg p-3 bg-white"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">{log.date}</p>
                          <span className="text-xs text-gray-400">
                            Log #{log.id}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
