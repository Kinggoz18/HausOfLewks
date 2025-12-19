import UploadImageIcon from "../../images/upload-image.svg";
import { useState } from "react";
import Input from "../Input";
import CustomButton from "../CustomButton";

const AddAddonForm = (props) => {
  const {
    onAddClick,
    type,
    toggleFeedback,
    setFeedbackMessage,
    errorRef,
    successRef,
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
    if ((/^\d*$/.test(value) || value === "") && value.length <= 2) {
      setDuration(value);
    }
  };

  const resetForm = () => {
    setPrice("");
    setService(null);
    setDuration("");
    setTitle("");
  };

  /**
   * Handle posting the data
   */
  const handleAddClick = async () => {
    const data = {
      title,
      price,
      service,
      duration,
    };

    if (!title || !price || !duration) return;

    const response = await onAddClick(type, data);
    resetForm();
    if (response?._id) {
      setFeedbackMessage("Service Added");
      toggleFeedback(successRef);
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-y-[17px]">
      <div className="relative flex flex-col w-full font-semibold">
        Add a sub-service/Addon
      </div>

      {/***********************************************{Title}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"addon-title"}
          label={"Addon Title"}
          onChange={(e) => setTitle(e?.currentTarget?.value)}
          value={title}
          placeholder={"Addon title"}
        />
      </div>
      {/***********************************************{Price}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"addon-price"}
          label={"Addon Price"}
          onChange={handleSetPrice}
          value={price}
          placeholder={"Addon price, e.g: 100, 200"}
        />
      </div>

      {/***********************************************{Addon category}***********************************************/}
      <div className="relative flex flex-col w-full">
        <label className="font-semibold" htmlFor={"addon-service"}>
          Addon parent service (Required if it's a sub-service)
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
          placeholder={"Addon duration, e.g: 1 (for 1 hour), 2 (for 2 hours)"}
        />
      </div>

      <div className="flex flex-row w-full justify-center">
        <CustomButton
          label="Add Service"
          onClick={handleAddClick}
          className={"bg-primary-green w-[166.86px] rounded-lg mt-[20px]"}
          isActive={true}
        />
      </div>
    </div>
  );
};

export { AddAddonForm };
