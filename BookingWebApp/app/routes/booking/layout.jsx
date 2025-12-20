import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import BookingNavbar from "../../Components/BookingNavbar";

export default function BookingIndex() {
  const path = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (path.pathname === "/booking") {
      window.location.href = "/booking/create";
    }
  }, []);

  return (
    <>
      <BookingNavbar />
      <div className="relative primary-gradient w-full px-4 sm:px-6 md:px-[27px] py-6 sm:py-8 md:py-[40px] overflow-y-scroll">
        <Outlet />
      </div>
    </>
  ); // /booking
}
