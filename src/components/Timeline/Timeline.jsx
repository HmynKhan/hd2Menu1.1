/* eslint-disable react/prop-types */
import  { useState, useRef, useEffect } from "react";
import Preview from "./Preview";
import { FaImage } from "react-icons/fa6";
import { FaFileVideo } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";


const Timeline = ({ layout, onCancle }) => {
  const [divisionsMedia, setDivisionsMedia] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedMedia, setDraggedMedia] = useState(null); 
// for timeline chatpgt code
// Top of component
const durationRef = useRef(null);
const [durationMode, setDurationMode] = useState("Automatic"); // or "Manual"
const [totalDuration, setTotalDuration] = useState(0);
// for manual duration meida

  const mediaRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const mediaSrc = e.dataTransfer.getData("mediaSrc");
    const mediaId = e.dataTransfer.getData("mediaId");
    const mediaType = e.dataTransfer.getData("mediaType");

    // Only add the media if it's valid (image or video type)
    if (mediaSrc && (mediaType === "image" || mediaType === "video")) {
      setDivisionsMedia((prevState) => {
        const divisionMedia = prevState[index] || [];
        return {
          ...prevState,
          [index]: [
            ...divisionMedia,
            {
              mediaSrc,
              mediaId,
              mediaType,
              appearanceTime: 3,
              duration: mediaType === "video" ? undefined : 3000,
            },
          ],
        };
      });
    }
  };

  const handleDragStart = (divisionIndex, mediaIndex) => {
    setDraggedMedia({ divisionIndex, mediaIndex });
  };

  const handleDropMedia = (divisionIndex, mediaIndex) => {
    if (!draggedMedia || draggedMedia.divisionIndex !== divisionIndex) return;

    setDivisionsMedia((prevState) => {
      const updatedDivisionMedia = [...prevState[divisionIndex]];

      // Remove the dragged media item from its original position
      const [draggedItem] = updatedDivisionMedia.splice(
        draggedMedia.mediaIndex,
        1
      );

      // Validate that draggedItem is a valid media object with correct mediaType and mediaSrc
      if (
        draggedItem &&
        draggedItem.mediaSrc &&
        (draggedItem.mediaType === "image" || draggedItem.mediaType === "video")
      ) {
        // Insert the dragged media item at the new position
        updatedDivisionMedia.splice(mediaIndex, 0, draggedItem);
      }

      // Filter out any invalid media items in case one got added
      return {
        ...prevState,
        [divisionIndex]: updatedDivisionMedia.filter(
          (media) =>
            media &&
            media.mediaSrc &&
            (media.mediaType === "image" || media.mediaType === "video") // Only allow valid media types
        ),
      };
    });

    setDraggedMedia(null); // Reset dragged media after the drop
  };

  const handleMediaClick = (divisionIndex, mediaIndex) => {
    setSelectedMedia({ divisionIndex, mediaIndex });
  };

  const handleRemoveMedia = (divisionIndex, mediaIndex) => {
    setDivisionsMedia((prevState) => {
      const updatedMedia = prevState[divisionIndex].filter(
        (_, idx) => idx !== mediaIndex
      );
      return {
        ...prevState,
        [divisionIndex]: updatedMedia,
      };
    });
    setSelectedMedia(null);
  };

const handleAppearanceTimeChange = (e, divisionIndex, mediaIndex) => {
  const newTime = Math.max(1, parseInt(e.target.value, 10) || 1); // No maximum limit

  setDivisionsMedia((prevState) => {
    const updatedMedia = prevState[divisionIndex].map((media, idx) =>
      idx === mediaIndex ? { ...media, appearanceTime: newTime } : media
    );
    return {
      ...prevState,
      [divisionIndex]: updatedMedia,
    };
  });
};


