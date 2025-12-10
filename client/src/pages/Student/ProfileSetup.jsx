// components/SetupProfile.jsx
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
  const { isUser, setIsUser } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: isUser?.name || "",
    email: isUser?.email || "",
    department: "",
    semester: "",
    rollNumber: "",
    subjectCode: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, department, semester, rollNumber, subjectCode } = form;

    if (!name || !email || !department || !semester || !rollNumber || !subjectCode) {
      alert("Please fill all fields");
      return;
    }

    // Update global context with completed profile
    setIsUser({
      ...isUser,
      name,
      email,
      profileCompleted: true,
      profile: {
        department,
        semester,
        rollNumber,
        subjectCode,
      },
      department,
      semester,
      rollNumber,
      subjectCode,
    });

    // Save to localStorage (for persistence)
    localStorage.setItem("profileCompleted", "true");
    localStorage.setItem(
      "profileData",
      JSON.stringify({ name, email, department, semester, rollNumber, subjectCode })
    );

    // Redirect to student dashboard
    navigate("/student/dashboard");
  };

  return (
    <div className="w-full min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white border-2 border-primary rounded-2xl shadow-md p-10">
        <h2 className="text-3xl font-bold text-center text-primary mb-10">
          Complete Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* User Info Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Name */}
            <div className="flex flex-col gap-4">
              <label className="text-[#0f172a] font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white text-black p-3 rounded-md border border-gray-800"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-4">
              <label className="text-[#0f172a] font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white text-black p-3 rounded-md border border-gray-800"
              />
            </div>
          </div>

          {/* Academic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Department */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
              >
                <option value="">-- Select --</option>
                <option value="CE">CE</option>
                <option value="CS">CS</option>
                <option value="BIT">BIT</option>
              </select>
            </div>

            {/* Semester */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">Semester</label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
              >
                <option value="">-- Select --</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
                <option value="4th">4th</option>
                <option value="5th">5th</option>
                <option value="6th">6th</option>
                <option value="7th">7th</option>
                <option value="8th">8th</option>
              </select>
            </div>

            {/* Roll Number */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                required
                placeholder="Your Roll Number"
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
              />
            </div>

            {/* Subject Code */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">Subject Code</label>
              <input
                type="text"
                name="subjectCode"
                value={form.subjectCode}
                onChange={handleChange}
                required
                placeholder="e.g. COMP 201"
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:opacity-90 transition"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

