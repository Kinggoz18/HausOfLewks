import React, { useState } from "react";
import { Link, useNavigate } from "@remix-run/react";
import Logo from "../images/haus_of_lewks_logo.png";
import CustomButton from "./CustomButton";

export default function BookingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navItems = [
    {
      label: "Create Booking",
      onClick: () => navigate("/booking/create"),
      path: "/booking/create",
    },
    {
      label: "Find Booking",
      onClick: () => navigate("/booking/find"),
      path: "/booking/find",
    },
    {
      label: "Home",
      onClick: () => navigate("/"),
      path: "/",
    },
    {
      label: "Showroom",
      onClick: () => navigate("/showroom"),
      path: "/showroom",
    },
    {
      label: "Blog",
      onClick: () => navigate("/blog"),
      path: "/blog",
    },
    {
      label: "Policy",
      onClick: () => navigate("/policy"),
      path: "/policy",
    },
  ];

  return (
    <>
      {/* Mobile Navbar Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary-green shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" onClick={closeMenu}>
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </Link>
          <button
            onClick={toggleMenu}
            className="text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? (
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
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <>
        <div
          className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeMenu}
        />
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-primary-green z-50 md:hidden shadow-xl overflow-y-auto transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo in menu */}
            <div className="p-4 border-b border-secondary-green/20">
              <Link to="/" onClick={closeMenu}>
                <img src={Logo} alt="Logo" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    closeMenu();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-neutral-100 hover:bg-secondary-green/50 transition-colors"
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </>

      {/* Desktop Navbar */}
      <div className="hidden md:block relative flex flex-row w-full px-[27px] h-[113px] py-[10px] bg-primary-green items-end gap-[25%]">
        <Link to={"/"} className="absolute left-[27px]">
          <img src={Logo} alt="Logo"></img>
        </Link>

        <div className="absolute right-[27px] flex flex-row gap-x-3 items-center">
          <div className="flex flex-row gap-x-5 mr-[40px] justify-center text-white">
            <button
              onClick={() => navigate("/showroom")}
              className="hover:text-secondary-green transition-colors"
            >
              Showroom
            </button>
            <button
              onClick={() => navigate("/blog")}
              className="hover:text-secondary-green transition-colors"
            >
              Blog
            </button>
            <button
              onClick={() => navigate("/policy")}
              className="hover:text-secondary-green transition-colors"
            >
              Policy
            </button>
          </div>

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

      {/* Spacer for mobile navbar */}
      <div className="md:hidden h-16" />
    </>
  );
}
