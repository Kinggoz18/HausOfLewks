import { BookingService } from './BookingService.js';
import { HairServices } from './HairServices.js';
import { MediaService } from './Media.js';
import { ScheduleService } from './ScheduleService.js';
import UserService from './UserService.js';
import { BlogService } from './BlogService.js';

export class Services {
  constructor() {}

  initServices = () => {
    const mediaService = new MediaService();
    const userService = new UserService();
    const scheduleService = new ScheduleService();
    const bookingService = new BookingService(userService, scheduleService);
    const hairServices = new HairServices();
    const blogService = new BlogService();

    return {
      mediaService,
      userService,
      scheduleService,
      bookingService,
      hairServices,
      blogService
    };
  };
}
