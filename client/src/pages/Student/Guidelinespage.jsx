import React from "react";
import { Users, FileText, Calendar } from "lucide-react";

const GuidelinesPage = () => {
  return (
    <div className="min-h-screen py-4 ">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="bg-primary text-white px-8 py-6 rounded-t-2xl shadow-lg flex items-center gap-3">
          <h1 className="text-3xl font-bold">
            Important Guidelines
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-12 -mt-1">

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Project Guidelines & Instructions
          </h2>
          <p className="text-gray-600 mb-10">
            Welcome to CS101! Please read through all the instructions carefully before proceeding with your project work.
          </p>

          {/* Two-column responsive grid for desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

            {/* Team Formation */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
                <Users className="text-green-600" size={28} />
                Team Formation
              </h3>
              <ul className="space-y-2 text-gray-700 list-disc list-inside ml-6">
                <li>Teams must consist of <strong>5 members</strong></li>
                <li>Create or join a team for project</li>
                <li>Team leader coordinates all activities</li>
              </ul>
            </div>

            {/* Supervisor Request */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
                <FileText className="text-purple-600" size={28} />
                Supervisor Request
              </h3>
              <ul className="space-y-2 text-gray-700 list-disc list-inside ml-6">
                <li>Fill up the form </li>
                <li>Include title, objectives, and keywords</li>
                <li>Requests reviewed within <strong>5 working days</strong></li>
                <li>You may request a preferred supervisor</li>
              </ul>
            </div>
          </div>

          {/* Logsheet */}
          <div className="max-w-lg mx-auto bg-gray-50 rounded-xl p-5 mb-10 border border-gray-200">

            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-gray-800">
              <Calendar className="text-orange-600" size={28} />
              Logsheet Maintenance
            </h3>
            <ul className="space-y-2 text-gray-700 list-disc list-inside ml-6">
              <li>Maintain individual logsheets weekly</li>
              <li>Include date, activities, hours, and outcomes</li>
              <li>Update at least once per week</li>
              <li>Supervisor reviews during meetings</li>
            </ul>
          </div>

          {/* Deadlines Table */}
          <h3 className="text-xl font-bold text-gray-800 mb-5">
            Important Deadlines
          </h3>
          <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Milestone</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Week</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">Team Formation</td>
                  <td className="px-6 py-4 text-center font-medium">Week 2</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100 transition">
                  <td className="px-6 py-4">Supervisor Request</td>
                  <td className="px-6 py-4 text-center font-medium">Week 3</td>
                </tr>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">First Progress Report</td>
                  <td className="px-6 py-4 text-center font-medium">Week 7</td>
                </tr>
                <tr className="bg-gray-50 hover:bg-gray-100 transition">
                  <td className="px-6 py-4">Final Submission</td>
                  <td className="px-6 py-4 text-center font-bold text-red-600">Week 14</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;