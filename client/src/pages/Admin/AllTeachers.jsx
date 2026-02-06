import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Admin/AdminSideBar";
import AdminHeader from "../../components/Admin/AdminHeader";
import { FaUserGraduate, FaPhone, FaEnvelope, FaTools, FaKey } from "react-icons/fa";
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
  const [specialization, setSpecialization] = useState(teacher?.specialization || "");
  const [password, setPassword] = useState(teacher?.password || "");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  const validateAndShowDialog = () => {
    // Validate phone number: exactly 10 digits
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    // Validate specialization word count: less than 200 words
    const wordCount = specialization.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount >= 200) {
      toast.error("Specialization must be less than 200 words.");
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleSave = async () => {
    // Validate teacher ID
    const teacherId = teacher._id || teacher.id;
    if (!teacherId || teacherId.length !== 24) {
      toast.error("Invalid teacher ID. Cannot update details.");
      setShowConfirmDialog(false);
      return;
    }

    try {
      const res = await axios.patch(`/api/admin/get-teachers/${teacherId}`, {
        name,
        phone,
        email,
        specialization,
        password,
      });
      if (res.data.success) {
        toast.success("Teacher details updated successfully!");
        setShowConfirmDialog(false);
      } else {
        toast.error("Failed to update teacher");
        setShowConfirmDialog(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating teacher.");
      setShowConfirmDialog(false);
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
              <input
                value={name}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaPhone />} label="Phone">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="ml-2 p-2 border rounded w-full"
              />
            </InfoItem>

            <InfoItem icon={<FaEnvelope />} label="Email">
              <input
                value={email}
                readOnly
                className="ml-2 p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
              />
            </InfoItem>

            <InfoItem icon={<FaTools />} label="Specialization">
              <input
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="ml-2 p-2 border rounded w-full"
              />
            </InfoItem>

            {teacher.isVisiting && (
              <InfoItem icon={<FaKey />} label="Password">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="ml-2 p-2 border rounded w-full font-mono"
                />
              </InfoItem>
            )}
          </div>

          <button
            onClick={validateAndShowDialog}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 mb-8 cursor-pointer"
          >
            Save Changes
          </button>

          {/* Assigned Projects */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Assigned Projects</h3>
            {projects.length === 0 ? (
              <p className="text-gray-600">No projects assigned</p>
            ) : (
              <ul className="list-disc ml-6">
                {projects.map((p) => (
                  <li key={p.id} className="mb-1">
                    {p.title} — <span className="text-gray-600">{p.teamName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Are you sure?</h3>
              <p className="text-gray-600 mb-6">
                Do you want to save the changes for this teacher?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

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