import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import PopUpMessage from "../PopUpMessage";

const CustomLayout = ({ onSaveLayout }) => {
  const [layoutName, setLayoutName] = useState("");
  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState(null);
  const [divisionDetails, setDivisionDetails] = useState({
    x: "",
    y: "",
    width: "",
    height: "",
    id: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [resolution, setResolution] = useState("fullhd");

  const stageWidth = 400;
  const stageHeight = 300;

  const shapeRefs = useRef([]);
  const transformerRefs = useRef([]);
  const layoutRef = useRef(null);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const generateUniqueColor = (index) => {
    const hue = (index * 137) % 360;
    const saturation = 60;
    const lightness = 70;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const handleAddDivision = () => {
    const newDivision = {
      x: 0,
      y: 0,
      width: 200,
      height: 150,
      fill: generateUniqueColor(divisions.length),
      id: `rect-${divisions.length + 1}`,
    };
    setDivisions((prevDivisions) => [...prevDivisions, newDivision]);
  };

  const handleSaveLayout = () => {
    if (!layoutName) {
      setMessage({ text: "Layout name cannot be empty.", type: "error" });
      return;
    }
    if (divisions.length === 0) {
      setMessage({
        text: "At least one division must be added.",
        type: "error",
      });
      return;
    }

    // Ensure that the positions and other attributes of the divisions are saved correctly
    const savedLayout = {
      name: layoutName,
      resolution,
      divisions: divisions.map((division) => ({
        x: division.x,
        y: division.y,
        width: division.width,
        height: division.height,
        fill: division.fill,
        id: division.id,
      })),
    };

    onSaveLayout(savedLayout);

    console.log("Layout saved:", savedLayout);
    setMessage({ text: "Layout saved successfully!", type: "success" });

    // Reset layout details
    setLayoutName("");
    setDivisions([]);
    setSelectedDivisionIndex(null);
    setDivisionDetails({ x: "", y: "", width: "", height: "" });
    setResolution("fullhd");
  };

  const handleDragMove = (index, event) => {
    const shape = event.target;
    let newX = shape.x();
    let newY = shape.y();
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + shape.width() > stageWidth)
      newX = stageWidth - 1 - shape.width();
    if (newY + shape.height() > stageHeight)
      newY = stageHeight - 1 - shape.height();
    shape.x(newX);
    shape.y(newY);

    const updatedDivisions = [...divisions];
    updatedDivisions[index] = {
      ...updatedDivisions[index],
      x: newX,
      y: newY,
      width: shape.width(),
      height: shape.height(),
    };
    setDivisions(updatedDivisions);
    setDivisionDetails({
      x: newX,
      y: newY,
      width: shape.width(),
      height: shape.height(),
      id: shape.id(),
    });
  };

  const handleClickDivision = (index) => {
    setSelectedDivisionIndex(index);
    const division = divisions[index];
    setDivisionDetails({
      index: index + 1,
      x: division.x,
      y: division.y,
      width: division.width,
      height: division.height,
    });
  };

  const handleDeleteDivision = () => {
    if (selectedDivisionIndex !== null) {
      const updatedDivisions = divisions.filter(
        (_, index) => index !== selectedDivisionIndex
      );
      setDivisions(updatedDivisions);
      setSelectedDivisionIndex(null);
      setDivisionDetails({ x: "", y: "", width: "", height: "" });
    }
  };

  const handleTransformEnd = (index, event) => {
    const shape = shapeRefs.current[index];
    const transformer = transformerRefs.current[index];

    if (shape && transformer) {
      const newX = shape.x();
      const newY = shape.y();
      const newWidth = shape.width() * shape.scaleX();
      const newHeight = shape.height() * shape.scaleY();

      const constrainedWidth = Math.min(newWidth, stageWidth - newX);
      const constrainedHeight = Math.min(newHeight, stageHeight - newY);

      const constrainedX = Math.max(
        0,
        Math.min(newX, stageWidth - constrainedWidth)
      );
      const constrainedY = Math.max(
        0,
        Math.min(newY, stageHeight - constrainedHeight)
      );

      shape.width(constrainedWidth);
      shape.height(constrainedHeight);
      shape.scaleX(1);
      shape.scaleY(1);
      shape.x(constrainedX);
      shape.y(constrainedY);

      const updatedDivisions = [...divisions];
      updatedDivisions[index] = {
        ...updatedDivisions[index],
        x: constrainedX,
        y: constrainedY,
        width: constrainedWidth,
        height: constrainedHeight,
      };
      setDivisions(updatedDivisions);
      setDivisionDetails({
        x: constrainedX,
        y: constrainedY,
        width: constrainedWidth,
        height: constrainedHeight,
        id: shape.id(),
      });
    }
  };

  return (
    <div className="p-2">
      <div className="border-2 border-gray-200 p-2 rounded">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4 text-center">
          Create Custom Layout
        </h1>

        {/* Resolution */}
        <div className="mb-4 ml-3">
          <label className="font-semibold mr-2">Device Resolution: </label>
          <select
            value={resolution}
            onChange={(e) => {
              setResolution(e.target.value);
              console.log(
                "Selected Resolution in CustomLayout:",
                e.target.value
              ); // Log the selected resolution
            }}
            className="border rounded px-2 py-1"
          >
            <option value="hd">HD 720P</option>
            <option value="fullhd">Full HD 1080P</option>
            <option value="fourk">4k Ultra HD</option>
          </select>
        </div>

        {/* Input & Button */}
        <div className="mb-4 flex flex-col justify-center items-center gap-2">
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            placeholder="Enter layout name"
            className="border rounded px-3 py-2 w-full"
          />
          <div>
            <button
              onClick={handleSaveLayout}
              className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-700"
            >
              Save Layout
            </button>
            <button
              onClick={handleAddDivision}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700"
            >
              Add Division
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="flex items-center justify-center mb-2">
          <div
            className="border-2 border-black"
            ref={layoutRef}
            style={{
              width: `${stageWidth}px`,
              height: `${stageHeight}px`,
            }}
          >
            <Stage width={stageWidth} height={stageHeight}>
              <Layer>
                {divisions.map((rect, index) => (
                  <React.Fragment key={rect.id}>
                    <Rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill={rect.fill}
                      draggable
                      onDragMove={(e) => handleDragMove(index, e)}
                      onClick={() => handleClickDivision(index)}
                      ref={(node) => {
                        shapeRefs.current[index] = node;
                      }}
                    />
                    {selectedDivisionIndex === index && (
                      <Transformer
                        ref={(node) => {
                          transformerRefs.current[index] = node;
                          if (node && shapeRefs.current[index]) {
                            node.nodes([shapeRefs.current[index]]);
                            node.getLayer().batchDraw();
                          }
                        }}
                        onTransformEnd={(e) => handleTransformEnd(index, e)}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Division Controller */}
        {selectedDivisionIndex !== null && (
          <div className="flex items-center justify-center mb-4">
            <div className="border-2 border-gray-300 rounded w-full max-w-3xl px-3 py-1">
              <div className="flex flex-wrap gap-5 text-xs items-center">
                <h2 className="text-md font-semibold">
                  Division {selectedDivisionIndex + 1}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="font-semibold">x:</label>
                  <input
                    type="number"
                    value={divisionDetails.x}
                    readOnly
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold">y:</label>
                  <input
                    type="number"
                    value={divisionDetails.y}
                    readOnly
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold">Width:</label>
                  <input
                    type="number"
                    value={divisionDetails.width}
                    readOnly
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold">Height:</label>
                  <input
                    type="number"
                    value={divisionDetails.height}
                    readOnly
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
                <button
                  onClick={handleDeleteDivision}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Popup Message */}
      {message.text && (
        <PopUpMessage
          message={message.text}
          type={message.type}
          onClose={() => setMessage({ text: "", type: "" })}
        />
      )}
    </div>
  );
};

export default CustomLayout;
