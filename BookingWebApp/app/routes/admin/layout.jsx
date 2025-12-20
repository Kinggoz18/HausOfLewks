import React, { useEffect } from "react";
import AdminSidebar from "../../Components/AdminSidebar";
import { Outlet, useLocation } from "@remix-run/react";
import useValidateAdmin from "./useValidateAdmin";

export default function Layout() {
  const path = useLocation();
  const isLoginPage = path.pathname === "/admin/login";
  /********************************* {UseEffect Hooks} ***************************************/
  useEffect(() => {
    if (path.pathname === "/admin") {
      window.location.href = "/admin/dashboard";
    }
  }, []);

  /************************************************************************************************************************/
  /*****************************************************{ UseEffect }******************************************************/
  /************************************************************************************************************************/
  useValidateAdmin();

  return (
    <div className="relative primary-gradient w-full h-full">
      {!isLoginPage && <AdminSidebar />}
      <div
        className={`absolute px-4 sm:px-6 md:px-8 lg:px-[27px] py-6 sm:py-8 md:py-10 lg:py-[40px] h-full top-0 overflow-y-scroll bg-neutral-100 ${
          isLoginPage ? "" : "w-full md:w-[calc(100%_-_249px)] left-0 md:left-[249px] pt-16 md:pt-0"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
}
