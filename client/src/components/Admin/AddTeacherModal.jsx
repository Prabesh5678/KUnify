import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { FaRegCopy } from "react-icons/fa";

const AddTeacherModal = ({ isOpen, onClose, onAddTeacher }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(form.password);
    toast.success("Password copied to clipboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("/api/teachers", form);
      onAddTeacher(res.data);
      toast.success("Visiting faculty added successfully!");
      setForm({ name: "", email: "", password: "" });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add teacher");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg relative">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Add Visiting Faculty
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="p-2 rounded border border-gray-300 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="p-2 rounded border border-gray-300 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="p-2 rounded border border-gray-300 focus:ring-indigo-300 focus:border-indigo-300 outline-none w-full"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>

            <button
              type="button"
              onClick={handleCopyPassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              title="Copy password"
            >
              <FaRegCopy size={16} />
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/80"
            >
              {isLoading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AddTeacherModal;
