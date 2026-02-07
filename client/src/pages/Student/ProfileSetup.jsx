import axios from "axios";
import { useAppContext } from "../../context/AppContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const subjectMap = {
  CE: {
    "1st": "ENGG101",
    "2nd": "ENGG102",
    "3rd": "COMP206",
    "4th": "COMP207",
    "5th": "COMP303",
    "6th": "COMP308",
  },
  CS: {
    "1st": "ENGG101",
    "2nd": "ENGG102",
    "3rd": "COMP206",
    "4th": "COMP207",
    "5th": "COMP311",
    "6th": "COMP313",
  },
};

const ProfileSetup = () => {
  const { fetchUser, setProfileSetupDone, user } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    department: "",
    semester: "",
    rollNumber: "",
    subjectCode: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "student") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "department") {
      setForm((prev) => ({
        ...prev,
        department: value,
        subjectCode: subjectMap[value]?.[prev.semester] || "",
      }));
    } else if (name === "semester") {
      setForm((prev) => ({
        ...prev,
        semester: value,
        subjectCode: subjectMap[prev.department]?.[value] || "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regPattern = /^\d{6}-\d{2}$/;

    if (!form.department || !form.semester || !form.rollNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    // ✅ Registration number strict validation
    if (!regPattern.test(form.rollNumber)) {
      toast.error("Registration number must be in format: 123456-78");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.put(
        "/api/student/setup-profile",
        form,
        { withCredentials: true }
      );

      if (res.data?.success) {
        await fetchUser();
        setProfileSetupDone(true);
        navigate("/student/home");
        toast.success("Profile completed successfully!");
      } else {
        toast.error(res.data.message || "Profile setup failed");
      }
    } catch {
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
        <p className="text-red-600 text-sm mb-4">
          Please enter your correct information. Once filled, it cannot be changed again.
        </p>


        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a] cursor-pointer"
                disabled={isLoading}
              >
                <option value="">-- Select --</option>
                <option value="CE">CE</option>
                <option value="CS">CS</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a] cursor-pointer"
                disabled={isLoading}
              >
                <option value="">-- Select --</option>
                {["1st", "2nd", "3rd", "4th", "5th", "6th"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Registration Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                placeholder="e.g. 035425-23"
                title="Registration number must be in the format and is not changable"
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");

                  // Auto insert '-' after 6 digits
                  if (value.length > 6) {
                    value = value.slice(0, 6) + "-" + value.slice(6, 8);
                  }

                  // Max length: 6 digits + '-' + 2 digits
                  if (value.length <= 9) {
                    handleChange({
                      target: {
                        name: "rollNumber",
                        value,
                      },
                    });
                  }
                }}
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a]"
                disabled={isLoading}
              />


            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#0f172a] font-medium">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                value={form.subjectCode}
                disabled
                className="w-full p-3 bg-white text-black rounded-md border border-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !/^\d{6}-\d{2}$/.test(form.rollNumber) ||

              !form.department ||
              !form.semester ||
              !form.subjectCode ||
              isLoading
            }
            className="w-full py-3 bg-primary text-white font-semibold rounded-md hover:opacity-90 transition cursor-pointer"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
