import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-secondary border-t border-secondary/20">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center gap-4">
        <img
          src={assets.ku_logo}
          alt="Kathmandu University Logo"
          className="h-10 sm:h-12 md:h-14 w-auto"
        />

        <p className="text-center text-sm md:text-base text-secondary/80">
          © {new Date().getFullYear()} Kathmandu University. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;