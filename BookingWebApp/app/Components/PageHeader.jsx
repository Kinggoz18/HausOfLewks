import React from "react";

import ReturnIcon from "../images/leftArrow.svg";

export default function PageHeader(props) {
  const { title, onReturnClick = () => history.back(), subtitle } = props;

  return (
    <div className="w-full flex flex-row relative items-center">
      <img
        onClick={onReturnClick}
        src={ReturnIcon}
        alt="Return icon"
        className="w-4 sm:w-[18.75px] cursor-pointer flex-shrink-0"
      />
      <div className="ml-3 sm:ml-6 md:ml-[50px] flex flex-col gap-y-1 sm:gap-y-2">
        <h1 className="font-Poppins text-xl sm:text-2xl md:text-[30px] font-bold">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base md:text-[20px]">{subtitle}</p>}
      </div>
    </div>
  );
}
