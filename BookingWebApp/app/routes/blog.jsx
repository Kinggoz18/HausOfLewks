import React from "react";
import { useLoaderData, Link } from "@remix-run/react";
import PageHeader from "../Components/PageHeader";
import BlogAPI from "../../storage/APIs/blog";

export const meta = () => {
  const title = "Haus of Lewks Blog | Hair Care & Protective Style Tips";
  const description =
    "Read hair care advice, protective style tips, and appointment prep guidance from Haus of Lewks in Peterborough.";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
  ];
};

export const links = () => [
  { rel: "canonical", href: "https://hausoflewks.com/blog" },
];

export const loader = async ({ request }) => {
  try {
    const blogAPI = new BlogAPI();
    // Add timeout to prevent hanging on slow/failing API calls
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timeout")), 5000)
    );
    
    const postsPromise = blogAPI.getAllBlogPosts(true); // Only published posts
    
    const posts = await Promise.race([postsPromise, timeoutPromise]);
    return { posts: posts || [], error: null };
  } catch (error) {
    console.error("Error loading blog posts:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      url: request.url
    });
    // Return empty array with error flag instead of throwing to allow page to load
    return { posts: [], error: "Failed to load blog posts. Please try again later." };
  }
};

// Blog card component
const BlogCard = ({ post, formatDate }) => (
  <article
    className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    aria-labelledby={`post-title-${post._id}`}
  >
    {post.coverImageUrl && (
      <Link to={`/blog/${post.slug}`} aria-hidden="true" tabIndex={-1}>
        <div className="relative overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt=""
            className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
    )}
    <div className="p-5 sm:p-6">
      <Link to={`/blog/${post.slug}`}>
        <h2 
          id={`post-title-${post._id}`}
          className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 hover:text-primary-purple transition-colors line-clamp-2"
        >
          {post.title}
        </h2>
      </Link>
      
      {post.excerpt && (
        <p className="text-sm sm:text-base text-neutral-600 mt-3 line-clamp-3">
          {post.excerpt}
        </p>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
        <time 
          dateTime={post.publishedAt || post.createdAt}
          className="text-xs sm:text-sm text-neutral-500"
        >
          {formatDate(post.publishedAt || post.createdAt)}
        </time>
        <Link
          to={`/blog/${post.slug}`}
          className="inline-flex items-center text-primary-purple hover:text-secondary-green text-sm font-semibold transition-colors group/link"
          aria-label={`Read more about ${post.title}`}
        >
          Read more
          <svg 
            className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  </article>
);

export default function Blog() {
  const { posts, error } = useLoaderData();

  // Helper to format date consistently for SSR and client
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <main 
      className="w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 pt-24 sm:pt-28 md:pt-32"
      role="main"
      aria-label="Blog posts"
    >
      <PageHeader
        title="Haus of Lewks Blog"
        subtitle="Tips, education, and inspiration for your next lewk."
      />

      <div className="w-full max-w-4xl flex flex-col gap-y-6 sm:gap-y-8 mt-8 sm:mt-10">
        {error && (
          <div 
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {posts.length === 0 && !error ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-neutral-600 text-base sm:text-lg mb-2">
              No blog posts available yet.
            </p>
            <p className="text-neutral-500 text-sm">
              Check back soon for hair care tips and style inspiration!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, index) => (
              <div 
                key={post._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}
              >
                <BlogCard post={post} formatDate={formatDate} />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Call to action */}
      {posts.length > 0 && (
        <div className="w-full max-w-4xl mt-12 sm:mt-16">
          <div className="bg-linear-to-r from-primary-purple/10 to-secondary-green/10 rounded-2xl p-6 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Ready for Your Next Look?</h2>
            <p className="text-neutral-600 mb-6 max-w-xl mx-auto">
              Book an appointment and let's create something beautiful together.
            </p>
            <Link
              to="/booking/create"
              className="inline-block bg-primary-purple text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-purple/90 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
