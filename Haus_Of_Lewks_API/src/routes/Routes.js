import express from 'express';
import { Services } from '../services/Services.js';
import { BookingRoute } from './BookingRoutes.js';
import { ScheduleRoute } from './ScheduleRoutes.js';
import { UserRoutes } from './UserRoutes.js';
import { HairServicesRoute } from './HairServices.js';
import { MediaRoute } from './MediaRoutes.js';
import { BlogRoute } from './BlogRoutes.js';

export class APIRoutes {
  constructor() {
    try {
      const services = new Services().initServices();

      this.userRoutes = new UserRoutes(services.userService);
      this.scheduleRoutes = new ScheduleRoute(services.scheduleService);
      this.bookingRoutes = new BookingRoute(services.bookingService);
      this.hairServiceRoutes = new HairServicesRoute(services.hairServices);
      this.mediaRoute = new MediaRoute(services.mediaService);
      this.blogRoute = new BlogRoute(services.blogService);

      this.router = express.Router();
    } catch (error) {
      // Error already logged by route initialization
    }
  }

  async initAllRoutes(upload) {
    try {
      await this.userRoutes.initRoutes(this.router);
      await this.scheduleRoutes.initRoutes(this.router);
      await this.bookingRoutes.initRoutes(this.router);
      await this.hairServiceRoutes.initRoutes(this.router, upload);
      await this.mediaRoute.initRoutes(this.router, upload);
      await this.blogRoute.initRoutes(this.router);

      return this.router;
    } catch (error) {
      // Error already logged by route initialization
      return this.router;
    }
  }
}
