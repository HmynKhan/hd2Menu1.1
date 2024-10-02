import React, { useState, useRef, useEffect } from "react";
import Preview from "./Preview";

const Timeline = ({ layout, onCancle }) => {
  const [divisionsMedia, setDivisionsMedia] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const mediaRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const mediaSrc = e.dataTransfer.getData("mediaSrc");
    const mediaId = e.dataTransfer.getData("mediaId");
    const mediaType = e.dataTransfer.getData("mediaType");

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
    const newTime = parseInt(e.target.value, 10) || 3;

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
        style={{ minHeight: "100px" }}
      >
        <p className="font-bold">Division {index + 1}</p>
        {divisionsMedia[index] && (
          <div className="flex flex-wrap gap-3">
            {divisionsMedia[index].map((media, mediaIndex) => (
              <div key={mediaIndex} className="relative mb-2">
                <div
                  className={`${
                    selectedMedia &&
                    selectedMedia.divisionIndex === index &&
                    selectedMedia.mediaIndex === mediaIndex
                      ? "border border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleMediaClick(index, mediaIndex)}
                >
                  {media.mediaType === "image" ? (
                    <img
                      src={media.mediaSrc}
                      alt={media.mediaId}
                      className="w-[100px] h-auto cursor-pointer"
                    />
                  ) : media.mediaType === "video" ? (
                    <video
                      src={media.mediaSrc}
                      // autoPlay
                      // loop
                      controls={false}
                      className="w-[100px] h-auto cursor-pointer"
                    />
                  ) : (
                    <p>Unknown media type</p>
                  )}
                </div>

                {/* Controller for selected media */}
                {selectedMedia &&
                  selectedMedia.divisionIndex === index &&
                  selectedMedia.mediaIndex === mediaIndex && (
                    <div className="absolute top-0 right-0 bg-white p-2 border border-gray-300 shadow">
                      <label className="block mb-1 text-xs font-medium">
                        Sec:
                        <input
                          type="number"
                          value={media.appearanceTime}
                          min="1"
                          onChange={(e) =>
                            handleAppearanceTimeChange(e, index, mediaIndex)
                          }
                          className="ml-1 w-12 p-1 border rounded"
                        />
                      </label>
                      <button
                        onClick={() => handleRemoveMedia(index, mediaIndex)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
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

  return (
    <div className="p-2">
      <div className="border-2 border-gray-200 p-2 rounded">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">
          Timeline {layout ? `for layout: ${layout.name}` : ""}
        </h1>

        {/* Render Divisions */}
        <div ref={mediaRef}>
          {layout && layout.divisions && (
            <div className="flex flex-col gap-4">{renderDivisions()}</div>
          )}
        </div>

        {/* Buttons */}
        {layout && (
          <div className="flex items-center justify-between mt-4">
            <button
              className="px-2 py-1 text-white bg-green-500 hover:bg-green-700 cursor-pointer rounded"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
            <button
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
