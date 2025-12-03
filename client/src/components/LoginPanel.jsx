// components/LoginPanel.jsx
import { useAppContext } from "../context/AppContext";
import { useState } from "react";

const LoginPanel = () => {
  const { showUserLogin, setShowUserLogin, setIsUser } = useAppContext();

  const [isSignup, setIsSignup] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      console.log("Signup:", form);
    } else {
      setIsUser({ email: form.email });
      console.log("Login:", form.email);
    }
    setShowUserLogin(false);
  };

  const closePanel = () => setShowUserLogin(false);

  if (!showUserLogin) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closePanel}
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 z-40
          ${showUserLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sliding Panel - Now FULLY SCROLLABLE */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 
          bg-[#0f172a] text-white p-8 
          transition-transform duration-500 ease-in-out z-50 overflow-y-auto
          ${showUserLogin ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Inner container with max width for better mobile experience */}
        <div className="max-w-lg mx-auto min-h-full flex flex-col justify-start pt-10">

          {/* White line */}
          <div className="w-20 h-px bg-white mb-16 mx-auto"></div>

          {/*Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-center leading-tight mb-16">
            {isSignup ? (
              <>
                Let's create something<br />
                <span className="text-white">better together</span>
              </>
            ) : (
              "Let's create something better together"
            )}
          </h2>

          {/* Form - takes up available space and allows scrolling */}
          <form onSubmit={handleSubmit} className="space-y-12 flex-1 pb-20">

            {isSignup && (
              <>
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-medium text-gray-300 mb-4">Full name*</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="block w-full pb-3 bg-transparent border-b-2 border-gray-600 
                                 text-white text-xl placeholder:text-gray-500 
                                 focus:border-white outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-medium text-gray-300 mb-4">Role*</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                      className="block w-full pb-3 bg-transparent border-b-2 border-gray-600 
             text-white text-xl placeholder:text-gray-500 
             focus:border-white outline-none transition-colors"
                    >
                      <option value="" className="text-black">-- Select --</option>
                      <option value="student" className="text-black">Student</option>
                      <option value="teacher" className="text-black">Teacher</option>
                    </select>

                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-300 mb-4">Phone number*</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="98XXXXXXXX"
                      className="block w-full pb-3 bg-transparent border-b-2 border-gray-600 
                 text-white text-xl placeholder:text-gray-500 
                 focus:border-white outline-none transition-colors"
                    />
                  </div>
                </div>

              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-lg font-medium text-gray-300 mb-4">Email*</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="block w-full pb-3 bg-transparent border-b-2 border-gray-600 
                           text-white text-xl placeholder:text-gray-500 
                           focus:border-white outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-lg font-medium text-gray-300 mb-4">Password*</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="block w-full pb-3 bg-transparent border-b-2 border-gray-600 
                           text-white text-xl placeholder:text-gray-500 
                           focus:border-white outline-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-8 flex justify-center">
              <button
                type="submit"
                className="px-16 py-4 bg-white text-[#0f172a] font-bold text-lg 
                           rounded-full hover:bg-gray-100 transition-all duration-300 
                           shadow-xl hover:shadow-2xl"
              >
                {isSignup ? "Create Account" : "Login"}
              </button>
            </div>
          </form>

          {/* Toggle Link */}
          <div className="mt-12 flex items-center justify-center gap-4 text-gray-400 text-center">
            <span>{isSignup ? "Already have an account?" : "New to KUnify?"}</span>
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-white font-bold hover:underline"
            >
              {isSignup ? "Login here" : "Create an account"}
            </button>
          </div>

          <div className="h-20"></div>
        </div>

        {/* Close Button */}
        <button
          onClick={closePanel}
          className="absolute top-8 right-8 text-3xl text-white/70 hover:text-white transition z-10"
        >
          ×
        </button>
      </div>
    </>
  );
};

export default LoginPanel;