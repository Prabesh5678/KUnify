import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Hero = () => {
  
 const { setShowUserLogin, setShowSignupPanel } = useAppContext();


  return (
    <section className="w-screen h-screen bg-primary text-secondary">
      <div className="mx-auto h-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-10 px-6 md:px-12 py-16">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <p className="text-4xl md:text-5xl font-semibold leading-snug">
              Submit,
              <br />
              Supervise,
              <br />
              Track.
            </p>
            <p className="text-lg md:text-xl text-secondary/80">
              Your Centralized Academic Platform.
            </p>
          </div>
 <button
            onClick={() => {
              setShowUserLogin(true);     // open panel
              setShowSignupPanel(true);   // open in signup mode
            }}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-secondary px-8 py-3 text-base font-medium text-black hover:bg-secondary/90 hover:scale-105 hover:shadow-lg transition cursor-pointer"
          >
            Get Started
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={assets.potential_bg2}
            alt="main_background_img"
            className="w-full max-w-xl h-80 md:h-96 rounded-md shadow-lg object-cover border-4 border-secondary/50"
          />

        </div>
      </div>
    </section>
  );
};

export default Hero;

