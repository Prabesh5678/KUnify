// AddTeacherModal.jsx
import React, { useState } from "react";
import toast from "react-hot-toast";

const AddTeacherModal = ({ isOpen, onClose, onAddTeacher }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    if (form.email.endsWith("@ku.edu.np")) {
      toast.error("Visiting faculty email cannot end with @ku.edu.np");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Adding teacher:", form);
      onAddTeacher(form);
      toast.success("Teacher added successfully!");
      setForm({ name: "", email: "", password: "" });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add teacher");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-primary z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add Visiting Faculty</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="p-2 rounded border border-gray-300 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
          />
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
      </div>
    </div>
  );
};

export default AddTeacherModal;
