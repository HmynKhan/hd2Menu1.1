/* eslint-disable react/prop-types */
import  { useState, useRef, useEffect } from "react";
import Preview from "./Preview";
import { FaImage } from "react-icons/fa6";
import { FaFileVideo } from "react-icons/fa";
import { RiCloseCircleLine } from "react-icons/ri";
import './Timeline.css';

const Timeline = ({ layout, onCancle }) => {
  const [divisionsMedia, setDivisionsMedia] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedMedia, setDraggedMedia] = useState(null); 
// for timeline chatpgt code
// Top of component
const durationRef = useRef(null);
const [durationMode, setDurationMode] = useState("Automatic");
const [totalDuration, setTotalDuration] = useState(5);
const [showConfirmModal, setShowConfirmModal] = useState(false);
const [pendingDuration, setPendingDuration] = useState(5);
const [affectedDivision, setAffectedDivision] = useState(null);
const [previousDuration, setPreviousDuration] = useState(5);

console.log("selectedMedia",selectedMedia)

// for manual duration meida

  const mediaRef = useRef(null);
// put near the top of Timeline component (after your other refs/state)
const PIXELS_PER_SECOND = 10; // tune this: larger = faster width growth per px
const MIN_DURATION = 1;
const MAX_DURATION = 600; // optional cap (seconds)
const resizingRef = useRef(false); // keep track of active resize
const baseColors = [
  "#fff7cc",
  "#f2fbff",
  "#f9f2ff",
  "#fff2f5",
];

