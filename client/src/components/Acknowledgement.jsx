
import { useAppContext } from "../context/AppContext";

const AcknowledgementSection = () => {
  const { setShowUserLogin, setShowSignupPanel } = useAppContext();

  return (
    <section className="w-full bg-secondary text-primary py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 items-center">
        
        {/* Left Section */}
        <div className="space-y-6 text-center md:text-left max-w-md md:max-w-none mx-auto md:mx-0">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
            Student Project Management Platform
          </h2>

          <button
            onClick={() => {
              setShowUserLogin(true);
              setShowSignupPanel(true);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-medium text-secondary hover:bg-accent/90 transition-all duration-300 cursor-pointer"
          >
            Sign me up
          </button>
        </div>

        {/* Right Section */}
        <div className="bg-neutral-100 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm">
          <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-primary">
            We acknowledge the community that supports our learning.
          </h3>

          <p className="text-sm sm:text-base leading-relaxed text-primary/80">
            This Student Project Management Platform is made possible by the
            dedication of our academic community. It recognizes the efforts of
            students, faculty, and administrators who work together to create a
            transparent, respectful, and innovation-driven learning environment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AcknowledgementSection;
