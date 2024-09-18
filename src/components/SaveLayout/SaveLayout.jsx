import React from "react";
import { Stage, Layer, Rect } from "react-konva";

const SaveLayout = ({
  layouts,
  onDeleteLayout,
  onLoadLayout,
  currentLayoutIndex,
}) => {
  return (
    <div className="p-2">
      <div className="border-2 border-gray-200 p-2 rounded">
        <h2 className="text-2xl font-bold mb-4">Saved Layouts</h2>
        {layouts.length === 0 ? (
          <p>No layouts saved yet.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {layouts.map((layout, layoutIndex) => {
              const scaleFactor = 4;
              const miniWidth = 100;
              const miniHeight = 70;

              const isLoaded = layoutIndex === currentLayoutIndex;

              return (
                <div
                  key={layoutIndex}
                  className={`border border-gray-300 rounded p-2 ${
                    isLoaded ? "shadow-blue-500 shadow-md" : ""
                  }`}
                >
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

                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                      onClick={() => onLoadLayout(layoutIndex)}
                    >
                      Load
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                      onClick={() => onDeleteLayout(layoutIndex)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveLayout;
