import React from "react";
import { useLocation } from "react-router-dom";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import { FaUserGraduate, FaEnvelope, FaUsers, FaLayerGroup } from "react-icons/fa";

const StudentDetails = () => {
  const location = useLocation();
  const { student } = location.state || {};

  if (!student) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
        No student data found.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <FaUserGraduate className="text-primary text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Student Profile
              </h2>
              <p className="text-gray-500 text-sm">
                Detailed academic & team information
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <InfoItem
                icon={<FaUserGraduate />}
                label="Full Name"
                value={student.name}
              />

              <InfoItem
                icon={<FaEnvelope />}
                label="Email"
                value={student.email}
              />

              <InfoItem
                icon={<FaLayerGroup />}
                label="Semester"
                value={student.semester}
              />

              <InfoItem
                icon={<FaUsers />}
                label="Team"
                value={student.teamId?.name || "Not Assigned"}
              />

              <InfoItem
                icon={<FaUserGraduate />}
                label="Registration Number"
                value={student.rollNumber || "N/A"}
              />
            </div>
          </div>

          {/* Contribution Logs */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-bold mb-6 text-gray-800">
              Contribution Log Sheets
            </h3>

            {student.logs && student.logs.length > 0 ? (
              <div className="space-y-4">
                {student.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                  >
                    <p className="text-sm text-gray-500">{log.date}</p>
                    <p className="font-semibold text-gray-700">
                      {log.task}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">
                No contribution logs available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Small reusable UI component */
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="text-primary text-xl mt-1">{icon}</div>
    <div>
      <p className="text-xs uppercase text-gray-400 font-semibold">
        {label}
      </p>
      <p className="text-gray-800 font-bold">{value}</p>
    </div>
  </div>
);

export default StudentDetails;
