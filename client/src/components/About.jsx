
import { assets } from "../assets/assets";

const About = () => {
  return (
    <section className="w-full bg-secondary text-primary py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Image */}
        <div className="flex justify-center">
          <div className="w-full rounded-3xl overflow-hidden border-4 border-primary/30 shadow-lg">
            <img
              src={assets.potential_bg3}
              alt="Students collaborating"
              className="w-full h-60 sm:h-72 md:h-80 object-cover"
            />
          </div>
        </div>

        {/* Right Content */}
        <div className="rounded-3xl border-4 border-primary/60 p-6 sm:p-8 md:p-10 space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
            About Student Project Management Platform
          </h2>

          <p className="text-base md:text-lg leading-relaxed">
            A centralized platform that simplifies how academic projects are
            proposed, supervised, and submitted. It brings students,
            supervisors, and administrators together in one transparent
            workspace.
          </p>

          <p className="text-base md:text-lg leading-relaxed">
            Students can track deadlines and deliverables, supervisors can
            monitor progress in real time, and administrators gain a clear
            overview of all ongoing projects for better coordination and
            decision-making.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
