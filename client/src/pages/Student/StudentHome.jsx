import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Users } from "lucide-react";

const StudentHome = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestStudentAndTeam = async () => {
    try {
      const studentRes = await axios.get(
        "/api/student/is-auth?populateTeam=true",
        { withCredentials: true }
      );
      const freshStudent = studentRes.data.student;
      setStudent(freshStudent);

      if (!freshStudent?.teamId) {
        setTeam(null);
        return;
      }
const team= freshStudent.teamId;
      setTeam(team);
    } catch (err) {
  //    console.error("Failed to fetch student/team", err);
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
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Welcome 
          </h1>

          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Your project workspace overview.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 p-6 sm:p-8">

          {team ? (
            <>
              {/* Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">

                <div className="bg-gray-50 rounded-2xl p-5 border">
                  <p className="text-sm text-gray-500">
                    Team Name
                  </p>

                  <h3 className="text-xl font-semibold mt-1">
                    {team.name}
                  </h3>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border">
                  <p className="text-sm text-gray-500">
                    Subject Code
                  </p>

                  <h3 className="text-xl font-semibold mt-1">
                    {team.subject}
                  </h3>
                </div>

              </div>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="mt-8 w-full sm:w-auto bg-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl transition"
              >
                Go to Dashboard
              </button>
            </>
          ) : (
            <>
              {/* Empty State Icon */}
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                <Users
                  size={30}
                  className="text-gray-600"
                />
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                No Team Yet
              </h2>

              <p className="text-gray-500 mt-3 max-w-lg">
                You haven't joined or created a project team yet.
                Create a new team or join an existing one from the
                dashboard to get started.
              </p>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="mt-8 w-full sm:w-auto bg-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl transition"
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