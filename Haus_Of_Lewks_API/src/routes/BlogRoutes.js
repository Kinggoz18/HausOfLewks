import { BlogService } from '../services/BlogService.js';
import rateLimit from 'express-rate-limit';
import logger from '../util/logger.js';

export class BlogRoute {
  blogRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10
  });

  basePath = '/blog';

  /**
   * Default constructor
   * @param {BlogService} blogService
   */
  constructor(blogService) {
    this.blogService = blogService;
  }

  /**
   * Initialize Blog routes
   * @param {Router} router
   */
  async initRoutes(router) {
    try {
      router.post(`${this.basePath}`, this.blogRateLimit, this.blogService.createBlogPost);
      router.get(`${this.basePath}`, this.blogService.getAllBlogPosts);
      router.get(`${this.basePath}/:blogId`, this.blogService.getBlogPostById);
      router.get(`${this.basePath}/slug/:slug`, this.blogService.getBlogPostBySlug);
      router.put(`${this.basePath}/:blogId`, this.blogRateLimit, this.blogService.updateBlogPost);
      router.delete(`${this.basePath}/:blogId`, this.blogRateLimit, this.blogService.deleteBlogPost);
    } catch (error) {
      logger.error('Failed to initialize blog routes', error);
    }
  }
}

