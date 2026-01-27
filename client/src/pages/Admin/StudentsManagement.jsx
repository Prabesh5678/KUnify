import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaToggleOn, FaToggleOff, FaUserGraduate, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.withCredentials = true;

const StudentsManagement = () => {
  const navigate = useNavigate();

  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSemesters, setActiveSemesters] = useState({
    "1st": false,
    "2nd": false,
    "3rd": false,
    "4th": true,
    "5th": false,
    "6th": false,
    "7th": false,
    "8th": false,
  });

  // fetch by semester
  const fetchStudents = async (semester) => {
    try {
      const res = await axios.get("/api/admin/get-students", {
        params: {
          semester,
          search,
        },
      });

      console.log("API Response:", res.data);

      if (res.data.success) {
        setStudents(res.data.students || []);
      } else {
        toast.error("Failed to load students");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  };

  // initial load
  useEffect(() => {
    fetchStudents("4th");
  }, []);

  const toggleSemester = (sem) => {
    setActiveSemesters((prev) => ({
      ...prev,
      [sem]: !prev[sem],
    }));

    // fetch that semester
    fetchStudents(sem);
  };

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
     <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar />
          <div className="flex-1 p-8">
            <AdminHeader />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FaUserGraduate className="text-primary" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Students Management
              </h2>
            </div>

            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => toggleSemester(sem)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeSemesters[sem]
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {sem} Semester
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {semesters.map((sem) => {
              if (!activeSemesters[sem]) return null;

              const list = filteredStudents.filter((s) => s.semester === sem);

              return (
                <div key={sem} className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-700">
                      {sem} Semester List
                    </h3>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-primary/10 border-b border-gray-100">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Roll Number
                            </th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {list.length > 0 ? (
                            list.map((s) => (
                              <tr key={s._id || s.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() =>
                                      navigate("/admin/admin_std-details", { state: { student: s } })
                                    }
                                    className="text-primary font-bold hover:underline"
                                  >
                                    {s.name}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                  {s.email}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                  {s.rollNumber || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {s.activeStatus ? (
                                    <FaToggleOn className="text-green-500 text-3xl align-middle" />
                                  ) : (
                                    <FaToggleOff className="text-gray-300 text-3xl align-middle" />
                                  )}
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
