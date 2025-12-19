import React, { useEffect, useRef, useState } from "react";
import PageHeader from "../../../Components/PageHeader";
import { AppContext } from "../../../../storage/AppProvider";
import { useContext, useCallback } from "react";

import UnSelectedCheck from "../../../images/checkCircle.svg";
import SelectedCheck from "../../../images/CircleChecked.svg";
import { useNavigate } from "@remix-run/react";
import CustomButton from "../../../Components/CustomButton";
import useValidateBookingState from "../useValidateBookingState";
import HairServiceAPI from "../../../../storage/APIs/hairService";
import { ErrorFeedback, SuccessFeedback, toggleFeedback } from "../../../Components/UIFeedback";

const RenderAddOns = (props) => {
  const { setSelectedService, selectedService, addOns } = props;

  /**
   * Handle remove or add an add on
   * @param {*} addOn
   */
  const handleSetAddOns = (addOn) => {
    const isAdded = isSelected(addOn);
    console.log({ isAdded });
    if (isAdded) {
      setSelectedService((prev) => ({
        ...prev,
        service: {
          ...prev?.service,
          AddOns: prev?.service?.AddOns?.filter(
            (item) => item._id !== addOn._id // remove by unique property
          ),
        },
      }));
    } else {
      setSelectedService((prev) => ({
        ...prev,
        service: {
          ...prev?.service,
          AddOns: [...(prev?.service?.AddOns || []), addOn],
        },
      }));
    }
  };

  /**
   * Check whether an add on has been selected
   */
  const isSelected = useCallback(
    (addOn) => {
      let isFound = false;

      selectedService?.service?.AddOns?.forEach((element) => {
        if (element?.title === addOn?.title) {
          isFound = true;
          return isFound;
        }
      });

      return isFound;
    },
    [selectedService]
  );

  return (
    <div className="mt-6 w-full max-w-3xl mx-auto">
      {addOns?.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <h2 className="font-semibold text-lg text-neutral-900">
              Add-ons for your {selectedService?.title ?? "style"}
            </h2>
            <p className="text-xs text-neutral-500">
              Optional extras to customize your appointment.
            </p>
          </div>

          <div className="space-y-3">
            {addOns?.map((addon, index) => {
              const selected = isSelected(addon);

              return (
                <button
                  type="button"
                  onClick={() => handleSetAddOns(addon)}
                  key={index}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 border text-left transition ${
                    selected
                      ? "border-primary-green bg-emerald-50/70"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral-900">
                      {addon?.title}
                    </span>
                    {addon?.duration && (
                      <span className="text-xs text-neutral-600 mt-1">
                        {addon.duration} mins
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-neutral-900">
                      ${addon?.price}
                    </span>
                    <img
                      src={selected ? SelectedCheck : UnSelectedCheck}
                      alt={selected ? "Selected add-on" : "Not selected"}
                      className="w-5 h-5"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-600 text-sm">
          No add-ons available for this service.
        </div>
      )}
    </div>
  );
};

export default function AddOns() {
  const navigate = useNavigate();
  const servicesAPI = new HairServiceAPI();

  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  /********************************** App Context ********************************/
  const { selectedBookingService, setSelectedBookingService } =
    useContext(AppContext);

  const onNextClick = () => {
    navigate("/booking/customer-info");
  };

  const getAddons = async () => {
    try {
      const response = await servicesAPI.getAddons();
      const filtered = await response?.filter((addon) => {
        if (
          !addon?.service ||
          addon?.service === selectedBookingService?.service?.title
        )
          return addon;
      });
      console.log({ response, filtered });
      setSelectedAddons(filtered);
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  /********************************* {UseEffect Hooks} ***************************************/
  useValidateBookingState();

  useEffect(() => {
    getAddons();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <PageHeader
        title={"Book an appointment"}
        subtitle={
          selectedBookingService?.service?.title
            ? `Additional services for ${selectedBookingService?.service?.title}`
            : "Select any add-ons that apply to your appointment."
        }
      />

      <RenderAddOns
        setSelectedService={setSelectedBookingService}
        selectedService={selectedBookingService}
        addOns={selectedAddons}
      />

      <div className="flex flex-row w-full justify-center mt-6 sm:mt-8">
        <CustomButton
          label="Next"
          onClick={onNextClick}
          className={"bg-primary-green w-full sm:w-[180px] rounded-lg text-sm sm:text-base"}
          isActive={true}
        />
      </div>

      <SuccessFeedback ref={successRef} message={feedbackMessage} />
      <ErrorFeedback ref={errorRef} message={feedbackMessage} />
    </div>
  );
}
