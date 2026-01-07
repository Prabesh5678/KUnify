import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentHome = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestStudentAndTeam = async () => {
    try {
      const studentRes = await axios.get(
        "/api/student/is-auth",
        { withCredentials: true }
      );

      const freshStudent = studentRes.data.student;
      setStudent(freshStudent);

      if (!freshStudent?.teamId) {
        setTeam(null);
        return;
      }

      const teamRes = await axios.get(
        `/api/team/${freshStudent.teamId}`,
        { withCredentials: true }
      );

      if (teamRes.data.success) {
        setTeam(teamRes.data.team);
      }
    } catch (err) {
      console.error("Failed to fetch student/team", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestStudentAndTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome
          </h1>
          <p className="text-gray-500 mt-1">
            Your project workspace overview
          </p>
        </div>

        {/* Muted Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">

          {team ? (
            <>
              <h2 className="text-2xl font-medium text-gray-900">
                {team.name}
              </h2>

              <p className="text-gray-600 mt-2">
                Subject Code
                <span className="ml-2 text-gray-800 font-medium">
                  {team.subject}
                </span>
              </p>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="mt-8 bg-gray-900 hover:bg-gray-800 cursor-pointer
                text-white px-6 py-2.5 rounded-lg font-medium
                transition-colors"
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium text-gray-800">
                Team not formed
              </h2>

              <p className="text-gray-600 mt-2">
                You are not part of any project yet.
              </p>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="mt-8 bg-gray-900 hover:bg-gray-800
                text-white px-6 py-2.5 rounded-lg font-medium
                transition-colors"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
