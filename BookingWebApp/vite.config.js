import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

const AppRoutes = (defineRoutes) =>
  defineRoutes((route) => {
    /**************** Admin Routes ********************/
    route("admin", "routes/admin/layout.jsx", () => {
      route("login", "routes/admin/login.jsx");
      route("dashboard", "routes/admin/dashboard.jsx");
      route("appointments", "routes/admin/appointments.jsx");
      route("schedule", "routes/admin/schedule.jsx");
      route("services", "routes/admin/services.jsx");
      route("income-statement", "routes/admin/incomeStatement.jsx");
      route("blog", "routes/admin/blog.jsx");
      route("media", "routes/admin/media.jsx");
    });

    /**************** Booking Routes ********************/
    route("booking", "routes/booking/layout.jsx", () => {
      route("create", "routes/booking/create/create.jsx");
      route("find", "routes/booking/find.jsx");
      route("select-service", "routes/booking/create/SelectService.jsx");
      route("select-add-ons", "routes/booking/create/AddOns.jsx");
      route("customer-info", "routes/booking/create/CustomerInfo.jsx");
      route("confirm", "routes/booking/create/Confirm.jsx");
      route("successful-booking", "routes/booking/create/Confirmed.jsx");
      route("unsuccessful-booking", "routes/booking/create/BookingFailed.jsx");
    });

    /**************** Blog Routes ********************/
    route("blog", "routes/blog.jsx");
    route("blog/:slug", "routes/blog.$slug.jsx");

    route("showroom", "routes/showroom.jsx");
  });

export default defineConfig({
  plugins: [
    remix({
      routes: AppRoutes,
    }),
    tailwindcss(),
  ],
  server: {
    // Handle static assets properly
    fs: {
      // Allow serving files from these directories
      allow: [".."],
    },
  },
  // Exclude source maps from being processed as routes
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Don't include source maps in the route matching
        sourcemapExcludeSources: true,
      },
    },
  },
});
