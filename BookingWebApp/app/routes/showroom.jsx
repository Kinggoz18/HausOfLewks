import React, { useState, useEffect, useCallback } from "react";
import { Link } from "@remix-run/react";
import MediaAPI from "../../storage/APIs/media";
import HairServiceAPI from "../../storage/APIs/hairService";
import CustomButton from "../Components/CustomButton";
import { getMediaUrl } from "../config/config";

export const meta = () => {
  return [
    { title: "Showroom | Haus of Lewks - Our Work Gallery" },
    { name: "description", content: "Browse our gallery of stunning braids, locs, and protective styles. See real results from Haus of Lewks in Peterborough, Ontario." },
  ];
};

export const links = () => [
  { rel: "canonical", href: "https://hausoflewks.com/showroom" },
];

// Loading skeleton component
const ImageSkeleton = () => (
  <div className="aspect-square rounded-xl skeleton"></div>
);

// Image card with lightbox
const ImageCard = ({ media, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use the backend endpoint to serve images instead of direct Google Drive URLs
  const imageUrl = getMediaUrl(media.driveId) || media.link;
  
  return (
    <div 
      className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-neutral-100 shadow-sm hover:shadow-lg transition-all duration-300"
      onClick={() => onClick(media)}
    >
      {!isLoaded && <div className="absolute inset-0 skeleton"></div>}
      <img
        src={imageUrl}
        alt={media.tag?.join(", ") || "Hair style"}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <div className="flex flex-wrap gap-1">
            {media.tag?.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Lightbox modal
const Lightbox = ({ media, onClose, onNext, onPrev, hasPrev, hasNext }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
    };
    
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 sm:left-4 text-white/80 hover:text-white p-2 z-10"
          aria-label="Previous"
        >
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 sm:right-4 text-white/80 hover:text-white p-2 z-10"
          aria-label="Next"
        >
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      {/* Image */}
      <div 
        className="max-w-4xl max-h-[85vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getMediaUrl(media.driveId) || media.link}
          alt={media.tag?.join(", ") || "Hair style"}
          className="max-w-full max-h-[85vh] object-contain rounded-lg"
        />
        {media.tag && media.tag.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {media.tag.map((tag, index) => (
              <span 
                key={index}
                className="text-sm px-3 py-1 bg-white/10 text-white rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function Showroom() {
  const [media, setMedia] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const mediaAPI = new MediaAPI();
  const hairServiceAPI = new HairServiceAPI();

  // Fetch media and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [mediaData, categoriesData] = await Promise.all([
          mediaAPI.getAllMedia(),
          hairServiceAPI.getCategories()
        ]);
        setMedia(mediaData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Error fetching showroom data:", err);
        setError("Failed to load gallery. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter media
  const filteredMedia = media.filter((item) => {
    const matchesCategory = !selectedCategory || 
      item.tag?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchesSearch = !searchTerm || 
      item.tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Lightbox handlers
  const openLightbox = (item) => {
    const index = filteredMedia.findIndex(m => m._id === item._id);
    setLightboxIndex(index);
    setLightboxMedia(item);
  };

  const closeLightbox = () => setLightboxMedia(null);
  
  const nextImage = () => {
    const nextIndex = lightboxIndex + 1;
    if (nextIndex < filteredMedia.length) {
      setLightboxIndex(nextIndex);
      setLightboxMedia(filteredMedia[nextIndex]);
    }
  };
  
  const prevImage = () => {
    const prevIndex = lightboxIndex - 1;
    if (prevIndex >= 0) {
      setLightboxIndex(prevIndex);
      setLightboxMedia(filteredMedia[prevIndex]);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 pb-12 px-4 sm:px-6 md:px-10 bg-linear-to-b from-white to-neutral-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in">
          Our <span className="text-primary-purple">Showroom</span>
        </h1>
        <p className="text-center text-neutral-600 max-w-2xl mx-auto text-base sm:text-lg animate-fade-in-up">
          Browse our gallery of stunning styles. Each look is crafted with precision and care.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple/50 bg-white shadow-sm"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-purple/50 bg-white shadow-sm"
          >
            <option value="">All Styles</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          
          {/* Clear filters */}
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
              className="text-primary-purple hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ImageSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-neutral-400 text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-primary-purple hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-neutral-600 text-lg mb-2">
              {media.length === 0 ? "No images in the showroom yet." : "No styles match your search."}
            </p>
            {media.length === 0 && (
              <p className="text-neutral-500 text-sm">Check back soon for our latest work!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredMedia.map((item, index) => (
              <div
                key={item._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                <ImageCard media={item} onClick={openLightbox} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto mt-12 sm:mt-16 text-center">
        <div className="bg-linear-to-r from-primary-purple/10 to-secondary-green/10 rounded-2xl p-6 sm:p-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Ready to Get Your Perfect Style?
          </h2>
          <p className="text-neutral-600 mb-6 max-w-xl mx-auto">
            Book an appointment today and let us create your next stunning look.
          </p>
          <Link
            to="/booking/create"
            className="inline-block bg-primary-purple text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-primary-purple/90 transition-colors shadow-lg"
          >
            Book Now
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxMedia && (
        <Lightbox
          media={lightboxMedia}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          hasNext={lightboxIndex < filteredMedia.length - 1}
          hasPrev={lightboxIndex > 0}
        />
      )}
    </div>
  );
}

