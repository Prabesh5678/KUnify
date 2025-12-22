import React from 'react';
import { NotebookPen } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const Request = () => {
  return (
    <div className="min-h-screen py-9 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg border-b">
          <div className="px-8 py-6 flex items-center gap-4">
            <NotebookPen className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Initial Form</h1>
              <p className="text-gray-600 mt-1">Complete the form below to submit your proposal</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8 md:p-10 -mt-1">
          <form className="space-y-8">

            {/* Project Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your project title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Abstract <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Abstract of your project in 200-250 words."
                className="w-full px-4 py-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition"
                onInput={(e) => {
                  const words = e.target.value.split(/\s+/);
                  if (words.length > 250) {
                    e.target.value = words.slice(0, 250).join(" ");
                  }
                }}
              />
            </div>

            {/* Keywords & Supervisor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React, Machine Learning, IoT, Blockchain"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                <p className="text-xs text-gray-500 mt-2">Separate keywords with commas</p>
              </div>

              {/* Preferred Supervisor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Supervisor
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  defaultValue="Any available supervisor"
                  onChange={(e) => {
                    if (e.target.value !== "Any available supervisor") {
                      toast(`You selected ${e.target.value} as your supervisor. Please note that ${e.target.value} is not your confirmed supervisor.`, {
                        position: 'top-center', // <-- show toast in the center
                        duration: 5000,         // optional: duration in ms
                        style: {
                          maxWidth: '600px',
                          textAlign: 'center',
                        },
                      });
                    }
                  }
                  }
                >
                  <option>Dr. Amita Sharma</option>
                  <option>Prof. Rajesh KC</option>
                  <option>Dr. Suman Shrestha</option>
                  <option>Dr. Priya Thapa</option>
                  <option>Any available supervisor</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">Final assignment subject to availability</p>
              </div>
            </div>
            {/* Proposal PDF Upload */}
            {/* Proposal PDF Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Proposal (PDF only, max 2MB) <span className="text-red-500">*</span>
              </label>

              <label className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-200 transition">
                Choose File
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (file.type !== "application/pdf") {
                        toast.error("Only PDF files are allowed!");
                        e.target.value = null;
                      } else if (file.size > 2 * 1024 * 1024) {
                        toast.error("File size cannot exceed 2MB!");
                        e.target.value = null;
                      } else {
                        toast.success("PDF file selected successfully!");
                      }
                    }
                  }}
                  className="hidden" // hide default file input
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Only PDF files under 2MB are allowed.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-10">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/70 text-white hover:text-white-700 font-bold py-3.5 px-12 rounded-xl shadow-lg transition transform hover:scale-105 text-base"
              >
                Submit Request
              </button>
            </div>

          </form>

          {/* Hot Toast */}
          <Toaster position="top-right" reverseOrder={false} />

        </div>
      </div>
    </div>
  );
};

export default Request;
