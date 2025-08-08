import { useEffect, useState } from "react";
import { MdImage, MdOutlineOndemandVideo } from "react-icons/md";
import request, { baseURL } from "../../services/request";
import DraggableMedia from "./DraggableMedia";

const ImageGallery = () => {
  const [media, setMedia] = useState([]); // Media array
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [currentPage, setCurrentPage] = useState(1); // Track the current page for pagination
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Is it loading more media?
  const [searchTerm, setSearchTerm] = useState(""); // Store search input
  const [searchQuery, setSearchQuery] = useState(""); // Store the actual search query to trigger search

  // Fetch media files from the API, with an optional search term
  const fetchMedia = async (page = 1, search = "") => {
    try {
      setIsLoadingMore(true); // Set loading state for loading more
      let url = "/files/my"; // Default URL
      let method = "get"; // Default method

      // If there's a search term, switch to the search URL and POST method
      if (search) {
        url = `files/search?search=${search}`;
        method = "post";
      }

      const response = await request({
        url,
        method,
        params: { page },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // console.log("API response:", response.data);

      const mediaData = response.data?.data?.data || [];
      const totalPages = response.data?.data?.last_page || 1;

      if (Array.isArray(mediaData) && mediaData.length > 0) {
        if (page === 1) {
          setMedia(mediaData); // Replace media if it's a new search
        } else {
          setMedia((prevMedia) => [...mediaData, ...prevMedia]); // Append new data to existing media
        }
        setTotalPages(totalPages);
      } else {
        console.error("API response is not an array or has no valid data.");
        setError("Invalid response format. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching media", error);
      setError("Failed to fetch media. Please try again.");
    } finally {
      setLoading(false);
      setIsLoadingMore(false); // Reset loading state
    }
  };

  // Load the first page on component mount or when search query changes
  useEffect(() => {
    fetchMedia(1, searchQuery);
  }, [searchQuery]); // Refetch media whenever the search query changes

  // Load more media when the user scrolls down or presses "Load more"
  const loadMoreMedia = () => {
    if (!isLoadingMore && currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMedia(nextPage, searchQuery); // Load more with the current search query
    }
  };

  // Trigger the search when the button is clicked
  const handleSearch = () => {
    setCurrentPage(1); // Reset to the first page on new search
    setSearchQuery(searchTerm); // Set the query to the current input value
  };

  return (
    <div className="p-2">
      <div 
      className="border-2 border-gray-100 p-2 rounded"
      >
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4">Media</h2>

        {/* Search Field */}
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-1 rounded-lg w-full mr-2"
          />
          <button
            onClick={handleSearch}
                        style={{fontSize:'12px'}}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {loading && currentPage === 1 ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            {/* Media Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 mb-4">
              {Array.isArray(media) &&
                media.map((file, index) => (
<div 
  key={`${file.id}-${index}`}
  className="border border-gray-300 rounded-lg p-1"
  style={{ width: "100%" }}
>
  <div
   className="w-full flex items-center justify-center"
   >
    <DraggableMedia
      id={file?.name || file?.id}
      src={`${baseURL}/${file.file_path}`}
      type={file.file_type === "mp4" ? "video" : "image"}
    />
  </div>
  <div className="flex items-center justify-center mt-1 text-xs font-bold text-gray-700 w-full">
    {file.file_type === "mp4" ? (
      <MdOutlineOndemandVideo className="mr-1" />
    ) : (
      <MdImage className="mr-1" />
    )}
    <span 
      className="truncate max-w-[200px]"
      title={file.name} // This adds native tooltip
    >
      {file.name.length > 15 ? `${file.name.substring(0, 26)}...` : file.name}
    </span>
    {/* Custom tooltip that appears on hover */}
    {file.name.length > 15 && (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-6 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {file.name}
      </div>
    )}
  </div>
</div>                       ))}
            </div>

            {/* Load more button */}
            {currentPage < totalPages && (
              <div className="mt-4 text-center">
                <button
                style={{fontSize:'12px'}}
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg hover:bg-blue-700"
                  onClick={loadMoreMedia}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading more..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
