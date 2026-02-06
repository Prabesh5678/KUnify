import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const MyProfile = () => {
  const { user, refreshUser } = useAppContext();

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

  // 🔹 Subject code auto-update logic (UNCHANGED logic style)
  const updateSubjectCode = (dept, sem) => {
    let subject = "";

    if (dept === "CS") {
      const csMap = {
        "1st": "ENGG101",
        "2nd": "ENGG102",
        "3rd": "COMP206",
        "4th": "COMP207",
        "5th": "COMP311",
        "6th": "COMP313",
      };

      subject = csMap[sem] || "";
    } else if (dept === "CE") {
      const ceMap = {
        "1st": "ENGG101",
        "2nd": "ENGG102",
        "3rd": "COMP206",
        "4th": "COMP207",
        "5th": "COMP303",
        "6th": "COMP313",
      };
      subject = ceMap[sem] || "";
    }

    setForm((prev) => ({ ...prev, subjectCode: subject }));
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "department") {
      updateSubjectCode(value, form.semester);
    }

    if (name === "semester") {
      updateSubjectCode(form.department, value);
    }
  };

  // Save profile
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        "/api/student/profile-update",
        {
          name: form.name,
          email: form.email,
          department: form.department,
          semester: form.semester,
          subjectCode: form.subjectCode,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        setEditing(false);
        refreshUser();
      } else {
        toast.error(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile. Try again.");
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
          <img
            src="/avatar.png"
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-2 border-primary object-cover"
          />

          <div className="flex flex-col gap-4 w-full">
            {/* Name */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Name</label>
              <input
                type="text"
                value={form.name}
                disabled
                className="w-full p-3 rounded-md border cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full p-3 rounded-md border cursor-not-allowed"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Department</label>
              {editing ? (
               <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-primary bg-white"
                >
                  <option value="CS">CS</option>
                  <option value="CE">CE</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={form.department}
                  disabled
                  className="w-full p-3 rounded-md border cursor-not-allowed"
                />
              )}
            </div>

            {/* Semester */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Semester</label>
              {editing ? (
                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md border border-primary bg-white"
                >
                  {["1st", "2nd", "3rd", "4th", "5th", "6th"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.semester || "—"}
                  disabled
                  className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
                />
              )}
            </div>

            {/* Registration Number */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">
                Registration Number
              </label>
              <input
                type="text"
                value={form.rollNumber}
                disabled
                className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Subject Code */}
            <div className="flex flex-col">
              <label className="font-semibold text-primary">Subject code</label>
              <input
                type="text"
                value={form.subjectCode || "—"}
                disabled
                className="w-full p-3 rounded-md border border-gray-300 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/80 transition cursor-pointer"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-3 bg-gray-400 text-white rounded-md font-medium hover:bg-gray-500 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/80 transition disabled:opacity-50 cursor-pointer"
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
