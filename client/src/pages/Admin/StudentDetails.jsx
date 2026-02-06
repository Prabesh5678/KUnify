import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/Admin/AdminHeader";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import { FaUserGraduate, FaEnvelope, FaUsers, FaLayerGroup } from "react-icons/fa";

const StudentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student } = location.state || {};

  if (!student) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
        No student data found.
      </div>
    );
  }

  return (
 <div className="flex min-h-screen bg-gray-50">
  <AdminSidebar />
  <div className="flex-1 p-8">
    <AdminHeader />
    <div className="flex justify-between items-center mb-6"></div>

        <div className="p-4 md:p-2">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-2xl">
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

              {/* Clickable Team */}
              <InfoItem
                icon={<FaUsers />}
                label="Team"
                value={
                  student.teamId ? (
                    <span
                      className="text-primary underline cursor-pointer hover:text-primary/80"
                      onClick={() =>
                        navigate(`/admin/teamdetail/${student.teamId._id}`, {
                          state: { team: student.teamId },
                        })
                      }
                    >
                      {student.teamId.name}
                    </span>
                  ) : (
                    "Not Assigned"
                  )
                }
              />


              <InfoItem
                icon={<FaUserGraduate />}
                label="Registration Number"
                value={student.rollNumber || "N/A"}
              />
            </div>
          </div>

          {/* Logsheets removed */}
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
      <div className="text-gray-800 font-bold">{value}</div>
    </div>
  </div>
);

export default StudentDetails;
