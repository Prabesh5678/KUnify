import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const TeacherProfileSetup = () => {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
  });

  const [loading, setLoading] = useState(false);

  // Wait for user context and set initial name

  useEffect(() => {
    if (user === undefined) return; // wait for context

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (user.role !== "teacher") {
      navigate("/", { replace: true });
      return;
    }

    if (user.isProfileCompleted) {
      navigate("/teacher/dashboard", { replace: true });
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: user.name || "",
    }));
  }, [user, navigate]);


  // show loading if user context not ready
  if (user === undefined || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile setup...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;

    if (name === "specialization") {
      const words = value.trim().split(/\s+/);
      if (words.length > 150) return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { phone, specialization } = form;
    const phoneRegex = /^\d{10}$/;

    if ( !phone || !specialization) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.put(
        "/api/teacher/setup-profile",
        { phone, specialization },
        { withCredentials: true }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to complete profile");
      }

      const updatedUser = {
        ...data.user,
        role: "teacher",                  
        picture: data.user.avatar || "",  
        _id: data.user._id || data.user.id
      };

      setUser(updatedUser);

      toast.success("Profile completed successfully!");
      navigate("/teacher/dashboard", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.phone.trim() !== "" && form.specialization.trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center text-primary">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-primary-700">
              Full Name
            </label>
            <input
  type="text"
  name="name"
  value={form.name}
  readOnly
  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black cursor-not-allowed bg-gray-100"
/>
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-primary-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your 10-digit phone number"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="block mb-1 font-medium text-primary-700">
              Specialization / Expertise
            </label>
            <textarea
              name="specialization"
              placeholder="List your expertise (max 150 words)"
              value={form.specialization}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.specialization.trim().split(/\s+/).filter(Boolean).length}/150 words
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-2 rounded-md font-medium transition ${
              !isFormValid || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfileSetup;
