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

  constructor(mediaService) {
    this.mediaService = mediaService;
    this.googleDriveManager = new GoogleDriveManager();
  }

  async initRoutes(router, upload) {
    try {
      router.get(`${this.basePath}`, this.mediaService.getAllMedia);

      router.post(
        `${this.basePath}/create`,
        this.bookingRateLimit,
        upload.single('file'),
        this.mediaService.addMedia
      );

      router.post(
        `${this.basePath}/delete`,
        this.bookingRateLimit,
        this.mediaService.deleteMedia
      );

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
