import rateLimit from 'express-rate-limit';
import { MediaService } from '../services/Media.js';
import { GoogleDriveManager } from '../services/GoogleDriveManager.js';
import logger from '../util/logger.js';

export class MediaRoute {
  bookingRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
  });

  serveImageFileDriveRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25
  });

  basePath = '/media';

  /**
   * Default constructor
   * @param {MediaService} mediaService
   */
  constructor(mediaService) {
    this.mediaService = mediaService;
    this.googleDriveManager = new GoogleDriveManager();
  }

  /**
   * Initialize Media routes
   * @param {Router} router
   */
  async initRoutes(router, upload) {
    try {
      // GET all media (public)
      router.get(`${this.basePath}`, this.mediaService.getAllMedia);

      // POST create media (admin)
      router.post(
        `${this.basePath}/create`,
        this.bookingRateLimit,
        upload.single('file'),
        this.mediaService.addMedia
      );

      // POST delete media (admin)
      router.post(
        `${this.basePath}/delete`,
        this.bookingRateLimit,
        this.mediaService.deleteMedia
      );

      // GET image from drive (public)
      router.get(
        `${this.basePath}/drive/:id`,
        this.serveImageFileDriveRateLimit,
        this.googleDriveManager.serveImageFileDrive
      );
    } catch (error) {
      logger.error('Failed to initialize media routes', error);
    }
  }
}
