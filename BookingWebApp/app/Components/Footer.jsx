import { Link } from "@remix-run/react";
import Logo from "../images/haus_of_lewks_logo.png";
import Instagram from "../images/Instagram.svg";
import Tiktok from "../images/TikTok.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="relative w-full bg-primary-green py-10 sm:py-12 md:py-16"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
          {/* Logo & Description */}
          <div className="flex flex-col gap-4">
            <Link to="/" aria-label="Haus of Lewks - Go to homepage">
              <img 
                src={Logo} 
                alt="Haus of Lewks" 
                className="w-24 sm:w-28 md:w-32"
              />
            </Link>
            <p className="text-white/80 text-sm max-w-xs">
              Professional braids, locs & protective styles in Peterborough, Ontario.
            </p>
          </div>
          
          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/booking/create" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link 
                  to="/showroom" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Showroom
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/policy" 
                  className="text-white/80 hover:text-white transition-colors text-sm"
                >
                  Policies
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Connect With Us
            </h3>
            <address className="not-italic space-y-2 text-sm text-white/80 mb-4">
              <p>
                <a 
                  href="mailto:info@hausoflewks.com" 
                  className="hover:text-white transition-colors"
                >
                  info@hausoflewks.com
                </a>
              </p>
              <p>Peterborough, Ontario</p>
            </address>
            
            {/* Social Links */}
            <div className="flex gap-3" role="list" aria-label="Social media links">
              <a
                href="https://instagram.com/hausoflewks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Follow us on Instagram"
              >
                <img
                  src={Instagram}
                  alt=""
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://tiktok.com/@hausoflewks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Follow us on TikTok"
              >
                <img
                  src={Tiktok}
                  alt=""
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-white/20 mb-6"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-white/60 text-xs sm:text-sm">
          <p>© {currentYear} Haus of Lewks. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/policy" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
