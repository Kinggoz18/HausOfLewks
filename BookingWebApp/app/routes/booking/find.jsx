import PageHeader from "../../Components/PageHeader";
import { useFormik } from "formik";
import * as yup from "yup";
import CustomButton from "../../Components/CustomButton";
import { useState } from "react";
import BookingAPI from "../../../storage/APIs/bookings";
import Pagination from "../../Components/Pagination";

export const meta = () => {
  const title = "Find Your Booking | Haus of Lewks";
  const description =
    "Look up your existing Haus of Lewks appointments by name and contact details.";

  return [
    { title },
    { name: "description", content: description },
  ];
};

export const links = () => [
  {
    rel: "canonical",
    href: "https://hausoflewks.com/booking/find",
  },
];

const RenderBookings = (props) => {
  const { bookings } = props;

  const generateStatusClass = (status) => {
    if (status === "Upcoming") {
      return "bg-blue-100 text-blue-800";
    } else if (status === "Completed") {
      return "bg-green-100 text-green-800";
    } else if (status === "Missed") {
      return "bg-red-100 text-red-800";
    } else if (status === "Cancelled") {
      return "bg-orange-100 text-orange-800";
    }
    return "bg-neutral-100 text-neutral-800";
  };

  return (
    <div className="w-full max-w-3xl space-y-4">
      {bookings?.map((element, index) => (
        <div
          key={index}
          className="bg-white/80 rounded-xl p-4 shadow-sm border border-neutral-200"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{element?.service?.title}</h3>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${generateStatusClass(
                element?.status
              )}`}
            >
              {element?.status}
            </span>
          </div>
          {element?.service?.category && (
            <p className="text-sm text-neutral-600 mb-2">
              Category: {element.service.category}
            </p>
          )}
          {element?.startTime && (
            <p className="text-sm text-neutral-600 mb-2">
              Time: {element.startTime}
            </p>
          )}
          {element?.total && element.total > 0 && (
            <p className="text-sm font-medium">
              Total: ${element.total.toFixed(2)}
            </p>
          )}
          {element?.createdAt && (
            <p className="text-xs text-neutral-500 mt-2">
              Booked: {new Date(element.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default function BookingFind() {
  const bookingAPIs = new BookingAPI();
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

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
    onSubmit: async (values) => {
      setSearchError(null);
      setIsSearching(true);
      try {
        const payload = {
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          phone: values.phone || undefined,
          email: values.email || undefined,
        };
        const bookings = await bookingAPIs.getAllBookings({
          ...payload,
          page: currentPage,
          pageSize,
        });

        setResults(bookings?.items ?? []);
        setTotalResults(bookings?.total ?? (bookings?.items?.length ?? 0));
      } catch (error) {
        setSearchError(error?.message ?? "Failed to search for bookings.");
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
  });

  const handlePageChange = async (page) => {
    setCurrentPage(page);

    try {
      setIsSearching(true);
      const payload = {
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
      };

      const bookings = await bookingAPIs.getAllBookings({
        ...payload,
        page,
        pageSize,
      });

      setResults(bookings?.items ?? []);
      setTotalResults(bookings?.total ?? (bookings?.items?.length ?? 0));
    } catch (error) {
      setSearchError(error?.message ?? "Failed to search for bookings.");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <PageHeader title={"Find Your Booking"} subtitle={"Enter your details to view your booking history"} />

      <div className="w-full max-w-2xl mt-6 sm:mt-8">
        <form
          action="POST"
          onSubmit={handleSubmit}
          className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-4"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="font-semibold text-sm">First name</label>
              <input
                name="firstName"
                type="text"
                value={values?.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 focus:ring-2 focus:ring-primary-green"
                placeholder="First name"
              />
              {errors?.firstName && touched.firstName && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.firstName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="font-semibold text-sm">Last name</label>
              <input
                name="lastName"
                type="text"
                value={values?.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 focus:ring-2 focus:ring-primary-green"
                placeholder="Last name"
              />
              {errors?.lastName && touched.lastName && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.lastName}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="font-semibold text-sm">Phone</label>
              <input
                name="phone"
                type="text"
                value={values?.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 focus:ring-2 focus:ring-primary-green"
                placeholder="Phone"
              />
              {errors?.phone && touched.phone && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.phone}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="font-semibold text-sm">Email</label>
              <input
                name="email"
                type="email"
                value={values?.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="outline-0 py-2 px-4 w-full bg-neutral-100 rounded-lg mt-2 focus:ring-2 focus:ring-primary-green"
                placeholder="Email"
              />
              {errors?.email && touched.email && (
                <div className="text-red-600 text-sm mt-1">
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-row w-full justify-center pt-4">
            <CustomButton
              label={isSearching ? "Searching..." : "Find Bookings"}
              className="bg-primary-green w-full sm:w-[180px] rounded-lg text-sm sm:text-base"
              isActive={!isSubmitting && !isSearching}
              onClick={handleSubmit}
            />
          </div>
        </form>

        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 text-red-700">
            {searchError}
          </div>
        )}

        {isSearching && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-blue-700 text-center">
            Searching for your bookings...
          </div>
        )}

        {results.length > 0 && !isSearching && (
          <div className="mt-6 sm:mt-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
              Your Booking History
            </h2>
            <RenderBookings bookings={results} />
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={totalResults}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {results.length === 0 && !isSearching && !searchError && Object.keys(touched).length > 0 && (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mt-4 text-center text-neutral-600">
            No bookings found. Please check your information and try again.
          </div>
        )}
      </div>
    </div>
  );
}