const renderDivisions = () => {
    return layout.divisions.map((division, index) => (
      
      <div
        key={index}
        className="border border-dashed border-gray-300 p-2 m-2"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        style={{ minHeight: "60px" }}
      >
        {/* <p className="font-bold" style={{fontSize:'10px'}}>Division {index + 1}</p> */}
        {divisionsMedia[index] && (
          <div className="flex flex-wrap gap-3">
    
{divisionsMedia[index].map((media, mediaIndex) => (
  <div
    key={mediaIndex}
    className="flex items-center gap-3 w-[240px] border border-blue-200 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md cursor-pointer relative hover:shadow-lg hover:scale-[1.01] transition-all duration-200"
    draggable
    onDragStart={() => handleDragStart(index, mediaIndex)}
    onDrop={() => handleDropMedia(index, mediaIndex)}
    onDragOver={(e) => e.preventDefault()}
    onClick={(e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const cardWidth = rect.width;
      
      // Calculate duration - unlimited max
      const maxDuration = Math.max(60, media.appearanceTime * 2);
      let newDuration = Math.round((clickX / cardWidth) * maxDuration);
      newDuration = Math.max(1, newDuration);
      
      handleAppearanceTimeChange({ target: { value: newDuration } }, index, mediaIndex);
    }}
    
  >
    {/* Media Icon */}
    <div className={`rounded-full p-2 shadow-md ${
      media.mediaType === "video" 
        ? "bg-gradient-to-br from-red-400 to-pink-500" 
        : "bg-gradient-to-br from-green-400 to-blue-500"
    }`}>
      {media.mediaType === "video" ? (
        <FaFileVideo className="text-white text-lg" />
      ) : (
        <FaImage className="text-white text-lg" />
      )}
    </div>
    
    {/* Media Info */}
    <div className="flex-1 min-w-0">
      <span className="text-sm font-bold truncate block text-gray-800 mb-1">
        {media.mediaId}
      </span>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-xs text-gray-600 font-medium">
          {media.mediaType === "video" ? "Video" : "Image"}
        </span>
      </div>
    </div>
    
    {/* Duration Input */}
    <div className="bg-white rounded-lg px-2 py-1 shadow-sm border">
      <input 
        type="number"
        min="1"
        value={media.appearanceTime}
        onChange={(e) => {
          const newTime = Math.max(1, parseInt(e.target.value, 10) || 1);
          handleAppearanceTimeChange({ target: { value: newTime } }, index, mediaIndex);
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-12 text-xs font-bold text-indigo-600 bg-transparent border-none outline-none text-center"
      />
      <span className="text-xs text-indigo-500">s</span>
    </div>
    
    {/* Progress Bar */}
    <div 
      className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-b-xl"
      style={{ 
        width: `${Math.min(100, (media.appearanceTime / Math.max(30, media.appearanceTime)) * 100)}%`,
        transition: 'width 0.3s ease'
      }}
    />
    
    {/* Remove Button */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleRemoveMedia(index, mediaIndex);
      }}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
    >
      <RiCloseCircleLine className="text-sm" />
    </button>
  </div>
))}


          </div>
        )}
      </div>
    ));
  };

  const handleCancle = () => {
    setDivisionsMedia({}); // Reset media divisions
    setShowPreview(false); // Hide the Preview
    onCancle(); // Propagate cancel action
  };

  const handleClickOutside = (event) => {
    if (mediaRef.current && !mediaRef.current.contains(event.target)) {
      setSelectedMedia(null);
    }
  };

  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
  if (durationMode === "Automatic") {
    let maxDuration = 0;
    Object.values(divisionsMedia).forEach((mediaList) => {
      const total = mediaList.reduce((sum, m) => sum + m.appearanceTime, 0);
      if (total > maxDuration) maxDuration = total;
    });
    setTotalDuration(maxDuration);
  }
}, [divisionsMedia, durationMode]);



  return (
    <div className="p-2">
      <div className="border-2 border-gray-200 p-2 rounded">
      <div>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between'}}>
        <h1 className="text-1xl font-bold mb-4" style={{fontSize:'13px'}}>
          Timeline {layout ? `for layout: ${layout.name}` : ""}
        </h1>

<div className="flex items-center gap-2 bg-white px-3 py-1 rounded">
  <span className="text-gray-500">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  </span>

  <input
    ref={durationRef}
    type="number"
    min="1"
    value={totalDuration}
    disabled={durationMode === "Automatic"}
    className={`w-16 px-2 py-1 border border-gray-300 rounded text-sm ${
      durationMode === "Automatic" ? "cursor-not-allowed bg-gray-100" : ""
    }`}
  />


  <select
    value={durationMode}
    onChange={(e) => setDurationMode(e.target.value)}
    className="border border-gray-300 rounded px-2 py-1 text-sm"
  >
    {/* <option>Manual</option> */}
    <option>Automatic</option>
  </select>
</div>

        </div>

      

      </div>



<div ref={mediaRef}>
  {layout && layout.divisions && (
    <div className="flex flex-col gap-4">
      {layout.divisions.map((division, index) => {
        // Determine orientation based on layout dimensions
        const isPortrait = layout.height > layout.width;
        
        // Fixed preview box dimensions
        const previewWidth =isPortrait ? 40 : 65;
        const previewHeight = isPortrait ? 55 : 40; // Taller for portrait
        
        // Calculate scale factors based on original layout dimensions
        {/* const scaleX = previewWidth / (isPortrait ? layout.height : layout.width);
        const scaleY = previewHeight / (isPortrait ? layout.width : layout.height); */}
// Calculate scale factors based on original layout dimensions (don't swap here)
const scaleX = previewWidth / layout.width;
const scaleY = previewHeight / layout.height;
        return (
          <div key={index} className="flex items-start gap-4" style={{alignItems:'center'}}>
            {/* Left: Mini Layout Preview */}
            <div
              style={{
                width: `${previewWidth}px`,
                height: `${previewHeight}px`,
                border: "1px solid #ccc",
                position: "relative",
                backgroundColor: "#f9fafb",
                overflow: "hidden",
                borderRadius: "4px",
              }}
            >
{(() => {
  // Fix: Don't swap coordinates, just scale them properly
  const x = division.x * scaleX;
  const y = division.y * scaleY;
  const w = division.width * scaleX;
  const h = division.height * scaleY;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
        backgroundColor: "#0077b5",
        fontSize: "8px",
        color: "white",
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <div style={{position:'absolute',top:'1px',left:'2px'}}>
        {division.id.replace("rect-", "")}
      </div>
    </div>
  );
})()}
            </div>

            {/* Right: Actual Division Render */}
            <div style={{ flex: 1 }}>
              {renderDivisions()[index]}
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

        {/* Buttons */}
        {layout && (
          <div className="flex items-center justify-between mt-4">
            <button
            style={{fontSize:'10px'}}
              className="px-2 py-1 text-white bg-green-500 hover:bg-green-700 cursor-pointer rounded"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
            <button
                        style={{fontSize:'10px'}}
              onClick={() => handleCancle()}
              className="px-2 py-1 text-white bg-red-500 hover:bg-red-700 cursor-pointer rounded"
            >
              Cancel
            </button>

            {showPreview && (
              <div className="mt-8">
                <Preview
                  layout={layout}
                  divisionsMedia={divisionsMedia}
                  onClose={() => setShowPreview(false)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
