import React from "react";
import { useLoaderData, Link } from "@remix-run/react";
import PageHeader from "../Components/PageHeader";
import BlogAPI from "../../storage/APIs/blog";

export const loader = async ({ params, request }) => {
  const { slug } = params;
  
  if (!slug) {
    throw new Response("Blog post not found", { status: 404 });
  }

  try {
    const blogAPI = new BlogAPI();
    const post = await blogAPI.getBlogPostBySlug(slug);
    
    if (!post) {
      throw new Response("Blog post not found", { status: 404 });
    }
    
    return { post };
  } catch (error) {
    console.error("Error loading blog post:", error);
    
    // If it's already a Response, re-throw it
    if (error instanceof Response) {
      throw error;
    }
    
    // Use the error status if available, otherwise default to 404
    const status = error?.status || 404;
    throw new Response(error?.message || "Blog post not found", { status });
  }
};

export const meta = ({ data }) => {
  if (!data?.post) {
    return [
      { title: "Blog Post Not Found | Haus of Lewks" },
      {
        name: "description",
        content: "The requested blog post could not be found.",
      },
    ];
  }

  const title = `${data.post.title} | Haus of Lewks Blog`;
  const description =
    data.post.excerpt || "Read this blog post from Haus of Lewks.";

  return [
    { title },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

// Defensive links implementation so Remix can call this
// with or without arguments, and we still avoid runtime errors.
export const links = (args) => {
  const slug = args?.params?.slug ?? args?.data?.post?.slug;
  if (!slug) return [];

  return [
    { rel: "canonical", href: `https://hausoflewks.com/blog/${slug}` },
  ];
};

export default function BlogPost() {
  const { post } = useLoaderData();

  // Helper to format date consistently for SSR and client
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };

  if (!post) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
        <PageHeader title="Blog Post Not Found" />
        <Link to="/blog" className="text-primary-green hover:text-secondary-green mt-4 text-sm sm:text-base">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <Link
        to="/blog"
        className="text-primary-green hover:text-secondary-green mb-4 sm:mb-6 self-start text-sm sm:text-base"
      >
        ← Back to Blog
      </Link>

      <article className="w-full max-w-3xl flex flex-col gap-y-4 sm:gap-y-6">
        {post.coverImageUrl && (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-2xl shadow-lg"
          />
        )}

        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-lg sm:text-xl text-neutral-700 mb-3 sm:mb-4">{post.excerpt}</p>
          )}
          <p className="text-xs sm:text-sm text-neutral-500">
            Published: {formatDate(post.publishedAt || post.createdAt)}
          </p>
        </div>

        <div
          className="prose prose-sm sm:prose-base max-w-none bg-white/70 rounded-2xl shadow-sm p-4 sm:p-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}

