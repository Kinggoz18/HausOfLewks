import React from "react";
import PageHeader from "../Components/PageHeader";

export const meta = () => {
  const title = "Salon Policies | Haus of Lewks";
  const description =
    "Review Haus of Lewks booking, cancellation, lateness, and hair preparation policies before your appointment.";

  return [
    { title },
    { name: "description", content: description },
  ];
};

export const links = () => [
  { rel: "canonical", href: "https://hausoflewks.com/policy" },
];

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
      "No deposit is needed initially. However, in case of a no-call, no-show, future bookings may require a deposit to secure your appointment, with the deposit being credited towards your appointment.",
  },
  {
    title: "Illness",
    policy:
      "If you have a scheduled appointment and you are ill, PLEASE wear a mask.",
  },
  {
    title: "Appointment Changes",
    policy:
      "If any changes need to be made to your appointment, please notify us at least 24 hours in advance in order to avoid additional charges.",
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
    content: "X-pression hair preferably, please ask before purchasing.",
    isBold: false,
  },
  {
    content: "Pre-stretched hair extensions only.",
    isBold: false,
  },
  {
    content:
      "Any non-standard styling such as wavy parting or adding rubber bands at the end of twists will incur an additional $5 fee on top of the base price.",
    isBold: false,
  },
  {
    content:
      "IF ON THE DATE OF YOUR APPOINTMENT YOUR HAIR IS TANGLED, A DETANGLING FEE OF $10 WILL APPLY TO THE PRICE OF YOUR STYLE.",
    isBold: true,
  },
  {
    content:
      "If you decide to change your hairstyle either before or after I have started working on your hair, a fee of $5 will be added to the base price of the new style.",
    isBold: false,
  },
  {
    content: "Bus 11 & 4 run right outside the location of the appointment.",
    isBold: false,
  },
  {
    content:
      "ARRIVING LATE FOR A RESCHEDULED APPOINTMENT WILL LEAD TO AUTOMATIC CANCELLATION.",
    isBold: true,
  },
];

export default function Policy() {
  return (
    <div className="px-4 sm:px-6 md:px-[27px] py-6 sm:py-8 md:py-[40px] w-full min-h-screen bg-neutral-100/95 overflow-y-auto">
      <PageHeader
        title="Haus of Lewks Policies"
        subtitle="Please read carefully before booking your appointment."
      />

      <div className="flex flex-col gap-y-6 sm:gap-y-8 mt-6 sm:mt-8 max-w-3xl">
        <div>
          <h2 className="font-semibold text-lg sm:text-xl md:text-[20px] mb-3">Salon Policies</h2>
          <ul className="gap-y-3 sm:gap-y-4 flex flex-col">
            {policies.map((element, index) => (
              <li key={index}>
                <div className="font-semibold text-base sm:text-lg md:text-[18px]">
                  {element.title}
                </div>
                <div className="text-sm sm:text-base">{element.policy}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-lg sm:text-xl md:text-[20px] mt-4 sm:mt-6 mb-3">
            Things to Note
          </h2>
          <ul className="gap-y-3 sm:gap-y-4 flex flex-col">
            {notes.map((element, index) => (
              <li
                key={index}
                className={`list-disc list-inside text-sm sm:text-base ${
                  element.isBold ? "font-semibold" : ""
                }`}
              >
                {element.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
