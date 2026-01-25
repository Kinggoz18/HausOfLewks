import BlogModel from '../models/Blog.js';
import { ReturnObject } from '../util/returnObject.js';
import logger from '../util/logger.js';

export class BlogService {
  createBlogPost = async (req, res) => {
    const { title, slug, excerpt, content, coverImageUrl, isPublished } =
      req.body;

    if (!title) {
      const response = ReturnObject(false, 'Blog title is required');
      return res.status(400).send(response);
    }
    if (!slug) {
      const response = ReturnObject(false, 'Blog slug is required');
      return res.status(400).send(response);
    }
    if (!content) {
      const response = ReturnObject(false, 'Blog content is required');
      return res.status(400).send(response);
    }

    try {
      const publishedAt = isPublished ? new Date() : null;

      const newBlogPost = await BlogModel.create({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImageUrl: coverImageUrl || null,
        isPublished: isPublished || false,
        publishedAt
      });

      const response = ReturnObject(true, newBlogPost);
      return res.status(201).send(response);
    } catch (error) {
      logger.error('Error in createBlogPost', error);
      if (error.code === 11000) {
        const response = ReturnObject(false, 'Blog slug must be unique');
        return res.status(400).send(response);
      }
      const response = ReturnObject(
        false,
        'Something went wrong while creating blog post'
      );
      return res.status(400).send(response);
    }
  };

  getAllBlogPosts = async (req, res) => {
    const { published } = req.query;

    try {
      const query = {};
      if (published !== undefined) {
        query.isPublished = published === 'true';
      }

      const blogPosts = await BlogModel.find(query).sort({ createdAt: -1 });

      const response = ReturnObject(true, blogPosts);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getAllBlogPosts', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting blog posts'
      );
      return res.status(400).send(response);
    }
  };

  getBlogPostById = async (req, res) => {
    const { blogId } = req.params;

    try {
      const blogPost = await BlogModel.findById(blogId);

      if (!blogPost) {
        const response = ReturnObject(false, 'Blog post not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, blogPost);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getBlogPostById', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting blog post'
      );
      return res.status(400).send(response);
    }
  };

  getBlogPostBySlug = async (req, res) => {
    const { slug } = req.params;

    const invalidPatterns = /\.(js|map|css|json|ts|tsx|jsx|html|xml|txt|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i;
    const validSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

    logger.debug('Getting blog post by slug', { slug });
    if (!slug || invalidPatterns.test(slug) || !validSlugPattern.test(slug)) {
      const response = ReturnObject(false, 'Blog post not found');
      return res.status(404).send(response);
    }

    try {
      const blogPost = await BlogModel.findOne({ slug, isPublished: true });

      logger.debug('Blog post found', { slug, hasBlogPost: !!blogPost });
      if (!blogPost) {
        const response = ReturnObject(false, 'Blog post not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, blogPost);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in getBlogPostBySlug', error);
      const response = ReturnObject(
        false,
        'Something went wrong while getting blog post'
      );
      return res.status(400).send(response);
    }
  };

  updateBlogPost = async (req, res) => {
    const { blogId } = req.params;
    const { title, slug, excerpt, content, coverImageUrl, isPublished } =
      req.body;

    try {
      const blogPost = await BlogModel.findById(blogId);

      if (!blogPost) {
        const response = ReturnObject(false, 'Blog post not found');
        return res.status(404).send(response);
      }

      if (title) blogPost.title = title;
      if (slug) blogPost.slug = slug;
      if (excerpt !== undefined) blogPost.excerpt = excerpt;
      if (content) blogPost.content = content;
      if (coverImageUrl !== undefined) blogPost.coverImageUrl = coverImageUrl;
      if (isPublished !== undefined) {
        blogPost.isPublished = isPublished;
        if (isPublished && !blogPost.publishedAt) {
          blogPost.publishedAt = new Date();
        }
      }

      await blogPost.save();

      const response = ReturnObject(true, blogPost);
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in updateBlogPost', error);
      if (error.code === 11000) {
        const response = ReturnObject(false, 'Blog slug must be unique');
        return res.status(400).send(response);
      }
      const response = ReturnObject(
        false,
        'Something went wrong while updating blog post'
      );
      return res.status(400).send(response);
    }
  };

  deleteBlogPost = async (req, res) => {
    const { blogId } = req.params;

    try {
      const blogPost = await BlogModel.findByIdAndDelete(blogId);

      if (!blogPost) {
        const response = ReturnObject(false, 'Blog post not found');
        return res.status(404).send(response);
      }

      const response = ReturnObject(true, 'Blog post deleted successfully');
      return res.status(200).send(response);
    } catch (error) {
      logger.error('Error in deleteBlogPost', error);
      const response = ReturnObject(
        false,
        'Something went wrong while deleting blog post'
      );
      return res.status(400).send(response);
    }
  };
}
