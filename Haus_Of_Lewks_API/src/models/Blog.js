import mongoose, { Schema } from 'mongoose';

const BlogSchema = new Schema(
  {
    title: { type: String, required: [true, 'Blog title is required'] },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
    },
    excerpt: { type: String, default: null },
    content: { type: String, required: [true, 'Blog content is required'] },
    coverImageUrl: { type: String, default: null },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const BlogModel = mongoose.model('Blog', BlogSchema);
export default BlogModel;