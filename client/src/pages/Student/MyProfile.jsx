import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";

import avatar from "../../assets/avatar.png";

import axios from "axios";


const MyProfile = () => {
  const { user, refreshUser } = useAppContext();

  // Local form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    semester: "",
    rollNumber: "",
    subjectCode: "",
  });

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        department: user.department || "",
        semester: user.semester || "",
        rollNumber: user.rollNumber || "",
        subjectCode: user.subjectCode || "",
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put("/api/student/setup-profile", {
        name: form.name,
        email: form.email,
        department: form.department,
        semester: form.semester,
        subjectCode: form.subjectCode,
      }, { withCredentials: true });

      if (res.data.success) {
        alert("Profile updated successfully!");
        setEditing(false);
        refreshUser(); // fetch updated user from backend
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center items-start py-16 px-4">
      <div className="max-w-3xl w-full bg-white border-2 border-primary rounded-2xl shadow-md p-10">
        <h2 className="text-3xl font-bold text-center text-primary mb-10">
          My Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
         <img src="/avatar.png" alt="User Avatar" 

         
            className="w-32 h-32 rounded-full border-2 border-primary object-cover"
          />

          {/* User Info Form */}
          <div className="flex flex-col gap-4 w-full">
            {/* Name */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full p-3 rounded-md border ${
                  editing ? "border-primary bg-white" : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full p-3 rounded-md border ${
                  editing ? "border-primary bg-white" : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full p-3 rounded-md border ${
                  editing ? "border-primary bg-white" : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>

            {/* Semester */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Semester</label>
              <input
                type="text"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full p-3 rounded-md border ${
                  editing ? "border-primary bg-white" : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>

            {/* Registration Number (Read-only) */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Registration Number</label>
              <input
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                placeholder="Registration Number"
                disabled
                className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Subject Code */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Subject Code</label>
              <input
                type="text"
                name="subjectCode"
                value={form.subjectCode}
                onChange={handleChange}
                disabled={!editing}
                className={`w-full p-3 rounded-md border ${
                  editing ? "border-primary bg-white" : "border-gray-300 bg-gray-100"
                }`}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/80 transition"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-gray-400 text-white rounded-md font-medium hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/80 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
