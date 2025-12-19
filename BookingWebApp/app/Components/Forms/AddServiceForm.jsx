import UploadImageIcon from "../../images/upload-image.svg";
import { useState } from "react";
import Input from "../Input";
import CustomButton from "../CustomButton";

const AddServiceForm = (props) => {
  const {
    onAddClick,
    type,
    toggleFeedback,
    setFeedbackMessage,
    errorRef,
    successRef,
    categories,
  } = props;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null);
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
    setCategory(null);
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
      category,
      duration,
    };

    if (!title || !price || !category || !duration) return;

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
        Add Service
      </div>

      {/***********************************************{Title}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"service-title"}
          label={"Service Title"}
          onChange={(e) => setTitle(e?.currentTarget?.value)}
          value={title}
          placeholder={"Service title"}
        />
      </div>
      {/***********************************************{Price}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"service-price"}
          label={"Service Price"}
          onChange={handleSetPrice}
          value={price}
          placeholder={"Service price, e.g: 100, 200"}
        />
      </div>

      {/***********************************************{Service category}***********************************************/}
      <div className="relative flex flex-col w-full">
        <label className="font-semibold" htmlFor={"service-category"}>
          Service Category
        </label>
        <select
          name="service-category"
          id="service-category"
          className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 mb-2"
        >
          <option value={null} onClick={() => setCategory(null)}>
            {"Select Category"}
          </option>
          {categories?.map((element, index) => (
            <option
              key={index}
              value={element?.title}
              onClick={() => setCategory(element?.title)}
            >
              {element?.title}
            </option>
          ))}
        </select>
      </div>

      {/***********************************************{Duration}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"category-duration"}
          label={"Service Duration"}
          onChange={handleSetDuration}
          value={duration}
          placeholder={
            "Service duration, e.g: 1 (for 1 hour), 2 (for 2 hours)"
          }
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

export { AddServiceForm };
