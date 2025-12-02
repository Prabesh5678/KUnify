import { useAppContext } from "../context/AppContext";

const AcknowledgementSection = () => {
  const { setShowUserLogin, setShowSignupPanel } = useAppContext();

  return (
    <section className="w-full bg-secondary text-primary py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid gap-10 md:grid-cols-[1fr_1.5fr] items-center">

        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold">
            logo halne yeta KUnify
          </h2>

          <button
            onClick={() => {
              setShowUserLogin(true);     // open panel
              setShowSignupPanel(true);   // open in signup mode
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-medium text-secondary hover:bg-accent/90 cursor-pointer"
          >
            Sign me up
          </button>

        </div>

        {/* Right: rounded card with text */}
        <div className="bg-neutral-100 rounded-3xl px-6 py-8 md:px-10 md:py-10 shadow-sm">
          <h3 className="text-lg md:text-xl font-semibold mb-3 text-primary">
            We acknowledge the community that supports our learning.
          </h3>
          <p className="text-sm md:text-base leading-relaxed">
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