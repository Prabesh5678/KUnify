import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function TeacherSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    role: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  // Fetch teacher profile
  const fetchTeacherProfile = async () => {
    try {
      const res = await axios.get("/api/teacher/is-auth", {
        withCredentials: true,
      });

      const user = res.data.user;

      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        specialization: user.specialization || "",
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
    if (!form.specialization) return "Specialization is required";
    return null;
  };

  // Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        "/api/teacher/setup-profile",
        { phone: form.phone, specialization: form.specialization },
        { withCredentials: true }
      );

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Change password (only for visiting faculty)
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
    <div className="min-h-screen p-6 bg-gradient-to-br from-primary/10 to-white">
      <div className="max-w-4xl mx-auto space-y-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">

        {/* Page Title + Dropdown */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-500">
              Update your account information
            </p>
          </div>

          {/* Dropdown Menu (only for Visiting Faculty) */}
          {form.role === "Visiting Faculty" && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary/90 transition"
              >
                Menu
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border">
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
              <input
                type="text"
                value={form.specialization}
                onChange={(e) =>
                  setForm({ ...form, specialization: e.target.value })
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password (Only Visiting Faculty) */}
        {form.role === "Visiting Faculty" && dropdownOpen && (
          <div className="mt-6 bg-primary/5 border border-primary/20 rounded-lg p-5">
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
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
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
