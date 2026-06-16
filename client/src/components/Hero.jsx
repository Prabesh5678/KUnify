import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Hero = () => {
  const { setShowUserLogin, setShowSignupPanel } = useAppContext();

  return (
    <section className="w-full min-h-screen bg-primary text-secondary">
      <div className="mx-auto max-w-6xl min-h-screen flex flex-col-reverse md:flex-row items-center justify-center gap-10 px-6 sm:px-8 md:px-12 py-10 md:py-16">

        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              Submit,
              <br />
              Supervise,
              <br />
              Track.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-secondary/80">
              Your Centralized Academic Platform.
            </p>
          </div>

          <button
            onClick={() => {
              setShowUserLogin(true);
              setShowSignupPanel(true);
            }}
            className="inline-flex items-center justify-center rounded-full bg-secondary px-6 sm:px-8 py-3 text-sm sm:text-base font-medium text-black hover:bg-secondary/90 hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center w-full">
          <img
            src={assets.potential_bg2}
            alt="main_background_img"
            className="
              w-full
              max-w-xs
              sm:max-w-sm
              md:max-w-md
              lg:max-w-xl
              h-auto
              rounded-md
              shadow-lg
              object-cover
              border-4
              border-secondary/50
            "
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;