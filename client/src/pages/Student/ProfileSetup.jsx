import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProfileSetup = () => {
  const { fetchUser, setProfileSetupDone } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    department: "",
    semester: "",
    rollNumber: "",
    subjectCode: "", // This field exists but not shown in form
  });

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!form.department || !form.semester || !form.rollNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.put(
        "/api/student/setup-profile", 
        form, 
        { withCredentials: true }
      );
      
      console.log("Profile updated:", res.data);

      if (res.data?.success) {
        // Refresh user in context
        if (fetchUser) await fetchUser();
        
        // Mark profile as done
        if (setProfileSetupDone) setProfileSetupDone(true);
        
        // Redirect to dashboard
        navigate("/student/home");
        toast.success("Profile completed successfully!");
      } else {
        toast.error(res.data.message || "Profile setup failed");
      }
    } catch (err) {
      console.error("Failed to complete profile:", err);
      toast.error("Profile setup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white border-2 border-primary rounded-2xl shadow-md p-10">
        <h2 className="text-3xl font-bold text-center text-primary mb-10">
          Complete Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
                disabled={isLoading}
              >
                <option value="">-- Select --</option>
                <option value="CE">CE</option>
                <option value="CS">CS</option>
                <option value="BIT">BIT</option>
              </select>
            </div>

            {/* Semester */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
                disabled={isLoading}
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
              <label className="text-[#0f172a] font-medium">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                required
                placeholder="Registration Number"
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
                disabled={isLoading}
              />
            </div>

            {/* Subject Code */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subjectCode"
                value={form.subjectCode}
                onChange={handleChange}
                placeholder="e.g. COMP201"
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !form.rollNumber || 
              !form.department || 
              !form.semester ||
              !form.subjectCode ||
              isLoading
            }
            className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;