import { assets } from "../assets/assets";

const About= () => {
  return (
    <section className="w-full bg-secondary text-primary py-16">
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid gap-10 md:grid-cols-2 items-center">
        {/*left ko image */}
        <div className="flex justify-center">
          <div className="rounded-3xl overflow-hidden border-4 border-primary/30 shadow-lg">
            <img
              src={assets.potential_bg3}
              alt="Students collaborating"
              className="w-full h-72 md:h-80 object-cover"
            />
          </div>
        </div>

        <div className="rounded-3xl border-4 border-primary/60 px-6 py-8 md:px-10 md:py-10 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">
            About Student Project Management Platform
          </h2>

          <p className="text-base md:text-lg leading-relaxed">
            A centralized platform that simplifies how academic projects are
            proposed, supervised, and submitted. It brings students, supervisors,
            and administrators together in one transparent workspace.
          </p>

          <p className="text-base md:text-lg leading-relaxed">
            Students can track deadlines and deliverables, supervisors can monitor
            progress in real time, and administrators gain a clear overview of
            all ongoing projects for better coordination and decision-making.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;