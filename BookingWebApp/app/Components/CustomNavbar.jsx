import { Link, NavLink, useLocation, useNavigate } from "@remix-run/react";
import { useState } from "react";
import Logo from "../images/haus_of_lewks_logo.png";
import CustomButton from "./CustomButton";

export default function CustomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeClass = "";

  const isActive = (keyword) => {
    return path.includes(keyword);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    closeMenu();
  };

  return (
    <>
      <nav className="relative flex flex-row w-full px-4 sm:px-6 md:px-[27px] h-16 sm:h-20 md:h-[113px] py-3 sm:py-4 md:py-[10px] bg-primary-green items-center md:items-end gap-2 md:gap-[25%]">
        {/******************************** Logo ******************************************/}
        <Link to={"/"} className="absolute left-4 sm:left-6 md:left-[27px]">
          <img src={Logo} alt="Logo" className="w-20 sm:w-24 md:w-auto"></img>
        </Link>

        {/******************************** Mobile Menu Button ******************************************/}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden absolute right-4 sm:right-6 text-white p-2 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {/******************************** Desktop Nav Buttons ******************************************/}
        <div className="hidden md:flex absolute right-[27px] flex-row gap-x-3 items-center">
          {/******************************** Nav options ******************************************/}
          <div className="flex flex-row gap-x-3 lg:gap-x-5 mr-2 lg:mr-[40px] justify-center text-white text-sm lg:text-base">
            <NavLink
              className={`hover:text-secondary-green/80 transition-colors ${isActive("/showroom") ? "text-secondary-green font-semibold" : ""}`}
              to={`showroom`}
            >
              Showroom
            </NavLink>
            <NavLink
              className={`hover:text-secondary-green/80 transition-colors ${isActive("/blog") ? "text-secondary-green font-semibold" : ""}`}
              to={`blog`}
            >
              Blog
            </NavLink>
            <NavLink
              className={`hover:text-secondary-green/80 transition-colors ${isActive("/policy") ? "text-secondary-green font-semibold" : ""}`}
              to={`policy`}
            >
              Policy
            </NavLink>
          </div>

          <div className="flex flex-row gap-x-3">
            <CustomButton
              label={"Book now"}
              className={
                "bg-secondary-green hover:bg-secondary-green/65 transition ease-in-out"
              }
              onClick={() => navigate("/booking/create")}
            />
            <CustomButton
              label={"Find booking"}
              className={
                "bg-primary-purple hover:bg-primary-purple/65 transition ease-in-out"
              }
              onClick={() => navigate("/booking/find")}
            />
          </div>
        </div>
      </nav>

      {/******************************** Mobile Menu Overlay ******************************************/}
      <>
        <div
          className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeMenu}
        />
        <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-primary-green z-50 shadow-xl overflow-y-auto transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}>
          <div className="flex flex-col h-full">
              {/******************************** Logo in menu ******************************************/}
              <div className="p-4 border-b border-secondary-green/20">
                <Link to="/" onClick={closeMenu}>
                  <img src={Logo} alt="Logo" className="h-10 w-auto" />
                </Link>
              </div>

              {/******************************** Navigation Items ******************************************/}
              <nav className="flex-1 px-4 py-6 space-y-2">
                <button
                  onClick={() => handleNavClick("/showroom")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive("/showroom")
                      ? "bg-secondary-green text-white"
                      : "text-neutral-100 hover:bg-secondary-green/50"
                  }`}
                >
                  <span className="text-sm font-semibold">Showroom</span>
                </button>
                <button
                  onClick={() => handleNavClick("/blog")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive("/blog")
                      ? "bg-secondary-green text-white"
                      : "text-neutral-100 hover:bg-secondary-green/50"
                  }`}
                >
                  <span className="text-sm font-semibold">Blog</span>
                </button>
                <button
                  onClick={() => handleNavClick("/policy")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive("/policy")
                      ? "bg-secondary-green text-white"
                      : "text-neutral-100 hover:bg-secondary-green/50"
                  }`}
                >
                  <span className="text-sm font-semibold">Policy</span>
                </button>
              </nav>

              {/******************************** Action Buttons ******************************************/}
              <div className="p-4 border-t border-secondary-green/20 space-y-3">
                <button
                  onClick={() => handleNavClick("/booking/create")}
                  className="w-full bg-secondary-green hover:bg-secondary-green/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
                >
                  Book now
                </button>
                <button
                  onClick={() => handleNavClick("/booking/find")}
                  className="w-full bg-primary-purple hover:bg-primary-purple/80 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm"
                >
                  Find booking
                </button>
              </div>
            </div>
          </div>
      </>
    </>
  );
}