function darkenColor(hex, amount = 20) {
  let col = hex.replace("#", "");
  if (col.length === 3) {
    col = col.split('').map(c => c + c).join('');
  }

  const r = Math.max(0, parseInt(col.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(col.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(col.substring(4, 6), 16) - amount);

  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function getRandomGradient(mediaId) {
  const hash = [...mediaId].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const base = baseColors[hash % baseColors.length];
  return base; // Increase amount for darker shade
}

  const handleDragOver = (e) => {
    e.preventDefault();
  };


  const getRemainingDuration = (divisionIndex) => {
  if (durationMode !== "Manual") return totalDuration;
  
  const usedDuration = divisionsMedia[divisionIndex]?.reduce((sum, media) => sum + media.appearanceTime, 0) || 0;
  return Math.max(0, totalDuration - usedDuration);
};


const handleDrop = (e, index) => {
  e.preventDefault();
  const mediaSrc = e.dataTransfer.getData("mediaSrc");
  const mediaId = e.dataTransfer.getData("mediaId");
  const mediaType = e.dataTransfer.getData("mediaType");

  // Only add the media if it's valid (image or video type)
  if (mediaSrc && (mediaType === "image" || mediaType === "video")) {
    if (durationMode === "Manual") {
      const remainingDuration = getRemainingDuration(index);
      if (remainingDuration <= 0) {
        alert("No remaining duration available for this division");
        return;
      }
    }

    setDivisionsMedia((prevState) => {
      const divisionMedia = prevState[index] || [];
      const newAppearanceTime = durationMode === "Manual" ? getRemainingDuration(index) : 5;
      return {
        ...prevState,
        [index]: [
          ...divisionMedia,
          {
            mediaSrc,
            mediaId,
            mediaType,
            appearanceTime: newAppearanceTime,
            duration: mediaType === "video" ? undefined : newAppearanceTime * 1000,
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
  const newTime = Math.max(1, parseInt(e.target.value, 10) || 1);
  
  if (durationMode === "Manual") {
    // Calculate current used duration excluding the media being changed
    const currentUsedDuration = divisionsMedia[divisionIndex]
      .filter((_, idx) => idx !== mediaIndex)
      .reduce((sum, media) => sum + media.appearanceTime, 0);
    
    const maxAllowedTime = totalDuration - currentUsedDuration;
    
    if (newTime > maxAllowedTime) {
      alert(`Cannot exceed ${maxAllowedTime}s. Total duration is ${totalDuration}s`);
      return;
    }
  }

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


const renderTimelineScale = () => {
  if (totalDuration <= 0) return null;

  // Calculate the total width in pixels based on the longest duration
  const totalWidth = totalDuration * PIXELS_PER_SECOND;
  const scaleMarks = [];
  const step = totalDuration <= 10 ? 1 : Math.ceil(totalDuration / 10);
  
  for (let i = 0; i <= totalDuration; i += step) {
    scaleMarks.push(
      <div 
        key={i}
        style={{
          position: 'absolute',
          left: `${(i * PIXELS_PER_SECOND)}px`,
          height: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '1px', height: '10px', background: 'black' }} />
        <div style={{ fontSize: '10px', color: 'black' }}>{i}s</div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      height: '30px',
      marginBottom: '10px',
      width: `${totalWidth}px`,
      borderBottom: '1px solid #0077b5',
    }}>
      {scaleMarks}
    </div>
  );
};



const handleResizeStart = (e, divisionIndex, mediaIndex, initialTime) => {
  e.preventDefault();
  const startX = e.clientX;
  const startDuration = Number(initialTime) || MIN_DURATION;
  resizingRef.current = true;
  const previousUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";

  const onPointerMove = (moveEvent) => {
    const clientX = moveEvent.clientX;
    const deltaX = clientX - startX;
    const deltaSeconds = deltaX / PIXELS_PER_SECOND;
    let newDuration = Math.round(startDuration + deltaSeconds);

    if (newDuration < MIN_DURATION) newDuration = MIN_DURATION;
    if (MAX_DURATION && newDuration > MAX_DURATION) newDuration = MAX_DURATION;

    // Manual mode constraint
    if (durationMode === "Manual") {
      const currentUsedDuration = divisionsMedia[divisionIndex]
        .filter((_, idx) => idx !== mediaIndex)
        .reduce((sum, media) => sum + media.appearanceTime, 0);
      
      const maxAllowedDuration = totalDuration - currentUsedDuration;
      if (newDuration > maxAllowedDuration) newDuration = maxAllowedDuration;
    }

    setDivisionsMedia((prevState) => {
      const divisionArr = Array.isArray(prevState[divisionIndex]) ? [...prevState[divisionIndex]] : [];
      const updated = divisionArr.map((m, idx) =>
        idx === mediaIndex ? { ...m, appearanceTime: newDuration } : m
      );
      return { ...prevState, [divisionIndex]: updated };
    });
  };

  const onPointerUp = () => {
    resizingRef.current = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.body.style.userSelect = previousUserSelect || "";
  };

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
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
          <div className="flex flex-wrap" >
{divisionsMedia[index].map((media, mediaIndex) => (
  (() => {
    const bgColor = getRandomGradient(media.mediaId);
    const borderColor = darkenColor(bgColor, 50); // Adjust darkness as needed
    {/* console.log("ba56",media); */}

    return (
      <div
        key={mediaIndex}
        className="relative timeline-media-slider"
        style={{
          width: `${Math.max(MIN_DURATION, media.appearanceTime) * PIXELS_PER_SECOND}px`,
          minWidth: `${Math.max(150, MIN_DURATION * PIXELS_PER_SECOND)}px`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          userSelect: "none",
          height: "60px",
          // borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          background: bgColor,
          cursor: "move",
          border: `2px solid ${borderColor}`,
        }}
        draggable={true}
        onDragStart={() => handleDragStart(index, mediaIndex)}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDropMedia(index, mediaIndex);
        }}
        onClick={() => handleMediaClick(index, mediaIndex)}
      >
        {/* Left icon */}
        <div style={{ width: 28, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {media.mediaType === "video" ? (
            <FaFileVideo size={20} style={{ color: borderColor }} />
          ) : (
            <FaImage size={20} style={{ color: borderColor }} />
          )}
        </div>

        {/* Label */}
        <div style={{ flex: 1, paddingLeft: 8, overflow: "hidden" }}>
          <div className="text-xs font-semibold truncate" style={{ color: 'black' }}>
            {media.mediaId}
          </div>
          <div style={{ fontSize: 11, color: 'black' }}>
            {media.appearanceTime}s
          </div>
        </div>

        {/* Close button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveMedia(index, mediaIndex);
          }}
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            background: "#fff",
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 10,
            border: `1px solid ${borderColor}`,
          }}
        >
          <RiCloseCircleLine size={16} color='red' />
        </div>

        {/* Right resize handle */}
        <div
          role="slider"
          aria-valuenow={media.appearanceTime}
          aria-label="Resize duration"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "14px",
            cursor: "col-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: borderColor,
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
          }}
          onPointerDown={(ev) => {
            ev.stopPropagation();
            handleResizeStart(ev, index, mediaIndex, media.appearanceTime);
          }}
        >
          {/* Grip lines */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px"
          }}>
            <div style={{
              width: "2px",
              height: "20px",
              background: "white",
              borderRadius: "1px"
            }} />
            <div style={{
              width: "2px",
              height: "20px",
              background: "white",
              borderRadius: "1px"
            }} />
          </div>
        </div>
      </div>
    );
  })()
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
  onChange={(e) => {
    if (durationMode === "Manual") {
      const newValue = Math.max(1, parseInt(e.target.value) || 5);
      setTotalDuration(newValue);
    }
  }}
  onBlur={(e) => {
    if (durationMode === "Manual") {
      const newValue = Math.max(1, parseInt(e.target.value) || 5);
      
      // Only show confirmation if duration was decreased
      if (newValue < previousDuration) {
        // Check which division will be affected (the one with longest duration)
        let maxDivisionIndex = null;
        let maxDuration = 0;
        
        Object.entries(divisionsMedia).forEach(([index, mediaList]) => {
          const total = mediaList.reduce((sum, m) => sum + m.appearanceTime, 0);
          if (total > maxDuration) {
            maxDuration = total;
            maxDivisionIndex = index;
          }
        });
        
        if (maxDivisionIndex !== null) {
          setPendingDuration(newValue);
          setAffectedDivision(maxDivisionIndex);
          setShowConfirmModal(true);
        }
      }
      setPreviousDuration(newValue);
    }
  }}
  className={`w-16 px-2 py-1 border border-gray-300 rounded text-sm ${
    durationMode === "Automatic" ? "cursor-not-allowed bg-gray-100" : ""
  }`}
/>


<select
  value={durationMode}
  onChange={(e) => setDurationMode(e.target.value)}
  className="border border-gray-300 rounded px-2 py-1 text-sm"
>
  <option>Manual</option>
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
            {/* {renderTimelineScale()} */}
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
          <div className="flex items-center justify-end mt-4 gap-2">
            <button
                        style={{fontSize:'10px'}}
              className="px-2 py-1 text-white bg-green-500 hover:bg-green-700 cursor-pointer rounded"
            >
Save            </button>

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

{showConfirmModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded-lg max-w-sm w-full">
      <h3 className="font-bold text-lg mb-2">Confirm Duration Change</h3>
      <p className="mb-4 text-sm">
        Reducing duration will equally distribute the new duration ({pendingDuration}s) 
        among all media in this division. Continue?
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowConfirmModal(false)}
          className="px-3 py-1 bg-gray-300 rounded text-sm"
        >
          Cancel
        </button>
        <button
onClick={() => {
  setTotalDuration(pendingDuration);
  
  // Equalize durations for all media in the affected division
  if (affectedDivision !== null && divisionsMedia[affectedDivision]) {
    const mediaCount = divisionsMedia[affectedDivision].length;
    const equalDuration = Math.max(1, Math.floor(pendingDuration / mediaCount));
    
    setDivisionsMedia(prev => ({
      ...prev,
      [affectedDivision]: prev[affectedDivision].map(media => ({
        ...media,
        appearanceTime: equalDuration
      }))
    }));
  }
  
  setPreviousDuration(pendingDuration);
  setShowConfirmModal(false);
}}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}



          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
