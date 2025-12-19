import UploadImageIcon from "../../images/upload-image.svg";
import { useEffect, useState } from "react";
import Input from "../Input";
import CustomButton from "../CustomButton";

const UpdateCategoryForm = (props) => {
  const {
    onUpdateClick,
    type,
    toggleFeedback,
    setFeedbackMessage,
    errorRef,
    successRef,
    serviceToUpdate,
  } = props;
  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [title, setTitle] = useState("");

  console.log({ serviceToUpdate });
  /**
   * Handler to set uploaded image
   * @param {*} e
   * @returns
   */
  const handleSetUploadImage = (e) => {
    const file = e.target.files[0];
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    if (fileSize > 150) {
      setFeedbackMessage("Image file is too large.");
      toggleFeedback(errorRef);
      setImage(null);
      setImageUrl(null);
      return;
    }

    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = function () {
      const blob = new Blob([fr.result]);
      console.log({ blob });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setImage(file);
    };
  };

  /**
   * Handle posting the data
   */
  const handleUpdateClick = async () => {
    if (!title && !image) return;

    const formData = new FormData();
    if (image) {
      formData.append("file", image);
    }

    if (title) formData.append("title", title);
    formData.append("id", serviceToUpdate?._id);

    const response = await onUpdateClick(type, formData);
    console.log({ response });
    if (response?._id) {
      setFeedbackMessage("Category Updated");
      toggleFeedback(successRef);
    }
  };

  useEffect(() => {
    setImage("");
    setImageUrl(null);
    setTitle("");
  }, [serviceToUpdate]);

  return (
    <div className="h-full w-full flex flex-col gap-y-[17px]">
      <div className="relative flex flex-col w-full font-semibold">Update Category</div>
      {/***********************************************{Title}***********************************************/}
      <div className="relative flex flex-col w-full">
        <Input
          inputName={"category-title"}
          label={"Category"}
          onChange={(e) => setTitle(e?.currentTarget?.value)}
          value={title}
          placeholder={serviceToUpdate?.title}
        />
      </div>
      {/***********************************************{Upload Image}***********************************************/}
      <div className="relative flex flex-col h-[250px] w-full gap-y-[17px] items-center">
        <div className="relative w-full text-left font-semibold text-[15px]">
          Update category cover image
        </div>
        <div className="relative flex flex-col h-[224px] rounded-[20px] bg-neutral-900/75 w-[80%] p-[20px] font-semibold text-[13px] gap-y-[20px] items-center justify-center">
          <div className="relative flex flex-col h-[120px] w-[90%] items-center gap-y-[5px]">
            <img
              src={imageUrl || serviceToUpdate?.coverLink || UploadImageIcon}
              alt="upload music file icon"
              className="h-[70px] w-[70px] opacity-90"
            />
            <div className="w-full text-center font-semibold text-[15px]">
              Update cover image
            </div>
            <div className="w-full text-center text-neutral-300 text-[12px]">
              For the best experience upload only JPEG images
            </div>
            <input
              type="file"
              className="absolute w-full h-full opacity-0"
              accept="image/*"
              onChange={(e) => handleSetUploadImage(e)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row w-full justify-center">
        <CustomButton
          label="Update Category"
          onClick={handleUpdateClick}
          className={"bg-primary-green w-[166.86px] rounded-lg mt-[20px]"}
          isActive={true}
        />
      </div>
    </div>
  );
};

export { UpdateCategoryForm };
