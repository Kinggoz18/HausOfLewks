import React, { useEffect, useRef, useState } from "react";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../Components/UIFeedback";
import AddIcon from "../../images/AddIcon.svg";
import HairServiceAPI from "../../../storage/APIs/hairService";
import { AddCategoryForm } from "../../Components/Forms/AddCategoryForm";
import { UpdateCategoryForm } from "../../Components/Forms/UpdateCategoryForm";
import { AddServiceForm } from "../../Components/Forms/AddServiceForm";
import { UpdateServiceForm } from "../../Components/Forms/UpdateServiceForm";
import { AddAddonForm } from "../../Components/Forms/AddAddonForm";
import { UpdateAddonForm } from "../../Components/Forms/UpdateAddonForm";
import CustomButton from "../../Components/CustomButton";
import Pagination from "../../Components/Pagination";

const ServiceList = (props) => {
  const { list, onRemoveClick, onUpdateClick, type } = props;

  if (!list || list.length === 0) {
    return (
      <div className="text-center py-4 text-neutral-600 text-sm">
        No items yet. Add one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {list
        ?.filter((element) => element?.title) // only keep elements with title
        .map((element, index) => (
          <div
            key={index}
            className="flex flex-row w-full p-3 bg-white rounded-lg border border-neutral-200 justify-between items-center hover:bg-neutral-50"
          >
            <span className="text-ellipsis font-medium">{element?.title}</span>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateClick?.(element);
                }}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg text-neutral-100 px-2 sm:px-3 py-1 text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Update
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveClick?.(type, element?._id);
                }}
                className="bg-red-600 hover:bg-red-700 rounded-lg text-neutral-100 px-2 sm:px-3 py-1 text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

const FormHandler = (props) => {
  const {
    toggleFeedback,
    setFeedbackMessage,
    errorRef,
    successRef,
    mode,
    onUpdateClick,
    onAddClick,
    serviceToUpdate,
    categories,
    services,
  } = props;

  if (mode.includes("Create")) {
    if (mode.includes("Category")) {
      return (
        <AddCategoryForm
          onAddClick={onAddClick}
          type="category"
          toggleFeedback={toggleFeedback}
          setFeedbackMessage={setFeedbackMessage}
          errorRef={errorRef}
          successRef={successRef}
        />
      );
    } else if (mode.includes("Service")) {
      return (
        <AddServiceForm
          onAddClick={onAddClick}
          type="service"
          toggleFeedback={toggleFeedback}
          setFeedbackMessage={setFeedbackMessage}
          errorRef={errorRef}
          successRef={successRef}
          categories={categories}
        />
      );
    } else if (mode.includes("Addon")) {
      return (
        <AddAddonForm
          onAddClick={onAddClick}
          type="addon"
          toggleFeedback={toggleFeedback}
          setFeedbackMessage={setFeedbackMessage}
          errorRef={errorRef}
          successRef={successRef}
          services={services}
        />
      );
    }
  } else if (mode.includes("Update")) {
    if (mode.includes("Category")) {
      return (
        <UpdateCategoryForm
          onUpdateClick={onUpdateClick}
          type="category"
          toggleFeedback={toggleFeedback}
          setFeedbackMessage={setFeedbackMessage}
          errorRef={errorRef}
          successRef={successRef}
          serviceToUpdate={serviceToUpdate}
        />
      );
    } else if (mode.includes("Service")) {
      return (
        <UpdateServiceForm
          onUpdateClick={onUpdateClick}
          type="service"
          toggleFeedback={toggleFeedback}
          setFeedbackMessage={setFeedbackMessage}
          errorRef={errorRef}
          successRef={successRef}
          categories={categories}
          serviceToUpdate={serviceToUpdate}
        />
      );
    } else if (mode.includes("Addon")) {
      return (
        <UpdateAddonForm
          onUpdateClick={onUpdateClick}
          type="addon"
          toggleFeedback={toggleFeedback}
          setFeedbackMessage={setFeedbackMessage}
          errorRef={errorRef}
          successRef={successRef}
          services={services}
          serviceToUpdate={serviceToUpdate}
        />
      );
    }
  } else {
    return (
      <div className="text-base sm:text-lg md:text-[20px] text-red-600 font-semibold">Invalid mode</div>
    );
  }
};

export default function Services() {
  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [categories, setCategories] = useState(null);
  const [services, setServices] = useState(null);
  const [addOns, setAddOns] = useState(null);
  const [mode, setMode] = useState(null);
  const [serviceToUpdate, setServiceToUpdate] = useState(null);
  const [servicesPage, setServicesPage] = useState(1);
  const [addonsPage, setAddonsPage] = useState(1);
  const pageSize = 15;

  const servicesAPI = new HairServiceAPI();

  /************************************************************************************************************************/
  /*******************************************************{ Methods }******************************************************/
  /************************************************************************************************************************/
  const getServices = async () => {
    try {
      const categories = await servicesAPI.getCategories();
      const addons = await servicesAPI.getAddons();
      const services = await servicesAPI.getServicesByCategory();

      const grouped = services ?? {};

      // Normalize into a consistent structure
      const normalizedCategories = Object.keys(grouped).map((categoryName) => {
        const servicesInCategory = grouped[categoryName] || [];

        return {
          name: categoryName ?? null,
          services: servicesInCategory.map((service) => ({
            _id: service._id ?? null,
            title: service.title ?? null,
            price: service.price ?? null,
            duration: service.duration ?? null,
            category: service.category ?? categoryName ?? null,
          })),
        };
      });

      // Flat list of all services
      const allServicesFlat = normalizedCategories.flatMap(
        (category) => category.services
      );

      // Flat list of all addOns
      const allAddOnsFlat = allServicesFlat.flatMap(
        (service) => service.addOns
      );

      // Update state
      setCategories(categories);
      setServices(allServicesFlat);
      setAddOns(addons);

      console.log({
        services: allServicesFlat,
      });

      return {
        categories: categories,
        services: allServicesFlat,
        addOns: addons,
      };
    } catch (error) {
      console.error("Failed to fetch services", error);
      return {
        categories: [],
        services: [],
        addOns: [],
      };
    }
  };

  /**
   * Handle updating a service
   * @param {*} type
   * @param {*} serviceId
   */
  const onAddClick = async (type, data) => {
    try {
      let response;
      if (type === "addon") {
        response = await servicesAPI.addAddon(data);
      } else if (type === "category") {
        response = await servicesAPI.addCategory(data);
      } else if (type === "service") {
        response = await servicesAPI.addHairService(data);
      }

      if (response?._id) {
        await getServices();
      }

      return response;
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  /**
   * Handle updating a service
   * @param {*} type
   * @param {*} serviceId
   */
  const onUpdateClick = async (type, data) => {
    try {
      let response = null;
      if (type === "addon") {
        response = await servicesAPI.updateAddon(data);
      } else if (type === "category") {
        response = await servicesAPI.updateCategory(data);
      } else if (type === "service") {
        response = await servicesAPI.updateHairService(data);
      }

      if (response?._id) {
        await getServices();
      }

      return response;
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  /**
   * Handle removing a service
   * @param {*} type
   * @param {*} serviceId
   */
  const onRemoveClick = async (type, serviceId) => {
    try {
      let response = null;

      if (type === "addon") {
        response = await servicesAPI.removeAddon(serviceId);
      } else if (type === "category") {
        response = await servicesAPI.removeCategory(serviceId);
      } else if (type === "service") {
        response = await servicesAPI.removeHairService(serviceId);
      }

      if (response === "deleted") {
        await getServices();
      }
    } catch (error) {
      setFeedbackMessage(error?.message);
      toggleFeedback(errorRef);
    }
  };

  /**
   * Toggle form mode between add and update service
   * @param {*} mode
   */
  const toggleMode = (mode, data) => {
    setMode(mode);
    if (data) setServiceToUpdate(data);
  };

  /************************************************************************************************************************/
  /****************************************************{ UseEffects }******************************************************/
  /************************************************************************************************************************/
  useEffect(() => {
    getServices();
  }, []);

  // Reset pagination when data changes
  useEffect(() => {
    setServicesPage(1);
    setAddonsPage(1);
  }, [services, addOns]);

  const totalServices = services?.length ?? 0;
  const totalAddOns = addOns?.length ?? 0;

  const servicesStartIndex = (servicesPage - 1) * pageSize;
  const addonsStartIndex = (addonsPage - 1) * pageSize;

  const paginatedServices =
    services && services.length > 0
      ? services.slice(servicesStartIndex, servicesStartIndex + pageSize)
      : [];

  const paginatedAddOns =
    addOns && addOns.length > 0
      ? addOns.slice(addonsStartIndex, addonsStartIndex + pageSize)
      : [];

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-4 sm:gap-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold mb-2">Services Management</h1>
        <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
          Manage service categories, services, and add-ons for your booking system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4 sm:space-y-6">
          {/*****************************************{Category}*******************************************/}
          <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Categories</h2>
              <CustomButton
                label="Add Category"
                onClick={() => toggleMode("Create Category")}
                isActive={true}
                className="bg-primary-green w-full sm:w-[140px] rounded-lg flex items-center justify-center gap-2"
              >
                <img src={AddIcon} alt="Add" className="h-3 w-3 sm:h-4 sm:w-4" />
              </CustomButton>
            </div>
            <div className="bg-neutral-50 rounded-lg p-2">
              <ServiceList
                list={categories}
                onRemoveClick={onRemoveClick}
                onUpdateClick={(data) => toggleMode("Update Category", data)}
                type="category"
              />
            </div>
          </div>

          {/*****************************************{Services}*******************************************/}
          <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Services</h2>
              <CustomButton
                label="Add Service"
                onClick={() => toggleMode("Create Service")}
                isActive={true}
                className="bg-primary-green w-full sm:w-[140px] rounded-lg flex items-center justify-center gap-2"
              >
                <img src={AddIcon} alt="Add" className="h-3 w-3 sm:h-4 sm:w-4" />
              </CustomButton>
            </div>
            <div className="bg-neutral-50 rounded-lg p-2 max-h-[400px] overflow-y-auto">
              <ServiceList
                list={paginatedServices}
                onRemoveClick={onRemoveClick}
                onUpdateClick={(data) => toggleMode("Update Service", data)}
                type="service"
              />
            </div>
            <Pagination
              currentPage={servicesPage}
              pageSize={pageSize}
              totalItems={totalServices}
              onPageChange={setServicesPage}
            />
          </div>

          {/*****************************************{Add-ons}*******************************************/}
          <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
              <h2 className="text-base sm:text-lg font-semibold">Add-ons</h2>
              <CustomButton
                label="Add Add-on"
                onClick={() => toggleMode("Create Addon")}
                isActive={true}
                className="bg-primary-green w-full sm:w-[140px] rounded-lg flex items-center justify-center gap-2"
              >
                <img src={AddIcon} alt="Add" className="h-3 w-3 sm:h-4 sm:w-4" />
              </CustomButton>
            </div>
            <div className="bg-neutral-50 rounded-lg p-2 max-h-[400px] overflow-y-auto">
              <ServiceList
                list={paginatedAddOns}
                onRemoveClick={onRemoveClick}
                onUpdateClick={(data) => toggleMode("Update Addon", data)}
                type="addon"
              />
            </div>
            <Pagination
              currentPage={addonsPage}
              pageSize={pageSize}
              totalItems={totalAddOns}
              onPageChange={setAddonsPage}
            />
          </div>
        </div>

        {mode && (
          <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
            <FormHandler
              toggleFeedback={toggleFeedback}
              setFeedbackMessage={setFeedbackMessage}
              errorRef={errorRef}
              successRef={successRef}
              mode={mode}
              onUpdateClick={onUpdateClick}
              onAddClick={onAddClick}
              serviceToUpdate={serviceToUpdate}
              categories={categories}
              services={services}
            />
          </div>
        )}
      </div>

      <SuccessFeedback
        ref={successRef}
        message={feedbackMessage}
      />
      <ErrorFeedback
        ref={errorRef}
        message={feedbackMessage}
      />
    </div>
  );
}
