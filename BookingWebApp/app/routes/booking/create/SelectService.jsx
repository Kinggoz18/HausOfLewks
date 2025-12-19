import { useContext, useCallback, useState, useEffect } from "react";
import PageHeader from "../../../Components/PageHeader";
import { useNavigate } from "@remix-run/react";
import { AppContext } from "../../../../storage/AppProvider";

import DownArrow from "../../../images/downArrow.svg";
import UnSelectedCheck from "../../../images/checkCircle.svg";
import SelectedCheck from "../../../images/CircleChecked.svg";
import CustomButton from "../../../Components/CustomButton";
import useValidateBookingState from "../useValidateBookingState";
import HairServiceAPI from "../../../../storage/APIs/hairService";

const RenderAvailableServices = (props) => {
  const { selectedService, setSelectedService, services } = props;
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (category) => {
    if (activeDropdown === category) setActiveDropdown(null);
    else setActiveDropdown(category);
  };

  const handleSetSelectedService = (service) => {
    setSelectedService({
      ...selectedService,
      service: {
        hairServiceId: service?._id,
        title: service?.title,
        price: service?.price,
        category: service?.category,
        duration: service?.duration,
      },
    });
  };

  const isSelected = useCallback(
    (service) => {
      const isSelected = selectedService?.service?.title === service?.title;

      return isSelected;
    },
    [selectedService]
  );

  return (
    services && (
      <div className="w-full max-w-5xl mx-auto mt-8 flex flex-col gap-6">
        {Object.entries(services)?.map(
          ([categoryName, categoryData], index) => {
            const isOpen = activeDropdown === categoryName;

            return (
              <div
                key={index}
                className="w-full bg-white/80 rounded-2xl shadow-sm border border-neutral-200/70 overflow-hidden transition hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleDropdown(categoryName);
                  }}
                  className="w-full flex flex-row items-stretch text-left"
                >
                  {categoryData?.coverLink && (
                    <div className="hidden sm:block w-40 flex-shrink-0">
                      <img
                        src={categoryData?.coverLink}
                        alt={`${categoryName} image`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                          {categoryName}
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
                          {categoryData?.services?.length || 0} styles available
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700">
                          Tap to view styles
                        </span>
                        <img
                          src={DownArrow}
                          alt="Toggle styles"
                          className={`w-5 h-5 transition-transform ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-neutral-200 bg-neutral-50/80">
                    <div className="px-4 sm:px-6 py-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
                      {categoryData?.services?.map((service, serviceIndex) => {
                        const selected = isSelected(service);

                        return (
                          <button
                            type="button"
                            key={serviceIndex}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSetSelectedService(service);
                            }}
                            className={`w-full flex items-center gap-4 rounded-xl px-3 sm:px-4 py-3 text-left border transition ${
                              selected
                                ? "border-primary-green bg-emerald-50/70"
                                : "border-transparent hover:border-neutral-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex-1">
                              <p className="text-sm sm:text-base font-medium text-neutral-900">
                                {service?.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                                {service?.duration && (
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-100">
                                    {service.duration} mins
                                  </span>
                                )}
                                {service?.category && (
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-100">
                                    {service.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm sm:text-base font-semibold text-neutral-900">
                                ${service?.price}
                              </p>
                              <img
                                src={selected ? SelectedCheck : UnSelectedCheck}
                                alt={selected ? "Selected" : "Not selected"}
                                className="w-5 h-5"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    )
  );
};

export default function SelectService() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  const servicesAPI = new HairServiceAPI();
  /********************************** App Context ********************************/
  const { selectedBookingService, setSelectedBookingService } =
    useContext(AppContext);

  const onNextClick = () => {
    if (selectedBookingService?.service?.title) {
      navigate("/booking/select-add-ons");
    }
  };

  const getServices = async () => {
    try {
      const data = {
        scheduleId: selectedBookingService?.scheduleId,
        startTime: selectedBookingService?.startTime,
      };

      const categories = await servicesAPI.getCategories();
      const services = await servicesAPI.getAvailableHairServicesForSchedule(
        data
      );

      // Quick lookup for categories
      const categoryMap = categories.reduce((acc, category) => {
        acc[category.title] = category;
        return acc;
      }, {});

      // Enrich each service group with category data
      const result = {};

      (services ? Object.keys(services) : []).forEach((categoryName) => {
        const category = categoryMap[categoryName];
        if (category) {
          result[categoryName] = {
            ...category, // { title, coverLink, etc. }
            services: services[categoryName], // already grouped services
          };
        }
      });

      console.log({ result, services });
      setServices(result);
    } catch (error) {
      console.error("Failed to fetch services", error);
      return {
        categories: [],
        services: [],
        addOns: [],
      };
    }
  };

  /********************************* {UseEffect Hooks} ***************************************/
  useValidateBookingState();

  useEffect(() => {
    getServices();
  }, []);

  return (
    <div className="mt-4 min-h-[calc(100vh_-_200px)] w-full px-4 sm:px-6 md:px-0">
      <PageHeader
        title={"Book an appointment"}
        subtitle={
          selectedBookingService?.service?.title
            ? `You selected ${selectedBookingService?.service?.title}`
            : "Select your desired style"
        }
      />

      <RenderAvailableServices
        selectedService={selectedBookingService}
        setSelectedService={setSelectedBookingService}
        services={services}
      />

      <div className="flex flex-row w-full justify-center mt-6 sm:mt-8 mb-4">
        <CustomButton
          label="Next"
          onClick={onNextClick}
          className={"bg-primary-green w-full sm:w-[180px] rounded-lg text-sm sm:text-base"}
          isActive={true}
        />
      </div>
    </div>
  );
}
