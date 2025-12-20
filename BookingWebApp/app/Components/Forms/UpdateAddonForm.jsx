import { useEffect, useState } from "react";
import Input from "../Input";
import CustomButton from "../CustomButton";

const UpdateAddonForm = (props) => {
  const {
    onUpdateClick,
    type,
    toggleFeedback,
    setFeedbackMessage,
    errorRef,
    successRef,
    serviceToUpdate,
    services,
  } = props;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [service, setService] = useState(null);
  const [duration, setDuration] = useState("");

  const handleSetPrice = (event) => {
    const value = event.target.value;

    // Only allow digits and check max length
    if ((/^\d*$/.test(value) || value === "") && value.length <= 4) {
      setPrice(value);
    }
  };

  const handleSetDuration = (event) => {
    const value = event.target.value;

    // Only allow digits and check max length
    if ((/^\d*$/.test(value) || value === "") && value.length <= 4) {
      setDuration(value);
    }
  };

  /**
   * Handle posting the data
   */
  const handleUpdateClick = async () => {
    if (!title && !price && !service && !duration) return;
    const data = {
      id: serviceToUpdate?._id,
      title: title === "" ? undefined : title,
      price: price === "" ? undefined : price,
      service: service === null ? undefined : service,
      duration: duration === "" ? undefined : duration,
    };

    const response = await onUpdateClick(type, data);

    if (response?._id) {
      setPrice("");
      setService(null);
      setDuration("");
      setTitle("");

      setFeedbackMessage("Service Updated");
      toggleFeedback(successRef);
    }
  };

  useEffect(() => {
    setPrice("");
    setService(null);
    setDuration("");
    setTitle("");
  }, [serviceToUpdate]);

  return (
    <div className="h-full w-full flex flex-col gap-y-[17px]">
      <div className="relative flex flex-col w-full font-semibold">
        Update Addon/Sub-service
      </div>

      {/***********************************************{Title}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"addon-title"}
          label={"Addon Title"}
          onChange={(e) => setTitle(e?.currentTarget?.value)}
          value={title}
          placeholder={serviceToUpdate?.title}
        />
      </div>
      {/***********************************************{Price}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"addon-price"}
          label={"Addon Price"}
          onChange={handleSetPrice}
          value={price}
          placeholder={serviceToUpdate?.price}
        />
      </div>

      {/***********************************************{Addon category}***********************************************/}
      <div className="relative flex flex-col w-full">
        <label className="font-semibold" htmlFor={"addon-service"}>
          Addon parent service
        </label>
        <select
          name="addon-service"
          id="addon-service"
          className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-2"
        >
          <option value={null} onClick={() => setService(null)}>
            {"select parent service"}
          </option>
          {services?.map((element, index) => (
            <option
              key={index}
              value={element?.title}
              onClick={() => setService(element?.title)}
            >
              {element?.title}
            </option>
          ))}
        </select>
      </div>

      {/***********************************************{Duration}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"addon-duration"}
          label={"Addon Duration"}
          onChange={handleSetDuration}
          value={duration}
          placeholder={serviceToUpdate?.duration}
        />
      </div>

      <div className="flex flex-row w-full justify-center">
        <CustomButton
          label="Update Service"
          onClick={handleUpdateClick}
          className={"bg-primary-green w-[166.86px] rounded-lg mt-[20px]"}
          isActive={true}
        />
      </div>
    </div>
  );
};

export { UpdateAddonForm };
