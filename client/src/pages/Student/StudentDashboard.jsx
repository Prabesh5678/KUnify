import React from "react";
import { Users, FileText, Clock, Plus, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Top Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Users className="text-green-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Team Status</p>
                <p className="text-lg font-bold text-gray-800">Not Joined</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="text-purple-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Supervisor</p>
                <p className="text-lg font-bold text-orange-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="text-blue-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours Logged</p>
                <p className="text-lg font-bold text-gray-800">6 hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="text-orange-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Log Entries</p>
                <p className="text-lg font-bold text-gray-800">2 entries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Quick Actions + Upcoming Deadlines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Quick Actions</h2>
            <div className="space-y-4">

              <button
                onClick={() => navigate("/student/team")} 
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Users className="text-green-600" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Create or Join Team</p>
                    <p className="text-sm text-gray-500">Form your project team</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate("/student/requestsupervisor")}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FileText className="text-purple-600" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Request Supervisor</p>
                    <p className="text-sm text-gray-500">Submit supervisor request</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={() => navigate("/student/logsheet")}
                className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Plus className="text-blue-600" size={26} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Add Log Entry</p>
                    <p className="text-sm text-gray-500">Update your logsheet</p>
                  </div>
                </div>
                <span className="text-gray-400">→</span>
              </button>

            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Upcoming Deadlines</h2>
            <div className="space-y-4">

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <AlertCircle className="text-orange-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Team Formation</p>
                    <p className="text-sm text-gray-600">Week 2</p>
                  </div>
                </div>
                <span className="bg-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <AlertCircle className="text-orange-600" size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Supervisor Request</p>
                    <p className="text-sm text-gray-600">Week 3</p>
                  </div>
                </div>
                <span className="bg-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                <Calendar className="text-gray-500" size={22} />
                <div>
                  <p className="font-medium text-gray-700">First Progress Report</p>
                  <p className="text-sm text-gray-500">Week 7</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100">
                <Calendar className="text-gray-500" size={22} />
                <div>
                  <p className="font-medium text-gray-700">Final Submission</p>
                  <p className="text-sm text-gray-500">Week 14</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;