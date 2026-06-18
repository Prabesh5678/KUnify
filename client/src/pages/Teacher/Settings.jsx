import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const POSITION_OPTIONS = [
  "Visiting Faculty",
  "Teaching Assistant",
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

export default function TeacherSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingSpecialization, setEditingSpecialization] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();

    if (!value || specializations.includes(value)) return;

    setSpecializations([...specializations, value]);
    setInput("");
  };

  const removeTag = (tagToRemove) => {
    setSpecializations(
      specializations.filter((tag) => tag !== tagToRemove)
    );
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    position: "",
    role: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const fetchTeacherProfile = async () => {
    try {
      const res = await axios.get("/api/teacher/is-auth", {
        withCredentials: true,
      });

      const user = res.data.user;
      setSpecializations(
        user.specialization
          ? user.specialization.split(",").map((s) => s.trim())
          : []
      );
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: user.specialization || "",
        position: user.position || "",
        role: user.role || "Teacher",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

 const validate = () => {
  if (!form.phone) return "Phone is required";
  if (specializations.length === 0)
    return "Specialization is required";
  if (!form.position) return "Position is required";
  return null;
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Add the current input as a tag if user hasn't pressed Space yet
  let updatedTags = [...specializations];

  if (input.trim()) {
    if (!updatedTags.includes(input.trim())) {
      updatedTags.push(input.trim());
    }
  }

  if (updatedTags.length === 0) {
    setError("Specialization is required");
    return;
  }

  if (!form.phone) {
    setError("Phone is required");
    return;
  }

  if (!form.position) {
    setError("Position is required");
    return;
  }

  try {
    setSaving(true);

    await axios.put(
      "/api/teacher/setup-profile",
      {
        phone: form.phone,
        specialization: updatedTags.join(", "),
        position: form.position,
      },
      { withCredentials: true }
    );

    setSpecializations(updatedTags);
    setInput("");

    toast.success("Profile updated successfully!");
  } catch (err) {
    console.error(err);
    setError("Update failed. Please try again.");
  } finally {
    setSaving(false);
  }
};

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.put(
        "/api/teacher/change-password",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        { withCredentials: true }
      );

      toast.success("Password updated successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setDropdownOpen(false);
    } catch (err) {
      console.error(err);
      setError("Password update failed");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-gradient-to-br from-primary/10 to-white">
      <div className="max-w-4xl mx-auto space-y-6 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">

        {/* Page Title + Dropdown */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">Update your account information</p>
          </div>

          {/* Dropdown Menu (only for Visiting Faculty) */}
          {form.role === "Visiting Faculty" && (
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition"
              >
                Menu
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-56 bg-white rounded-md shadow-lg border z-10">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-primary/10"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Change Password
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
            {error}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Name (Uneditable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                disabled
                className="w-full border bg-gray-100 rounded-md px-3 py-2"
              />
            </div>

            {/* Email (Uneditable) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full border bg-gray-100 rounded-md px-3 py-2"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>

              <div className="flex flex-wrap gap-2 border rounded-md p-2 focus-within:ring-2 focus-within:ring-primary">
                {specializations.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/30 rounded-full px-3 py-1"
                  >
                    <span>{tag}</span>

                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " " ||
                      e.key === ","
                    ) {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 min-w-[120px] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Position Selector - full width below the grid */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>

            <select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full sm:w-104 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >

              {POSITION_OPTIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password (Only Visiting Faculty) */}
        {form.role === "Visiting Faculty" && dropdownOpen && (
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-primary mb-3">
              Change Password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <input
                type="password"
                placeholder="Old Password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="w-full px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
