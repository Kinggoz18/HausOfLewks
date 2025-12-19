import React from "react";
import PageHeader from "../../../Components/PageHeader";
import CustomButton from "../../../Components/CustomButton";
import { useNavigate } from "@remix-run/react";

const RenderPolicies = (props) => {
  const { policies } = props;
  return (
    <ul className="gap-y-3 sm:gap-y-4 flex flex-col">
      {policies?.map((element, index) => (
        <li className="" key={index}>
          <div className="font-semibold text-base sm:text-lg md:text-[18px]">{element?.title}</div>
          <div className="text-sm sm:text-base">{element?.policy}</div>
        </li>
      ))}
    </ul>
  );
};

const RenderNotes = (props) => {
  const { notes } = props;
  return (
    <ul className="gap-y-3 sm:gap-y-4 flex flex-col">
      {notes?.map((element, index) => (
        <li
          key={index}
          className={`list-disc list-inside text-sm sm:text-base ${
            element?.isBold ? "font-semibold" : ""
          }`}
        >
          {element?.content}
        </li>
      ))}
    </ul>
  );
};

export default function BookingFailed() {
  const navigate = useNavigate();

  const policies = [
    {
      title: "Arriving on time",
      policy:
        "To respect everyone's time, please arrive on time. If you are unable to make it at the scheduled time please reach out and let me know in advance. A $10 fee will apply for clients arriving more than 10 minutes late.",
    },
    {
      title: "Hair Preparation Guidelines",
      policy:
        "Please arrive with freshly washed, blown-out hair, free of oils or products. A $10 fee will apply if this is not followed.",
    },
    {
      title: "Deposits",
      policy:
        "No deposit is needed initially. However, in case of a no-call, no-show, future bookings may require a deposit to secure your appointment, with the deposit being credited towards your appointment",
    },
    {
      title: "Illness",
      policy:
        "If you have a scheduled appointment and you are ill, PLEASE wear a mask.",
    },
    {
      title: "Appointment Changes",
      policy:
        "If any changes need to be made to your appointment, please notify me at least 24 hours in advance in order to avoid additional charges.",
    },
    {
      title: "Cancellation",
      policy:
        "If you need to cancel or reschedule, please notify us at least 24 hours in advance.",
    },
    {
      title: "NO-SHOW POLICY",
      policy:
        "Two or more no-shows may result in suspension from booking future appointments.",
    },
  ];

  const notes = [
    {
      content: "X-pression hair preferably, please ask me before purchasing",
      isBold: false,
    },
    {
      content: "Pre stretched hair extension only",
      isBold: false,
    },
    {
      content:
        "Any non standard styling such as: wavy parting, adding rubberband at the end of twist a fee of $5 is added to the base price.",
      isBold: false,
    },
    {
      content:
        "IF ON THE DATE OF YOUR APPOINTMENT YOUR HAIR IS TANGLED MY DETANGLE FEE OF $10 WILL APPLY TO THE PRICE OF YOUR STYLE!",
      isBold: true,
    },
    {
      content:
        "If you decide to change your hairstyle either before or after I have started working on your hair, a fee of $5 will be added to the base price of the new style.",
      isBold: false,
    },
    {
      content: "Bus 11 & 4 run right outside location of appointment.",
      isBold: false,
    },
    {
      content:
        "ARRIVING LATE FOR A RESCHEDULED APPOINTMENT WILL LEAD TO AUTOMATIC CANCELLATION.",
      isBold: true,
    },
  ];

  const onNextClick = () => {
    navigate("/booking/create");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 bg-neutral-100">
      <PageHeader
        title="Booking unsuccessful"
        subtitle="Something went wrong while trying to complete your booking. Please review the information below and try again."
      />

      <div className="w-full max-w-4xl mt-6 sm:mt-8 flex flex-col gap-4 sm:gap-6">
        <div className="bg-white/80 rounded-2xl shadow-sm border border-neutral-200/70 p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-neutral-700">
            We weren&apos;t able to complete your booking this time. Before you
            try again, please make sure your details are correct and review our
            policies and notes so everything goes smoothly next time.
          </p>
        </div>

        <div className="bg-white/80 rounded-2xl shadow-sm border border-neutral-200/70 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-3 text-neutral-900">
              Policies
            </h2>
            <RenderPolicies policies={policies} />
          </div>

          <div>
            <h2 className="font-semibold text-base sm:text-lg mb-3 text-neutral-900">
              Things to note
            </h2>
            <RenderNotes notes={notes} />
          </div>
        </div>

        <div className="flex flex-col w-full justify-center items-center mt-2">
          <CustomButton
            label="Try again"
            onClick={onNextClick}
            className={"bg-primary-purple w-full sm:w-[180px] rounded-lg mt-2 text-sm sm:text-base"}
            isActive={true}
          />
        </div>
      </div>
    </div>
  );
}
