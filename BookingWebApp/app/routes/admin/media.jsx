import React, { useEffect, useRef, useState } from "react";
import {
  ErrorFeedback,
  SuccessFeedback,
  toggleFeedback,
} from "../../Components/UIFeedback";
import MediaAPI from "../../../storage/APIs/media";
import HairServiceAPI from "../../../storage/APIs/hairService";
import CustomButton from "../../Components/CustomButton";
import UploadImageIcon from "../../images/upload-image.svg";
import { getMediaUrl } from "../../config/config";

// Media card component
const MediaCard = ({ media, onDelete, isDeleting }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use the backend endpoint to serve images instead of direct Google Drive URLs
  const imageUrl = getMediaUrl(media.driveId) || media.link;
  
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square relative">
        {!isLoaded && <div className="absolute inset-0 skeleton"></div>}
        <img
          src={imageUrl}
          alt={media.tag?.join(", ") || "Media"}
          className={`w-full h-full object-cover transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onDelete(media._id)}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      {/* Tags */}
      <div className="p-3">
        <div className="flex flex-wrap gap-1">
          {media.tag?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {media.tag?.length > 3 && (
            <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">
              +{media.tag.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Upload form component
const UploadForm = ({ categories, services, addons, onUpload, onClose }) => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleSetUploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileSize = (file.size / (1024 * 1024)).toFixed(2);
    if (fileSize > 150) {
      setError("Image file is too large (max 150MB).");
      setImage(null);
      setImageUrl(null);
      return;
    }

    const fr = new FileReader();
    fr.readAsArrayBuffer(file);
    fr.onload = function () {
      const blob = new Blob([fr.result]);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setImage(file);
      setError(null);
    };
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleUpload = async () => {
    if (!image) {
      setError("Please select an image to upload.");
      return;
    }
    if (selectedTags.length === 0) {
      setError("Please select at least one tag.");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(image, selectedTags);
      // Reset form
      setImage(null);
      setImageUrl(null);
      setSelectedTags([]);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // Combine all available tags
  const allTags = [
    ...(categories?.map(c => c.name || c.title) || []),
    ...(services?.map(s => s.title) || []),
    ...(addons?.map(a => a.title) || []),
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-6 animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Upload New Image</h3>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-700 p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Upload Area */}
        <div className="relative">
          <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed ${imageUrl ? 'border-primary-green bg-primary-green/5' : 'border-neutral-300 bg-neutral-50'} p-6 h-64 sm:h-72 transition-colors`}>
            {!imageUrl ? (
              <>
                <img
                  src={UploadImageIcon}
                  alt="Upload"
                  className="w-12 h-12 mb-3 opacity-50"
                />
                <p className="text-neutral-600 font-medium mb-1">Click or drag to upload</p>
                <p className="text-neutral-400 text-sm">JPEG, PNG, WebP (max 150MB)</p>
              </>
            ) : (
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleSetUploadImage}
            />
          </div>
          {imageUrl && (
            <button
              onClick={() => { setImage(null); setImageUrl(null); }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Remove image
            </button>
          )}
        </div>

        {/* Tags Selection */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            Select Tags (Services, Categories, Add-ons)
          </label>
          <div className="max-h-56 overflow-y-auto border border-neutral-200 rounded-lg p-3 space-y-2">
            {allTags.length === 0 ? (
              <p className="text-neutral-500 text-sm">No tags available. Add services first.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-purple text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {tag}
                    {selectedTags.includes(tag) && (
                      <span className="ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {selectedTags.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-neutral-500 mb-2">Selected tags:</p>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-primary-purple/10 text-primary-purple text-xs rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => toggleTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <CustomButton
          label="Cancel"
          onClick={onClose}
          className="bg-neutral-200 text-neutral-800 px-6"
        />
        <CustomButton
          label={isUploading ? "Uploading..." : "Upload Image"}
          onClick={handleUpload}
          className="bg-primary-green px-6"
          isActive={!isUploading && image && selectedTags.length > 0}
        />
      </div>
    </div>
  );
};

export default function Media() {
  const [media, setMedia] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [addons, setAddons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const successRef = useRef(null);
  const errorRef = useRef(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const mediaAPI = new MediaAPI();
  const hairServiceAPI = new HairServiceAPI();

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mediaData, categoriesData, addonsData, servicesData] = await Promise.all([
        mediaAPI.getAllMedia(),
        hairServiceAPI.getCategories(),
        hairServiceAPI.getAddons(),
        hairServiceAPI.getServicesByCategory(),
      ]);
      
      setMedia(mediaData || []);
      setCategories(categoriesData || []);
      setAddons(addonsData || []);
      
      // Flatten services
      const allServices = [];
      if (servicesData) {
        Object.values(servicesData).forEach(categoryServices => {
          if (Array.isArray(categoryServices)) {
            allServices.push(...categoryServices);
          }
        });
      }
      setServices(allServices);
    } catch (error) {
      console.error("Error fetching data:", error);
      setFeedbackMessage("Failed to load media");
      toggleFeedback(errorRef);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle upload
  const handleUpload = async (imageFile, tags) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("type", "Image");
    formData.append("tag", JSON.stringify(tags));

    await mediaAPI.uploadMedia(formData);
    setFeedbackMessage("Image uploaded successfully!");
    toggleFeedback(successRef);
    await fetchData();
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    setDeletingId(id);
    try {
      await mediaAPI.deleteMedia(id);
      setFeedbackMessage("Image deleted successfully!");
      toggleFeedback(successRef);
      setMedia(prev => prev.filter(m => m._id !== id));
    } catch (error) {
      setFeedbackMessage(error.message || "Failed to delete image");
      toggleFeedback(errorRef);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter media by search
  const filteredMedia = media.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return item.tag?.some(tag => tag.toLowerCase().includes(term));
  });

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col gap-y-4 sm:gap-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">Showroom Media</h1>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
            Upload and manage images for your showroom gallery. Tag images with services, categories, or add-ons.
          </p>
        </div>
        <CustomButton
          label="Upload Image"
          onClick={() => setShowUploadForm(true)}
          isActive={true}
          className="bg-primary-green w-full sm:w-auto px-6 rounded-lg"
        />
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <UploadForm
          categories={categories}
          services={services}
          addons={addons}
          onUpload={handleUpload}
          onClose={() => setShowUploadForm(false)}
        />
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          placeholder="Search by tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green text-sm bg-white"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Media Grid */}
      <div className="bg-white/80 rounded-xl p-4 sm:p-6 shadow-sm min-h-[300px]">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl skeleton"></div>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-neutral-600 mb-2">
              {media.length === 0 ? "No images uploaded yet." : "No images match your search."}
            </p>
            {media.length === 0 && (
              <CustomButton
                label="Upload Your First Image"
                onClick={() => setShowUploadForm(true)}
                className="bg-primary-purple mt-4"
              />
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-neutral-600 mb-4">
              {filteredMedia.length} {filteredMedia.length === 1 ? 'image' : 'images'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <MediaCard
                  key={item._id}
                  media={item}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item._id}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <SuccessFeedback ref={successRef} message={feedbackMessage} />
      <ErrorFeedback ref={errorRef} message={feedbackMessage} />
    </div>
  );
}

