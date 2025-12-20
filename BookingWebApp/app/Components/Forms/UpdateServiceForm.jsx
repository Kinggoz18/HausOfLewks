import { useEffect, useState } from "react";
import Input from "../Input";
import CustomButton from "../CustomButton";

const UpdateServiceForm = (props) => {
  const {
    onUpdateClick,
    type,
    toggleFeedback,
    setFeedbackMessage,
    errorRef,
    successRef,
    serviceToUpdate,
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
    if ((/^\d*$/.test(value) || value === "") && value.length <= 4) {
      setDuration(value);
    }
  };

  /**
   * Handle posting the data
   */
  const handleUpdateClick = async () => {
    if (!title && !price && !category && !duration) return;
    const data = {
      id: serviceToUpdate?._id,
      title: title === "" ? undefined : title,
      price: price === "" ? undefined : price,
      category: category === null ? undefined : category,
      duration: duration === "" ? undefined : duration,
    };

    const response = await onUpdateClick(type, data);

    if (response?._id) {
      setPrice("");
      setCategory(null);
      setDuration("");
      setTitle("");

      setFeedbackMessage("Service Updated");
      toggleFeedback(successRef);
    }
  };

  useEffect(() => {
    setPrice("");
    setCategory(null);
    setDuration("");
    setTitle("");
  }, [serviceToUpdate]);

  return (
    <div className="h-full w-full flex flex-col gap-y-[17px]">
      <div className="relative flex flex-col w-full font-semibold">
        Update Service
      </div>

      {/***********************************************{Title}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"service-title"}
          label={"Service Title"}
          onChange={(e) => setTitle(e?.currentTarget?.value)}
          value={title}
          placeholder={serviceToUpdate?.title ?? "Service title"}
        />
      </div>
      {/***********************************************{Price}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"service-price"}
          label={"Service Price"}
          onChange={handleSetPrice}
          value={price}
          placeholder={serviceToUpdate?.price ?? "Service price, e.g: 100, 200"}
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
            serviceToUpdate?.duration ??
            "Service duration, e.g: 1 (for 1 hour), 2 (for 2 hours)"
          }
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

export { UpdateServiceForm };
