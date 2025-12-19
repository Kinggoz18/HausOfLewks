import Logo from "../images/haus_of_lewks_logo.png";
import AppointmentIcon from "../images/appointments.svg";
import ScheduleIcon from "../images/calendar2.svg";
import DashboardIcon from "../images/dashboard.svg";
import ServiceIcon from "../images/serviceIcon.svg";
import MediaIcon from "../images/upload-image.svg";

import { Link, useLocation, useNavigate } from "@remix-run/react";
import AuthAPI from "../../storage/APIs/auth";
import { getPersistData } from "../../storage/persistData";
import MobileNavbar from "./MobileNavbar";

const RenderNavElements = (props) => {
  const { pages } = props;
  const location = useLocation();
  const pathname = location.pathname;

  const isSelected = (page) => {
    return pathname.includes(`/${page.toLowerCase()}`);
  };

  return pages.map((element, index) => (
    <div
      className={`${
        isSelected(element?.lable) ? "bg-secondary-green" : ""
      } flex flex-row justify-start items-center w-full gap-x-2 sm:gap-x-3 text-sm sm:text-base md:text-[20px] cursor-pointer text-neutral-100 font-semibold p-1 rounded-lg pl-2`}
      key={index}
      onClick={element?.onClick}
    >
      <img src={element?.img} className="h-4 w-4 sm:h-5 sm:w-5 md:h-[21px] md:w-[20px]" alt="" />
      <span className="truncate">{element?.lable}</span>
    </div>
  ));
};

export default function AdminSidebar() {
  const navigate = useNavigate();
  const user = getPersistData("user");
  const authAPI = new AuthAPI();
  const navPages = [
    {
      lable: "Dashboard",
      img: DashboardIcon,
      onClick: () => {
        navigate("/admin/dashboard");
      },
    },
    {
      lable: "Schedule",
      img: ScheduleIcon,
      onClick: () => {
        navigate("/admin/schedule");
      },
    },
    {
      lable: "Appointments",
      img: AppointmentIcon,
      onClick: () => {
        navigate("/admin/appointments");
      },
    },
    {
      lable: "Services",
      img: ServiceIcon,
      onClick: () => {
        navigate("/admin/services");
      },
    },
    {
      lable: "Income Report",
      img: DashboardIcon, // Reusing dashboard icon for income report
      onClick: () => {
        navigate("/admin/income-statement");
      },
    },
    {
      lable: "Blog",
      img: ServiceIcon, // Reusing service icon for blog
      onClick: () => {
        navigate("/admin/blog");
      },
    },
    {
      lable: "Media",
      img: MediaIcon,
      onClick: () => {
        navigate("/admin/media");
      },
    },
  ];

  const onLogoutClick = async () => {
    console.log({ user });
    if (!user?._id) return;

    await authAPI.logoutUser(user?._id);
    navigate("/admin/login");
  };

  const navItems = navPages.map(page => ({
    label: page.lable,
    img: page.img,
    onClick: page.onClick,
    path: page.lable.toLowerCase().replace(' ', '-')
  }));

  return (
    <>
      {/* Mobile Navbar */}
      <MobileNavbar 
        navItems={navItems} 
        onLogout={onLogoutClick}
        isAdmin={true}
      />

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-full left-0 w-[249px] px-[27px] py-[20px] bg-primary-green absolute items-center z-10">
        {/******************************** Logo ******************************************/}
        <Link to={"/admin/dashboard"} className="">
          <img src={Logo} alt="Logo" className="w-auto"></img>
        </Link>

        <div className="flex flex-col mt-[100px] gap-y-6 w-full">
          <RenderNavElements pages={navPages} />
        </div>

        <div
          onClick={onLogoutClick}
          className="cursor-pointer text-left w-full bottom-10 absolute left-[20px] text-[20px] text-neutral-100 font-semibold"
        >
          Logout
        </div>
      </div>
    </>
  );
}
