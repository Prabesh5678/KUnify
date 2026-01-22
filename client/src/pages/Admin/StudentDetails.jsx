import React, { useState } from "react";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import { useLocation } from "react-router-dom";

const StudentDetails = () => {
  const location = useLocation();
  const { student } = location.state || {};

  const [name, setName] = useState(student?.name || "");
  const [email, setEmail] = useState(student?.email || "");
  const [semester, setSemester] = useState(student?.semester || "");
  const [team, setTeam] = useState(student?.team || "");
  const [logs, setLogs] = useState(student?.logs || [
    { date: "2025-01-10", task: "Requirement Analysis" },
  ]);

  if (!student) return <p>No student data found.</p>;

  return (
   <div className="flex min-h-screen bg-gray-50">
  <AdminSidebar />
  <div className="flex-1 flex flex-col overflow-auto">
    <AdminHeader />
    <div className="p-6 md:p-8 w-full"></div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Student Details
        </h2>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Name</label>
              <input
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold">Email</label>
              <input
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold">Semester</label>
              <input
                className="w-full p-2 border rounded"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold">Team</label>
              <input
                className="w-full p-2 border rounded"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Contribution Log Sheets</h3>
          </div>

          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div key={idx} className="border p-4 rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="p-2 border rounded"
                    value={log.date}
                    onChange={(e) => {
                      const newLogs = [...logs];
                      newLogs[idx].date = e.target.value;
                      setLogs(newLogs);
                    }}
                    placeholder="Date"
                  />
                  <input
                    className="p-2 border rounded"
                    value={log.task}
                    onChange={(e) => {
                      const newLogs = [...logs];
                      newLogs[idx].task = e.target.value;
                      setLogs(newLogs);
                    }}
                    placeholder="Task"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
