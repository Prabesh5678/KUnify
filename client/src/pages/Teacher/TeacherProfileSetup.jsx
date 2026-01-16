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

  /*  Only teachers allowed */
  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/", { replace: true });
      return;
    }

    // Prefill name
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Limit specialization field to 150 words
    if (name === "specialization") {
      const words = value.split(/\s+/); // split by whitespace
      if (words.length > 150) return; // do not allow more than 150 words
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { phone, specialization } = form;

    // Strict phone validation
    const phoneRegex = /^\d{10}$/; // exactly 10 digits

    if (!phone || !specialization) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error("Phone number must be exactly 10 digits and contain only numbers");
      return;
    }

    try {
      setLoading(true);

      // Send data to backend
      const { data } = await axios.put("/api/teacher/setup-profile", {
        phone,
        specialization,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Update user context
      setUser({
        ...user,
        phone,
        specialization,
        isProfileCompleted: true,
      });

      toast.success("Profile completed successfully!");
      navigate("/teacher/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center text-primary">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name Field */}
          <div>
            <label className="block mb-1 font-medium text-primary700">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black cursor-not-allowed"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block mb-1 font-medium text-primary-700">Phone Number</label>
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

          {/* Specialization / Expertise Field */}
          <div>
            <label className="block mb-1 font-medium text-primary-700">Specialization / Expertise</label>
            <textarea
              name="specialization"
              placeholder="List your specializations and expertise (max 150 words)"
              value={form.specialization}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              {form.specialization.split(/\s+/).filter(Boolean).length}/150 words
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfileSetup;
