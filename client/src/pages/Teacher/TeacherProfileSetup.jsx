import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const POSITION_OPTIONS = [
  "Visiting Faculty",
  "Teaching Assistant",
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

const TeacherProfileSetup = () => {
  const { user, setUser } = useAppContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    position: "",
  });

  const [specializationTags, setSpecializationTags] = useState([]);
  const [specializationInput, setSpecializationInput] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user === undefined) return;

    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    if (user.role !== "teacher") {
      navigate("/", { replace: true });
      return;
    }

    if (user.isProfileCompleted) {
      navigate("/teacher/projects", { replace: true });
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: user.name || "",
    }));
  }, [user, navigate]);

  if (user === undefined || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-gray-600 text-sm sm:text-base">
          Loading profile setup...
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionSelect = (pos) => {
    setForm((prev) => ({ ...prev, position: pos }));
  };

  // ---- Specialization chip logic ----
  const addSpecializationTag = (rawValue) => {
    const value = rawValue.trim();
    if (!value) return;

    if (specializationTags.length >= 150) return;

    if (
      specializationTags.some(
        (tag) => tag.toLowerCase() === value.toLowerCase()
      )
    ) {
      setSpecializationInput("");
      return;
    }

    const updatedTags = [...specializationTags, value];
    setSpecializationTags(updatedTags);
    setForm((prev) => ({
      ...prev,
      specialization: updatedTags.join(", "),
    }));
    setSpecializationInput("");
  };

  const removeSpecializationTag = (indexToRemove) => {
    const updatedTags = specializationTags.filter(
      (_, idx) => idx !== indexToRemove
    );
    setSpecializationTags(updatedTags);
    setForm((prev) => ({
      ...prev,
      specialization: updatedTags.join(", "),
    }));
  };

  const handleSpecializationInputChange = (e) => {
    const value = e.target.value;

    // Comma triggers a new chip
    if (value.includes(",")) {
      const parts = value.split(",");
      const lastPart = parts.pop();
      parts.forEach((part) => addSpecializationTag(part));
      setSpecializationInput(lastPart);
      return;
    }

    setSpecializationInput(value);
  };

  const handleSpecializationKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSpecializationTag(specializationInput);
    } else if (
      e.key === "Backspace" &&
      specializationInput === "" &&
      specializationTags.length > 0
    ) {
      removeSpecializationTag(specializationTags.length - 1);
    }
  };

  const handleSpecializationBlur = () => {
    if (specializationInput.trim()) {
      addSpecializationTag(specializationInput);
    }
  };
  // ---- End specialization chip logic ----

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { phone, specialization, position } = form;
    const phoneRegex = /^\d{10}$/;

    if (!phone || !specialization || !position) {
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
        { phone, specialization, position },
        { withCredentials: true }
      );

      if (!data.success) {
        throw new Error(data.message || "Failed to complete profile");
      }

      const updatedUser = {
        ...data.user,
        role: "teacher",
        picture: data.user.avatar || "",
        _id: data.user._id || data.user.id,
      };

      setUser(updatedUser);

      toast.success("Profile completed successfully!");
      navigate("/teacher/projects", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.phone.trim() !== "" &&
    form.specialization.trim() !== "" &&
    form.position.trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-lg p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-center text-primary">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm sm:text-base font-medium text-primary-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              readOnly
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-black text-sm sm:text-base cursor-not-allowed bg-gray-100"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-sm sm:text-base font-medium text-primary-700">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your 10-digit phone number"
              value={form.phone}
              onChange={handleChange}
              maxLength={10}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-black text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block mb-2 text-sm sm:text-base font-medium text-primary-700">
              Position
            </label>
            <select
              value={form.position}
              onChange={(e) => handlePositionSelect(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-150"
            >
              <option value="" disabled>
                Select a position
              </option>
              {POSITION_OPTIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
            {form.position && (
              <p className="text-xs text-primary mt-2">
                Selected: <span className="font-semibold">{form.position}</span>
              </p>
            )}
          </div>

          {/* Specialization - Chip Input */}
          <div>
            <label className="block mb-1 text-sm sm:text-base font-medium text-primary-700">
              Specialization / Expertise
            </label>
            <div
              className="w-full min-h-[44px] px-2.5 sm:px-3 py-2 border border-gray-300 rounded-md flex flex-wrap items-center gap-1.5 sm:gap-2 focus-within:ring-2 focus-within:ring-primary"
              onClick={() =>
                document.getElementById("specialization-input")?.focus()
              }
            >
              {specializationTags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-xs sm:text-sm font-medium px-2 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSpecializationTag(index);
                    }}
                    className="text-primary hover:text-red-500 font-bold leading-none ml-0.5"
                    aria-label={`Remove ${tag}`}
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                id="specialization-input"
                type="text"
                value={specializationInput}
                onChange={handleSpecializationInputChange}
                onKeyDown={handleSpecializationKeyDown}
                onBlur={handleSpecializationBlur}
                placeholder={
                  specializationTags.length === 0
                    ? "e.g. C, C++ (press Enter or comma to add)"
                    : ""
                }
                className="flex-1 min-w-[100px] text-sm sm:text-base outline-none bg-transparent py-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {specializationTags.length}/150 skills added
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-2.5 sm:py-2 rounded-md font-medium text-sm sm:text-base transition ${!isFormValid || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90 text-white cursor-pointer"
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
