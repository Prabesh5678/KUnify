import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaUserGraduate, FaPhone, FaEnvelope, FaTools, FaUserTie, FaKey } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

const AllTeachers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const teacher = location.state?.teacher;
  const projects = location.state?.projects || [];

  const [name, setName] = useState(teacher?.name || "");
  const [phone, setPhone] = useState(teacher?.phone || "");
  const [email, setEmail] = useState(teacher?.email || "");
  const [expertise, setExpertise] = useState(teacher?.expertise || "");
  const [designation, setDesignation] = useState(teacher?.designation || "");
  const [password, setPassword] = useState(teacher?.password || "");

  if (!teacher) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <AdminHeader />
          <p className="text-red-600 font-semibold">
            Teacher data not found. Please navigate from Teachers Management page.
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

  const handleSave = async () => {
    try {
      const res = await axios.patch(`/api/admin/get-teachers/${teacher._id || teacher.id}`, {
        name, phone, email, expertise, designation, password
      });
      if (res.data.success) {
        toast.success("Teacher details updated successfully!");
      } else {
        toast.error("Failed to update teacher");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating teacher");
    }
  };

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
              <p className="text-gray-500 text-sm">All teacher details & assigned projects</p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <InfoItem icon={<FaUserGraduate />} label="Full Name">
              <input value={name} onChange={e => setName(e.target.value)} className="ml-2 p-2 border rounded w-full" />
            </InfoItem>

            <InfoItem icon={<FaPhone />} label="Phone">
              <input value={phone} onChange={e => setPhone(e.target.value)} className="ml-2 p-2 border rounded w-full" />
            </InfoItem>

            <InfoItem icon={<FaEnvelope />} label="Email">
              <input value={email} onChange={e => setEmail(e.target.value)} className="ml-2 p-2 border rounded w-full" />
            </InfoItem>

            <InfoItem icon={<FaTools />} label="Expertise">
              <input value={expertise} onChange={e => setExpertise(e.target.value)} className="ml-2 p-2 border rounded w-full" />
            </InfoItem>

            <InfoItem icon={<FaUserTie />} label="Designation">
              <select value={designation} onChange={e => setDesignation(e.target.value)} className="ml-2 p-2 border rounded w-full cursor-pointer">
                <option>Lecturer</option>
                <option>Visiting Faculty</option>
                <option>Assistant Professor</option>
                <option>Professor</option>
              </select>
            </InfoItem>

            {teacher.isVisiting && (
              <InfoItem icon={<FaKey />} label="Password">
                <input value={password} onChange={e => setPassword(e.target.value)} className="ml-2 p-2 border rounded w-full font-mono" />
              </InfoItem>
            )}
          </div>

          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 mb-8 cursor-pointer">
            Save Changes
          </button>

          {/* Assigned Projects */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Assigned Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-600">No projects assigned</p>
            ) : (
              <ul className="list-disc ml-6">
                {projects.map(p => (
                  <li key={p.id} className="mb-1">{p.title} — <span className="text-gray-600">{p.teamName}</span></li>
                ))}
              </ul>
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
