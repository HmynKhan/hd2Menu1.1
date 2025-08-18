import { useState, useContext, useEffect } from "react";
import { PlaylistContext } from "../../App";
import MediaCards from "./MediaCard";

const VideoForm = () => {
  const [playlistNameInput, setPlaylistNameInput] = useState("");
  const [savedData, setSavedData] = useState(null);
  const context = useContext(PlaylistContext);
  const setPlaylistName = context?.setPlaylistName || (() => {});
  const [showProductCard, setShowProductCard] = useState(false);

  // Load saved data from localStorage on component mount


  // Add this useEffect hook in your VideoForm component
useEffect(() => {
  const handleStorageChange = () => {
    const savedTimeline = localStorage.getItem('savedTimeline');
    if (savedTimeline) {
      setSavedData(JSON.parse(savedTimeline));
    }
  };




  // Listen for storage events
  window.addEventListener('storage', handleStorageChange);

  // Also check immediately on mount
  handleStorageChange();

  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

  useEffect(() => {
    const timelineState = localStorage.getItem('timelineLayoutSaved');
    setShowProductCard(timelineState === 'true');
  }, []);


  useEffect(() => {
  const savedTimeline = localStorage.getItem('savedTimeline');
  if (savedTimeline) {
    setSavedData(JSON.parse(savedTimeline));
  }
}, []); 


  const handleInputChange = (e) => {
    setPlaylistNameInput(e.target.value);
    setPlaylistName(e.target.value);
  };

const renderLayoutPreview = () => {
  if (!savedData) return (
    <div className="bg-white shadow-md rounded-md p-4 h-[270px] flex items-center justify-center">
      <p>No saved layout found</p>
    </div>
  );

  const { layout, divisionsMedia } = savedData;
  
  // Determine layout orientation
  const isPortrait = layout.orientation === 'portrait' || layout.orientation === 'vertical' || layout.height > layout.width;
  
  // Set preview dimensions based on orientation
  const previewWidth = isPortrait ? '30%' : '60%';
  const previewHeight = isPortrait ? '67%' : 'calc(90%)';
  
  return (
    <div className="bg-white shadow-md rounded-md p-4 h-[270px] relative overflow-hidden">
      <div 
        className="relative mx-auto border border-gray-200 bg-gray-100"
        style={{
          width: previewWidth,
          height: previewHeight,
          aspectRatio: isPortrait 
            ? `${layout.height}/${layout.width}` 
            : `${layout.width}/${layout.height}`,
          maxWidth: '100%',
          maxHeight: 'calc(100% - 30px)',
          transform: isPortrait ? 'rotate(90deg)' : 'none'
        }}
      >
        {/* Render layout divisions */}
        {layout.divisions.map((division, index) => {
          const mediaItems = divisionsMedia[index] || [];
          const currentMedia = mediaItems[0]; // Show first media item in division
          
          return (
            <div
              key={division.id}
              className="absolute border border-blue-500 overflow-hidden"
              style={{
                left: `${(division.x / layout.width) * 100}%`,
                top: `${(division.y / layout.height) * 100}%`,
                width: `${(division.width / layout.width) * 100}%`,
                height: `${(division.height / layout.height) * 100}%`,
              }}
            >
              {currentMedia && (
                currentMedia.mediaType === 'video' ? (
                  <video 
                    src={currentMedia.mediaSrc}
                          className="w-full h-full object-cover"

                    // muted
                    // autoPlay
                    // loop
                    // playsInline
                  />
                ) : (
                  <img 
                    src={currentMedia.mediaSrc} 
                          className="w-full h-full object-cover"

                    alt={currentMedia.mediaId}
                  />
                )
              )}
            </div>
          );
        })}
      </div>
      <h3 className="text-sm font-semibold mb-2 text-center mt-2">
        {layout.name} ({isPortrait ? 'Portrait' : 'Landscape'})
      </h3>
    </div>
  );
}; 




return (
    <>
      <MediaCards />

      <div className="flex w-full p-6 gap-6">




              {showProductCard ? (
        // Two column layout: Left 40%, Right 60%
        <div className="flex gap-6 w-full">
          {/* Left side - Product Card (40%) */}
          <div className="w-2/5  rounded-md">
          {renderLayoutPreview()}
          </div>
          
          <div className="w-3/5">
            <form className="p-6 w-full bg-gray-50 shadow-md rounded-md"> 
              <div className="flex items-center gap-4 mt-2"> 
                <label className="text-sm font-medium">Playlist Name:</label> 
                <input 
                  type="text" 
                  value={playlistNameInput} 
                  onChange={handleInputChange} 
                  className="border border-gray-300 p-1 rounded flex-1" 
                  placeholder="Playlist Name" 
                /> 
              </div> 
            </form>
          </div>
        </div>
      ) : 
      (
        <div className="w-full">
          <form className="p-6 w-full bg-gray-50 shadow-md rounded-md"> 
            <div className="flex items-center gap-4 mt-2">
              <label className="text-sm font-medium">Playlist Name:</label>
              <input
                type="text"
                value={playlistNameInput}
                onChange={handleInputChange}
                className="border border-gray-300 p-1 rounded flex-1"
                placeholder="Playlist Name"
              />
            </div>
          </form>
        </div>
      )}


      </div>
    </>
  );
};

export default VideoForm;