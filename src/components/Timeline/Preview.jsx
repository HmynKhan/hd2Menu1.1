import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas"; // You need to install html2canvas
import RecordRTC from "recordrtc"; // You need to install RecordRTC

const Preview = ({ layout, onClose, divisionsMedia = {} }) => {
  const layoutWidth = 400;
  const layoutHeight = 300;
  const layoutRef = useRef(null);

  // for recording

  const handleDownload = () => {
    alert("downloading in progress.");
  };
  // Function to calculate the total duration of the layout based on the longest division
  const calculateTotalDuration = () => {
    if (!divisionsMedia || Object.keys(divisionsMedia).length === 0) {
      return 0; // Return 0 if divisionsMedia is empty
    }

    // Calculate the longest time for each division's media items
    const maxDivisionDuration = Object.values(divisionsMedia).reduce(
      (maxDuration, mediaItems) => {
        if (!Array.isArray(mediaItems)) return maxDuration;
        // Calculate the total appearanceTime for the division's media items
        const divisionDuration = mediaItems.reduce(
          (total, item) => total + item.appearanceTime,
          0
        );
        return Math.max(maxDuration, divisionDuration); // Keep track of the maximum division duration
      },
      0
    );

    return maxDivisionDuration;
  };

  const totalDuration = calculateTotalDuration(); // Total duration in seconds
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (totalDuration === 0) return;

    const intervalId = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
      const progressPercentage = Math.min(
        (elapsedTime / totalDuration) * 100,
        100
      );
      setProgress(progressPercentage);

      // Stop the interval once progress reaches 100%
      if (progressPercentage >= 100) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [startTime, totalDuration]);

  // Custom hook to manage media cycling
  const useMediaCycler = (mediaItems) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [mediaStartTime, setMediaStartTime] = useState(Date.now());
    const [isCycling, setIsCycling] = useState(true);

    useEffect(() => {
      if (mediaItems.length === 0) return;

      const intervalId = setInterval(() => {
        const elapsedTime = Date.now() - mediaStartTime;
        const currentMedia = mediaItems[currentMediaIndex];

        if (elapsedTime >= currentMedia.appearanceTime * 1000) {
          setCurrentMediaIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % mediaItems.length;
            setMediaStartTime(Date.now());

            // Check if all media items have ended
            if (nextIndex === 0) {
              const allMediaEnded = mediaItems.every(
                (item) =>
                  Date.now() - mediaStartTime >= item.appearanceTime * 1000
              );
              if (allMediaEnded) {
                setIsCycling(false);
              }
            }

            return nextIndex;
          });
        }
      }, 100);

      return () => clearInterval(intervalId);
    }, [mediaItems, currentMediaIndex, mediaStartTime]);

    return { currentMediaIndex, isCycling };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 w-[500px] h-[450px] rounded">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Preview layout: {layout.name}</h1>
          <button
            onClick={onClose}
            className="bg-red-500 px-3 py-1 hover:bg-red-600 cursor-pointer rounded-md text-white"
          >
            Close
          </button>
        </div>

        <div
          ref={layoutRef}
          className="flex items-center justify-center mb-2 flex-col gap-1"
        >
          <div
            id="div-to-record"
            className="relative border border-black"
            style={{
              width: `${layoutWidth}px`,
              height: `${layoutHeight}px`,
            }}
          >
            {/* Render the layout */}
            <div className="absolute top-0 left-0 w-full h-full" />
            {/* Render divisions */}
            {layout.divisions.map((division, index) => {
              const { currentMediaIndex, isCycling } = useMediaCycler(
                divisionsMedia[index] || []
              );

              return (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    top: division.y,
                    left: division.x,
                    width: division.width,
                    height: division.height,
                    // border: "2px solid black",
                    // backgroundColor: division.fill,
                    backgroundColor: "white",
                    overflow: "hidden",
                  }}
                >
                  {divisionsMedia[index] &&
                    divisionsMedia[index][currentMediaIndex] &&
                    isCycling && (
                      <>
                        {divisionsMedia[index][currentMediaIndex].mediaType ===
                          "image" && (
                          <img
                            src={
                              divisionsMedia[index][currentMediaIndex].mediaSrc
                            }
                            alt="media"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        {divisionsMedia[index][currentMediaIndex].mediaType ===
                          "video" && (
                          <video
                            src={
                              divisionsMedia[index][currentMediaIndex].mediaSrc
                            }
                            autoPlay
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </>
                    )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-300 h-2 rounded mb-4">
            <div
              className="bg-green-500 h-full rounded"
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-center text-xs">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Download button */}
        <button
          className="px-2 py-1 bg-green-500 hover:bg-green-700 text-white cursor-pointer rounded"
          onClick={handleDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default Preview;
