export default function TeacherSettings() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6 bg-blue-100/40 rounded-2xl p-6">

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
          <p className="text-gray-500">Your account</p>
        </div>

        {/* Profile Settings */}
        <div className="bg-blue-50 rounded-lg shadow-lg border border-blue-100">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  defaultValue="Teacher"
                  disabled
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value="teacher@ku.edu"
                  disabled
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Department & Office Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  defaultValue="DoCSE"
                  disabled
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Office Location */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Office Location
                </label>
                <input
                  type="text"
                  defaultValue="Building A, Room 305"
                  disabled
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
