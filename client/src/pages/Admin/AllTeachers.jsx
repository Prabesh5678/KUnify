import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaUserGraduate, FaPhone, FaEnvelope, FaTools, FaKey } from "react-icons/fa";

const AllTeachers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const teacher = location.state?.teacher;

  if (!teacher || !(teacher._id || teacher.id)) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <AdminHeader />
          <p className="text-red-600 font-semibold">
            Teacher data not found or invalid. Please navigate from Teachers Management page.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-primary text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <AdminHeader />
        <div className="p-4 md:p-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <FaUserGraduate className="text-primary text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Teacher Profile</h2>
            
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoItem icon={<FaUserGraduate />} label="Full Name">
              <input
                value={teacher.name || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaPhone />} label="Phone">
              <input
                value={teacher.phone || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaEnvelope />} label="Email">
              <input
                value={teacher.email || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaTools />} label="Specialization">
              <input
                value={teacher.specialization || ""}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            {teacher.isVisiting && (
              <InfoItem icon={<FaKey />} label="Password">
                <input
                  value={teacher.password || ""}
                  readOnly
                  className="ml-2 p-2 border rounded w-full font-mono bg-gray-100 cursor-not-allowed"
                />
              </InfoItem>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Small reusable card component */
const InfoItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
    <div className="text-primary text-xl mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs uppercase text-gray-400 font-semibold">{label}</p>
      <div>{children}</div>
    </div>
  </div>
);

export default AllTeachers;
