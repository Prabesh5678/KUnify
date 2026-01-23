
import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaToggleOn, FaToggleOff, FaUserGraduate, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const StudentsManagement = () => {
  const navigate = useNavigate();
  // All 8 Semesters
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSemesters, setActiveSemesters] = useState({
    "1st": false, "2nd": false, "3rd": false, "4th": true,
    "5th": false, "6th": false, "7th": false, "8th": false,
  });
  useEffect(() => {
    // Sample data structure
    setStudents([
      { id: 1, name: "Aarav Sharma", email: "aarav@college.edu", semester: "2nd", active: true, team: "Team Alpha" },
      { id: 2, name: "Sita Koirala", email: "sita@college.edu", semester: "1st", active: true, team: "Team Beta" },
      { id: 3, name: "Rohit Joshi", email: "rohit@college.edu", semester: "4th", active: false, team: "Team Gamma" },
      { id: 4, name: "Nisha Rai", email: "nisha@college.edu", semester: "4th", active: true, team: "Team Delta" },
    ]);
  }, []);
  const toggleSemester = (sem) => {
    setActiveSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
  };
  const handleToggleStudent = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    // 1. FIXED VIEWPORT: h-screen overflow-hidden prevents the double scrollbar
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <AdminSidebar />
      {/* 2. FLEX-1 + MIN-W-0: This is the magic fix that stops the sidebar from squashing */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <AdminHeader adminName="Admin" />
        {/* 3. SCROLLABLE AREA: Only this section scrolls */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Header Section styled like your Dashboard Management cards */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaUserGraduate className="text-blue-600" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>
            </div>
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          {/* Semester Tabs (Pastel Style) */}
          <div className="flex flex-wrap gap-2 mb-10">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => toggleSemester(sem)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeSemesters[sem]
                    ? "bg-slate-800 text-white border-slate-800 shadow-md"
                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {sem} Semester
              </button>
            ))}
          </div>
          {/* Student Lists */}
          <div className="space-y-12">
            {semesters.map((sem) => {
              if (!activeSemesters[sem]) return null;
              const list = filteredStudents.filter(s => s.semester === sem);
              return (
                <div key={sem} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-700">{sem} Semester List</h3>
                  </div>
                  {/* Table Container with Pastel Header */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-blue-50/50 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Team</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {list.length > 0 ? (
                            list.map((s) => (
                              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => navigate("/admin/student-details", { state: { student: s } })}
                                    className="text-blue-600 font-bold hover:underline"
                                  >
                                    {s.name}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{s.email}</td>
                                <td className="px-6 py-4">
                                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">
                                    {s.team}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button onClick={() => handleToggleStudent(s.id)}>
                                    {s.active ? (
                                      <FaToggleOn className="text-green-500 text-3xl align-middle" />
                                    ) : (
                                      <FaToggleOff className="text-gray-300 text-3xl align-middle" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                                No students found for this semester.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default StudentsManagement;
