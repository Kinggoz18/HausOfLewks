import React, { useEffect } from "react";
import { getPersistData } from "../../../storage/persistData";
import { useLocation, useNavigate } from "@remix-run/react";

export default function useValidateAdmin() {
  const user = getPersistData("user");
  const token = getPersistData("csrf-token");
  const isAuthorized = user?._id && token ? true : false;
  const navigate = useNavigate();
  const path = useLocation();

  useEffect(() => {
    const pathname = path.pathname;
    if (!isAuthorized && pathname !== "/admin/login")
      window.location.href = "/admin/login";
    else if (pathname === "/admin") window.location.href = "/admin/dashboard";
  }, []);
}
