import React, { useEffect, useState } from "react";
import CustomButton from "../../Components/CustomButton";
import BlogAPI from "../../../storage/APIs/blog";
import Input from "../../Components/Input";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../Components/UIFeedback";
import AddIcon from "../../images/AddIcon.svg";

const blogAPI = new BlogAPI();

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const errorRef = React.useRef(null);
  const successRef = React.useRef(null);

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const posts = await blogAPI.getAllBlogPosts();
      setBlogPosts(posts);
    } catch (err) {
      setError(err?.message ?? "Failed to load blog posts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editingPost) {
      setSlug(generateSlug(newTitle));
    }
  };

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImageUrl("");
    setIsPublished(false);
    setEditingPost(null);
    setShowForm(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    if (!title || !slug || !content) {
      setError("Title, slug, and content are required");
      toggleFeedback(errorRef);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const blogData = {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImageUrl: coverImageUrl || null,
        isPublished,
      };

      if (editingPost) {
        await blogAPI.updateBlogPost(editingPost._id, blogData);
        setError(null);
        setSuccessMessage("Blog post updated successfully!");
        toggleFeedback(successRef);
      } else {
        await blogAPI.createBlogPost(blogData);
        setError(null);
        setSuccessMessage("Blog post created successfully!");
        toggleFeedback(successRef);
      }

      resetForm();
      await fetchBlogPosts();

      // Schedule sitemap refresh 24 hours later
      if (isPublished) {
        scheduleSitemapRefresh();
      }
    } catch (err) {
      setError(err?.message ?? "Failed to save blog post");
      toggleFeedback(errorRef);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleSitemapRefresh = () => {
    // Store the timestamp when blog was published
    const publishTime = Date.now();
    const scheduledRefreshTime = publishTime + 24 * 60 * 60 * 1000; // 24 hours later
    localStorage.setItem("lastBlogPublishTime", publishTime.toString());
    localStorage.setItem("scheduledSitemapRefresh", scheduledRefreshTime.toString());
    
    // Trigger immediate sitemap fetch to notify search engines
    // This helps with initial indexing
    fetch("/sitemap.xml")
      .then(() => {
        console.log("Sitemap fetched for initial indexing");
      })
      .catch((err) => {
        console.error("Error fetching sitemap:", err);
      });

    // Set up a timeout to refresh sitemap after 24 hours
    // This is a client-side check - in production, consider a server-side cron job
    const timeUntilRefresh = scheduledRefreshTime - Date.now();
    if (timeUntilRefresh > 0) {
      setTimeout(() => {
        fetch("/sitemap.xml")
          .then(() => {
            console.log("Sitemap refreshed after 24 hours for re-indexing");
            // Optionally ping search engines
            if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
              // Ping Google Search Console (you would need to set up the API)
              // fetch('https://www.google.com/ping?sitemap=https://hausoflewks.com/sitemap.xml');
            }
          })
          .catch((err) => {
            console.error("Error refreshing sitemap:", err);
          });
      }, timeUntilRefresh);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setContent(post.content);
    setCoverImageUrl(post.coverImageUrl || "");
    setIsPublished(post.isPublished);
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post?")) {
      return;
    }

    try {
      setIsLoading(true);
      await blogAPI.deleteBlogPost(postId);
      setError(null);
      setSuccessMessage("Blog post deleted successfully!");
      toggleFeedback(successRef);
      await fetchBlogPosts();
    } catch (err) {
      setError(err?.message ?? "Failed to delete blog post");
      toggleFeedback(errorRef);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-4 sm:gap-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold">Blog Management</h1>
        {!showForm && (
          <CustomButton
            label="Add New Post"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            isActive={!isLoading}
            className="bg-primary-green w-full sm:w-[160px] rounded-lg flex items-center justify-center gap-2"
          >
            <img src={AddIcon} alt="Add" className="h-3 w-3 sm:h-4 sm:w-4" />
          </CustomButton>
        )}
      </div>

      <ErrorFeedback
        errorRef={errorRef}
        message={error}
      />
      <SuccessFeedback
        successRef={successRef}
        message={successMessage}
      />

      {showForm && (
        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <CustomButton
              label="Cancel"
              onClick={resetForm}
              isActive={!isLoading}
              className="bg-neutral-400 w-full sm:w-[100px] rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-y-4">
            <Input
              inputName="blog-title"
              label="Title"
              onChange={handleTitleChange}
              value={title}
              placeholder="Blog post title"
            />

            <Input
              inputName="blog-slug"
              label="Slug (URL-friendly identifier)"
              onChange={(e) => setSlug(e.target.value)}
              value={slug}
              placeholder="blog-post-slug"
            />

            <div className="relative flex flex-col w-full">
              <label className="font-semibold" htmlFor="blog-excerpt">
                Excerpt
              </label>
              <textarea
                id="blog-excerpt"
                className="border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
                rows="3"
                onChange={(e) => setExcerpt(e.target.value)}
                value={excerpt}
                placeholder="Short excerpt or summary"
              />
            </div>

            <div className="relative flex flex-col w-full">
              <label className="font-semibold" htmlFor="blog-content">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="blog-content"
                className="border border-neutral-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-green"
                rows="10"
                onChange={(e) => setContent(e.target.value)}
                value={content}
                placeholder="Blog post content (HTML supported)"
              />
            </div>

            <Input
              inputName="blog-cover-image"
              label="Cover Image URL"
              onChange={(e) => setCoverImageUrl(e.target.value)}
              value={coverImageUrl}
              placeholder="https://example.com/image.jpg"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="blog-published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="blog-published" className="font-semibold">
                Publish immediately
              </label>
            </div>

            <CustomButton
              label={isLoading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              onClick={handleSubmit}
              isActive={!isLoading}
              className="bg-primary-green w-full sm:w-[160px] rounded-lg"
            />
          </div>
        </div>
      )}

      {!showForm && (
        <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">All Blog Posts</h2>

          {isLoading && !blogPosts.length ? (
            <div className="text-center py-8">Loading blog posts...</div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              No blog posts yet. Create your first post!
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <div
                  key={post._id}
                  className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold">{post.title}</h3>
                        {post.isPublished ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Published
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        Slug: /blog/{post.slug}
                      </p>
                      {post.excerpt && (
                        <p className="text-sm text-neutral-700 mb-2">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-neutral-500">
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                        {post.publishedAt &&
                          ` | Published: ${new Date(post.publishedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto sm:ml-4">
                      <CustomButton
                        label="Edit"
                        onClick={() => handleEdit(post)}
                        isActive={!isLoading}
                        className="bg-blue-600 w-full sm:w-[80px] rounded-lg text-xs sm:text-sm"
                      />
                      <CustomButton
                        label="Delete"
                        onClick={() => handleDelete(post._id)}
                        isActive={!isLoading}
                        className="bg-red-600 w-full sm:w-[80px] rounded-lg text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

