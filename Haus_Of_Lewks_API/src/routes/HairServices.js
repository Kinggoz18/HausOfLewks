import { HairServices } from '../services/HairServices.js';
import rateLimit from 'express-rate-limit';
import logger from '../util/logger.js';

export class HairServicesRoute {
  bookingRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  basePath = '/hair-service';

  constructor(hairService) {
    this.hairService = hairService;
  }

  async initRoutes(router, upload) {
    try {
      router.post(`${this.basePath}/service`, this.bookingRateLimit, this.hairService.addHairService);
      router.post(
        `${this.basePath}/category`,
        this.bookingRateLimit,
        upload.single('file'),
        this.hairService.addCategory
      );
      router.post(`${this.basePath}/add-on`, this.bookingRateLimit, this.hairService.addAddOn);

      router.post(
        `${this.basePath}/service/:id`,
        this.bookingRateLimit,
        this.hairService.removeHairService
      );
      router.post(
        `${this.basePath}/category/:id`,
        this.bookingRateLimit,
        this.hairService.removeCategory
      );
      router.post(`${this.basePath}/add-on/:id`, this.bookingRateLimit, this.hairService.removeAddon);

      router.post(
        `${this.basePath}/update/service`,
        this.bookingRateLimit,
        this.hairService.updateHairService
      );
      router.post(
        `${this.basePath}/update/category`,
        this.bookingRateLimit,
        upload.single('file'),
        this.hairService.updateCategory
      );
      router.post(
        `${this.basePath}/update/add-on`,
        this.bookingRateLimit,
        this.hairService.updateAddon
      );

      router.get(`${this.basePath}`, this.hairService.getServicesByCategory);
      router.get(`${this.basePath}/category`, this.hairService.getCategories);
      router.get(`${this.basePath}/add-on`, this.hairService.getAddons);
      router.post(
        `${this.basePath}/available`,
        this.hairService.getAvailableHairServicesForSchedule
      );
    } catch (error) {
      logger.error('Failed to initialize hair services routes', error);
    }
  }
}
