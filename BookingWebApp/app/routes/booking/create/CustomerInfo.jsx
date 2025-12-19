import React, { useContext, useRef, useState } from "react";
import PageHeader from "../../../Components/PageHeader";
import { AppContext } from "../../../../storage/AppProvider";
import { useNavigate } from "@remix-run/react";

import CalendarIcon from "../../../images/calendarIcon.png";
import useValidateBookingState from "../useValidateBookingState";

import { useFormik } from "formik";
import * as yup from "yup";
import CustomButton from "../../../Components/CustomButton";
import { ErrorFeedback, SuccessFeedback } from "../../../Components/UIFeedback";

const addOnPrice = (selectedAddons) => {
  let start = 0;
  selectedAddons?.forEach((addon) => {
    start += Number(addon?.price);
  });
  return start;
};

const RenderSumary = (props) => {
  const { bookingDetails, scheduleInfo } = props;

  const selectedService = bookingDetails?.service;
  const selectedAddons = bookingDetails?.service?.AddOns;

  const servicePrice = bookingDetails?.service?.price ?? 0;
  const totalPrice = servicePrice + addOnPrice(selectedAddons);
  const bookingStartTime = bookingDetails?.startTime;

  const formatDate = (obj) => {
    if (!bookingDetails) return;

    const dateStr = `${obj?.month} ${obj?.day}, ${obj?.year}`;
    const date = new Date(dateStr);
    const options = { weekday: "long", month: "short", day: "numeric" };

    return date.toLocaleDateString("en-US", options);
  };

  const bookingEndtime = () => {
    if (!bookingDetails || !bookingStartTime) return;

    let duration = Number(bookingDetails?.service?.duration) || 0;

    // Add addon durations
    selectedAddons?.forEach((addon) => {
      duration += Number(addon?.duration) || 0;
    });

    const start = Number(bookingStartTime.split(":")[0]); // hour only
    const end = (start + duration) % 24;

    let suffix = "pm";
    if (end === 0) {
      suffix = "am"; // midnight
    } else if (end < 12) {
      suffix = "am";
    }

    // Pad single digits like 3 → 03
    const formattedHour = end.toString().padStart(2, "0");

    return `${formattedHour}:00 ${suffix}`;
  };

  return (
    <div className="w-full max-w-sm bg-white/80 rounded-2xl shadow-sm border border-neutral-200/70 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <img
            src={CalendarIcon}
            alt="Calendar icon"
            className="w-10 h-10"
          />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-base text-neutral-900">
            Appointment Summary
          </h3>
          <p className="text-xs text-neutral-600">
            Review your date, time, and selected services.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-neutral-600">Date</span>
          <span className="font-medium">{formatDate(scheduleInfo)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Time</span>
          <span className="font-medium">
            {bookingStartTime} – {bookingEndtime()}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-neutral-200 my-2" />

      <div className="flex flex-col gap-2 text-sm">
        <div>
          <p className="font-semibold text-neutral-900 mb-1">Service</p>
          <p className="text-neutral-700">
            {selectedService?.isCustomService
              ? "Custom service selected"
              : `${selectedService?.title} - $${selectedService?.price}`}
          </p>
        </div>
        {selectedAddons?.length > 0 && (
          <div>
            <p className="font-semibold text-neutral-900 mb-1">
              Additional Services
            </p>
            <ul className="space-y-1">
              {selectedAddons?.map((addon, index) => (
                <li key={index} className="text-neutral-700 text-sm">
                  {addon?.title} - ${addon?.price}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 pt-2 mt-1 flex justify-between text-sm font-semibold">
        <span className="text-neutral-800">Total</span>
        <span className="text-neutral-900">${totalPrice}</span>
      </div>
    </div>
  );
};

export default function CustomerInfo() {
  const navigate = useNavigate();

  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  /********************************** App Context ********************************/
  const { selectedBookingService, setSelectedBookingService } =
    useContext(AppContext);
  const phoneRegex = /^(\+\d{1,2}\s?)?(\(?\d{3}\)?)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  /********************************{Form Data}********************************* */
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleBlur,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      AdditionalNotes: "",
      customServiceDetail: "",
    },
    validationSchema: yup.object({
      firstName: yup.string().required("First name is required"),
      lastName: yup.string().required("Last name is required"),
      AdditionalNotes: yup.string(),
      customServiceDetail: yup.string(),
      phone: yup
        .string()
        .matches(phoneRegex, "Invalid phone number")
        .required("Phone is requred"),
      email: yup
        .string()
        .email("Invalid email entered")
        .required("Email is required"),
    }),
    onSubmit: async (values, actions) => {
      await handleUpdateUserInformation(values);
      actions.resetForm();
    },
  });

  const handleUpdateUserInformation = async (values) => {
    setSelectedBookingService({
      ...selectedBookingService,
      firstName: values?.firstName,
      lastName: values?.lastName,
      phone: values?.phone,
      email: values?.email,
      AdditionalNotes: values?.AdditionalNotes ?? undefined,
      customServiceDetail: values?.customServiceDetail ?? undefined,
    });

    navigate("/booking/confirm");
  };

  console.log({ selectedBookingService });

  /********************************* {UseEffect Hooks} ***************************************/
  useValidateBookingState();

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <PageHeader
        title={"Book an appointment"}
        subtitle={"Share your details so we can confirm your spot"}
      />

      <form
        action="POST"
        className="flex flex-col gap-y-6 sm:gap-y-8 relative h-fit pb-6 sm:pb-10 w-full max-w-5xl mt-4 sm:mt-6"
      >
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 w-full justify-between">
          <div className="w-full lg:max-w-xl bg-white/80 rounded-2xl shadow-sm border border-neutral-200/70 p-4 sm:p-6">
            <div className="w-full">
              <label className="font-semibold text-sm" htmlFor="firstName">
                First name
              </label>
              <input
                name="firstName"
                type="text"
                value={values?.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2.5 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-1 focus:ring-2 focus:ring-primary-green"
                placeholder="First name"
              />
              {errors?.firstName && touched.firstName && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.firstName}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-sm" htmlFor="lastName">
                Last name
              </label>
              <input
                name="lastName"
                type="text"
                value={values?.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2.5 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-1 focus:ring-2 focus:ring-primary-green"
                placeholder="Last name"
              />
              {errors?.lastName && touched.lastName && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.lastName}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-sm" htmlFor="phone">
                Phone
              </label>
              <input
                name="phone"
                type="text"
                value={values?.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2.5 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-1 focus:ring-2 focus:ring-primary-green"
                placeholder="Phone"
              />
              {errors?.phone && touched.phone && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.phone}
                </div>
              )}
            </div>

            <div>
              <label className="font-semibold text-sm" htmlFor="email">
                Email
              </label>
              <input
                name="email"
                type="text"
                value={values?.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2.5 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-1 focus:ring-2 focus:ring-primary-green"
                placeholder="Email"
              />
              {errors?.email && touched.email && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          <RenderSumary
            bookingDetails={selectedBookingService}
            scheduleInfo={selectedBookingService?.scheduleInfo}
          />
        </div>

        <div className="w-full lg:max-w-xl bg-white/80 rounded-2xl shadow-sm border border-neutral-200/70 p-4 sm:p-6">
          {selectedBookingService?.isCustomService && (
            <div className="mb-4">
              <label
                className="font-semibold text-sm"
                htmlFor="customServiceDetail"
              >
                Custom service
              </label>
              <textarea
                className="relative resize-none outline-0 py-2.5 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-1 focus:ring-2 focus:ring-primary-green"
                name="customServiceDetail"
                value={values?.customServiceDetail}
                onChange={handleChange}
                placeholder={"Describe your custom service"}
                rows={4}
              />
            </div>
          )}

          <div>
            <label
              className="font-semibold text-sm"
              htmlFor="AdditionalNotes"
            >
              Additional notes
            </label>
            <textarea
              className="relative resize-none outline-0 py-2.5 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-1 focus:ring-2 focus:ring-primary-green"
              name="AdditionalNotes"
              value={values?.AdditionalNotes}
              onChange={handleChange}
              placeholder={"Share anything else we should know before your appointment"}
              rows={4}
            />
          </div>
        </div>

        <div className="flex flex-row w-full justify-center mt-4">
          <CustomButton
            label="Book appointment"
            className={"bg-primary-green w-full sm:w-[180px] rounded-lg text-sm sm:text-base"}
            isActive={!isSubmitting}
            onClick={handleSubmit}
          />
        </div>
      </form>

      <SuccessFeedback
        ref={successRef}
        message={feedbackMessage}
        // className={className}
      />
      <ErrorFeedback
        ref={errorRef}
        message={feedbackMessage}
        // className={className}
      />
    </div>
  );
}
