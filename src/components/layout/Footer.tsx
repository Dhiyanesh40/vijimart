import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Leaf } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="gradient-footer text-white">
      {/* Main row */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Icon mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-green-700 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 17 C10 17 4 12.5 4 7.5 C4 4.5 6.8 3 10 3 C13.2 3 16 4.5 16 7.5 C16 12.5 10 17 10 17Z" fill="rgba(255,255,255,0.25)" />
                <path d="M10 3 C10 3 10 10 10 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 8 C10 8 7 6 5 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M10 11 C10 11 13 9 15 10" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="font-display font-black text-base leading-none tracking-tight text-white">Sri Vijiyalaxmi</p>
              <p className="text-[9px] font-bold text-accent tracking-[0.22em] uppercase mt-[3px]">Super Mart</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { to: "/products", label: "Products" },
              { to: "/products?category=groceries", label: "Groceries" },
              { to: "/products?category=snacks", label: "Snacks" },
              { to: "/products?category=dairy", label: "Dairy" },
              { to: "/cart", label: "Cart" },
              { to: "/terms", label: "Terms" },
              { to: "/privacy", label: "Privacy" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/50 hover:text-white text-xs font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contact + social */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-4">
              <a href="tel:+919876543210" className="flex items-center gap-1.5 text-white/55 hover:text-white text-xs transition-colors">
                <Phone className="h-3 w-3 text-accent flex-shrink-0" />+91 98765 43210
              </a>
              <a href="mailto:info@srivijiyalaxmi.com" className="flex items-center gap-1.5 text-white/55 hover:text-white text-xs transition-colors">
                <Mail className="h-3 w-3 text-primary flex-shrink-0" />info@srivijiyalaxmi.com
              </a>
              <span className="flex items-center gap-1.5 text-white/55 text-xs">
                <Clock className="h-3 w-3 text-accent flex-shrink-0" />7 AM – 10 PM Daily
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
              <span className="text-white/40 text-[11px] leading-tight">E Raja Street, Chennimalai, TN – 638051</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div>
        <div className="border-t border-white/10"></div>
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
            <p className="text-white/30 text-[11px] font-medium">
              © {new Date().getFullYear()} Sri Vijiyalaxmi Super Mart. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
              <Leaf className="h-2.5 w-2.5 text-primary/50" />
              <span>Fresh · Quality · Trusted</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-white/40 dark:text-white/40 text-[10px] font-medium tracking-wide">
              Developed by Dhiyanesh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
