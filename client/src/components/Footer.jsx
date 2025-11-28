import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-primary text-secondary">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col items-center gap-4">
        <img
          src={assets.ku_logo}
          alt="Logo"
          className="h-14 w-auto"
        />

        <p className="text-sm md:text-base text-center">
          Copyright © {new Date().getFullYear()} Kathmandu University. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
