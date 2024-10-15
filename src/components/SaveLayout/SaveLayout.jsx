import { useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import CustomLayout from "../CustomLayout/CustomLayout";
import { IoCloseSharp } from "react-icons/io5";

const SaveLayout = ({
  layouts,
  onDeleteLayout,
  onLoadLayout,
  currentLayoutIndex,
  setLayouts,
  onCancle,
}) => {
  // Step 1: Add state to control the modal visibility
  const [isCustomLayoutOpen, setIsCustomLayoutOpen] = useState(false);

  // Function to handle opening the custom layout modal
  const handleAddCustomLayout = () => {
    setIsCustomLayoutOpen(true); // Open the modal
  };

  const handleSaveNewLayout = (newLayout) => {
    // Swap the width/height and x/y for vertical orientation before saving
    const updatedDivisions = newLayout.divisions.map((division) => {
      if (newLayout.orientation === "vertical") {
        return {
          ...division,
          x: division.y, // Swap x and y
          y: division.x,
          width: division.height, // Swap width and height
          height: division.width,
        };
      }
      return division; // Keep as is for horizontal orientation
    });

    const updatedLayout = {
      ...newLayout,
      divisions: updatedDivisions, // Use the updated divisions
    };

    const updatedLayouts = [updatedLayout, ...layouts];
    setLayouts(updatedLayouts);
    localStorage.setItem("layouts", JSON.stringify(updatedLayouts));
    setIsCustomLayoutOpen(false); // Close the modal
  };

  return (
    <div className="p-2">
      <div className="border-2 border-gray-200 p-2 rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Saved Layouts</h2>
          <button
            className="px-2 py-2 text-white bg-blue-500 hover:bg-blue-700 cursor-pointer rounded flex items-center gap-2"
            onClick={handleAddCustomLayout}
          >
            <IoMdAdd className="text-2xl" /> Add Custom Layout
          </button>
        </div>
        {layouts.length === 0 ? (
          <p>No layouts saved yet.</p>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto "
            style={{ whiteSpace: "nowrap" }}
          >
            {layouts.map((layout, layoutIndex) => {
              const scaleFactor = 4;
              let miniWidth = 100;
              let miniHeight = 70;

              // Apply saved orientation to the mini preview
              if (layout.orientation === "vertical") {
                [miniWidth, miniHeight] = [miniHeight, miniWidth]; // Swap width and height for vertical orientation
              }

              const isLoaded = layoutIndex === currentLayoutIndex;

              return (
                <div
                  key={layoutIndex}
                  className={`border border-gray-300 rounded mx-1  my-2 p-2 ${
                    isLoaded
                      ? "outline-blue-500 outline outline-offset-2 outline-4 bg-sky-500 bg-opacity-20"
                      : ""
                  }`}
                >
                  <div onClick={() => onLoadLayout(layoutIndex)}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">{layout.name}</h3>
                    </div>

                    <div
                      className="border border-gray-400 relative mb-2"
                      style={{ width: miniWidth, height: miniHeight }}
                    >
                      <Stage width={miniWidth} height={miniHeight}>
                        <Layer>
                          {layout.divisions.map((division, index) => {
                            // Calculate scaled dimensions
                            const scaledX = division.x / scaleFactor;
                            const scaledY = division.y / scaleFactor;
                            const scaledWidth = division.width / scaleFactor;
                            const scaledHeight = division.height / scaleFactor;

                            // Adjust positions if divisions go out of bounds
                            const x = Math.max(
                              0,
                              Math.min(scaledX, miniWidth - scaledWidth)
                            );
                            const y = Math.max(
                              0,
                              Math.min(scaledY, miniHeight - scaledHeight)
                            );

                            return (
                              <Rect
                                key={index}
                                x={x}
                                y={y}
                                width={scaledWidth}
                                height={scaledHeight}
                                fill={division.fill}
                                stroke="black"
                                strokeWidth={1}
                              />
                            );
                          })}
                        </Layer>
                      </Stage>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white text-xs px-1 py-1 rounded"
                      onClick={() => {
                        onDeleteLayout(layoutIndex);
                        onCancle();
                      }}
                    >
                      <RiDeleteBin2Fill className="text-xl" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 3: Conditionally render the CustomLayout component in a pop-up/modal */}
      {isCustomLayoutOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-3xl w-full  max-h-[95vh] overflow-auto relative">
            <button
              className="absolute top-2 right-2 bg-transparent-500 text-black hover:text-red-600 px-4 py-2 rounded-2xl"
              onClick={() => setIsCustomLayoutOpen(false)}
            >
              <IoCloseSharp className="text-3xl" />
            </button>
            {/* i want to change for device orientatin */}
            <CustomLayout onSaveLayout={handleSaveNewLayout} />{" "}
            {/* Pass save function */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveLayout;
