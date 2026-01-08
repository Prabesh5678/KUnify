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

  /* 🔒 Only teachers allowed */
  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/", { replace: true });
    }

    // Prefill name & faculty type
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      facultyType: user?.type || "regular",
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { phone, specialization } = form;

    if (!phone || !specialization) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      // Mock update (replace with API later)
      setUser({
        ...user,
        ...form,
        profileCompleted: true,
      });

      toast.success("Profile completed successfully");
      navigate("/teacher/dashboard", { replace: true });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-lg bg-[#111] rounded-xl border border-gray-800 shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-100">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Read-only) */}
          <input
            type="text"
            name="name"
            value={form.name}
            readOnly
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
          />

          {/* Phone Number */}
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number *"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100"
          />

          {/* Specialization */}
          <input
            type="text"
            name="specialization"
            placeholder="Specialization / Expertise (e.g. React, IoT, AI, ML) *"
            value={form.specialization}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-gray-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-medium transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherProfileSetup;
