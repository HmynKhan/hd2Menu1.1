import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import PopUpMessage from "../PopUpMessage";
import { IoMdAdd } from "react-icons/io";
import { FaSave } from "react-icons/fa";

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
  const [resolution, setResolution] = useState("hd");
  const [orientation, setOrientation] = useState("horizontal");
  const stageWidth = 400;
  const stageHeight = 300;

  const resolutionMapping = {
    hd: { width: 1280, height: 720 },
    fullhd: { width: 1920, height: 1080 },
    fourk: { width: 3840, height: 2160 },
  };


  const scaleFactor = resolutionMapping[resolution].height / stageHeight; // Scale height to the resolution

  const [stageDimensions, setStageDimensions] = useState({
    width: stageWidth, // Horizontal width
    height: stageHeight, // Horizontal height
  });

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
    // const color = "#ccc";
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    // return color;
  };

  const handleAddDivision = () => {
    const maxHeight = resolutionMapping[resolution].height;
    const maxWidth = resolutionMapping[resolution].width;

    // Default size for the new division
    let newWidth, newHeight;

    if (orientation === "vertical") {
      // For vertical, swap width and height based on resolution
      newWidth = Math.min(maxHeight / 2, stageHeight);
      newHeight = Math.min(maxWidth / 2, stageWidth);
    } else {
      // For horizontal, default width and height
      newWidth = Math.min(maxWidth / 2, stageWidth);
      newHeight = Math.min(maxHeight / 2, stageHeight);
    }

    const newDivision = {
      x: 0,
      y: 0,
      width: newWidth / 2,
      height: newHeight / 2,
      fill: generateUniqueColor(divisions.length),
      id: `rect-${divisions.length + 1}`,
    };

    setDivisions((prevDivisions) => [...prevDivisions, newDivision]);
  };



  // i want to change for divison not in vertical
  const handleSaveLayout = () => {
    console.log("Saving Layout...");
    console.log("Current Orientation:", orientation);
    console.log("Current Resolution:", resolution);

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

    // Check the orientation and swap width and height if vertical
    const savedStageDimensions =
      orientation === "vertical"
        ? {
          width: stageHeight, // Swap stage width and height for vertical
          height: stageWidth,
        }
        : {
          width: stageWidth, // Keep as is for horizontal
          height: stageHeight,
        };

    // Modify divisions based on orientation
    const savedDivisions = divisions.map((division) => {
      if (orientation === "vertical") {
        return {
          x: division.y, // Swap x and y for vertical
          y: division.x,
          width: division.height, // Swap width and height for vertical
          height: division.width,
          fill: division.fill,
          id: division.id,
        };
      } else {
        return {
          x: division.x,
          y: division.y,
          width: division.width,
          height: division.height,
          fill: division.fill,
          id: division.id,
        };
      }
    });

    // console.log("Divisions to Save:", savedDivisions);

    // Final layout object to be saved
    const savedLayout = {
      name: layoutName,
      resolution, // Save the selected resolution
      orientation, // Save the current orientation
      stageDimensions: savedStageDimensions, // Save swapped layout dimensions
      divisions: savedDivisions, // Save divisions with swapped properties for vertical
    };

    console.log("Final Layout Object to Save:", orientation, savedLayout);

    // Call the parent onSaveLayout function to save the layout
    onSaveLayout(savedLayout);

    // Reset the state after saving
    setMessage({ text: "Layout saved successfully!", type: "success" });
    setLayoutName("");
    setDivisions([]);
    setSelectedDivisionIndex(null);
    setDivisionDetails({ x: "", y: "", width: "", height: "" });
    setResolution("hd");
  };

  const handleDragMove = (index, event) => {
    const shape = event.target;
    let newX = shape.x();
    let newY = shape.y();

    // Adjust stage width and height based on current orientation
    const currentStageWidth =
      orientation === "vertical" ? stageHeight : stageWidth;
    const currentStageHeight =
      orientation === "vertical" ? stageWidth : stageHeight;

    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;
    if (newX + shape.width() > currentStageWidth)
      newX = currentStageWidth - 1 - shape.width();
    if (newY + shape.height() > currentStageHeight)
      newY = currentStageHeight - 1 - shape.height();
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

  const handleDeleteDivision = (index) => {
    const updatedDivisions = divisions.filter((_, i) => i !== index);
    setDivisions(updatedDivisions);
    if (selectedDivisionIndex === index) {
      setSelectedDivisionIndex(null);
      setDivisionDetails({ x: "", y: "", width: "", height: "" });
    }
  };

  // 111234567
  const handleTransformEnd = (index, event) => {
    const shape = shapeRefs.current[index];
    const transformer = transformerRefs.current[index];

    if (shape && transformer) {
      let newX = shape.x();
      let newY = shape.y();
      let newWidth = shape.width() * shape.scaleX();
      let newHeight = shape.height() * shape.scaleY();

      const maxHeight = resolutionMapping[resolution].height; // Maximum allowed height
      const maxWidth = resolutionMapping[resolution].width;  // Maximum allowed width

      // Ensure width and height stay within the resolution's boundaries
      const constrainedWidth = Math.min(newWidth, maxWidth - newX);
      const constrainedHeight = Math.min(newHeight, maxHeight - newY);

      // Ensure x and y stay within the resolution's boundaries
      const constrainedX = Math.max(0, Math.min(newX, maxWidth - constrainedWidth));
      const constrainedY = Math.max(0, Math.min(newY, maxHeight - constrainedHeight));

      shape.width(constrainedWidth / shape.scaleX());
      shape.height(constrainedHeight / shape.scaleY());
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

  const handleOrientationChange = (newOrientation) => {
    setOrientation(newOrientation);

    const currentResolution = resolutionMapping[resolution];

    if (newOrientation === "vertical") {
      setStageDimensions({
        width: stageHeight,
        height: stageWidth,
      });

      setDivisions((prevDivisions) =>
        prevDivisions.map((division) => ({
          ...division,
          x: division.y, // Swap x and y
          y: division.x,
          width: division.height, // Swap width and height
          height: division.width,
        }))
      );

      setDivisionDetails((prevDetails) => ({
        ...prevDetails,
        x: prevDetails.y, // Swap x and y in details
        y: prevDetails.x,
        width: prevDetails.height, // Swap width and height in details
        height: prevDetails.width,
      }));
    } else {
      setStageDimensions({
        width: stageWidth,
        height: stageHeight,
      });

      setDivisions((prevDivisions) =>
        prevDivisions.map((division) => ({
          ...division,
          x: division.y, // Swap x and y back
          y: division.x,
          width: division.height, // Swap width and height back
          height: division.width,
        }))
      );

      setDivisionDetails((prevDetails) => ({
        ...prevDetails,
        x: prevDetails.y, // Swap x and y back in details
        y: prevDetails.x,
        width: prevDetails.height, // Swap width and height back in details
        height: prevDetails.width,
      }));
    }
  };





  const handleDivisionChange = (index, property, value) => {
    const updatedDivisions = [...divisions];
    updatedDivisions[index] = {
      ...updatedDivisions[index],
      [property]: parseFloat(value),
    };
    setDivisions(updatedDivisions);
  };

  const handleStageClick = (event) => {
    // Deselect the selected division if the click is not on a division
    if (event.target === event.target.getStage()) {
      setSelectedDivisionIndex(null); // Deselect
      setDivisionDetails({ x: "", y: "", width: "", height: "" }); // Clear details
    }
  };

  return (
    <div className="p-2 ">
      <div className=" p-2 rounded">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4 text-center">
          Create Custom Layout
        </h1>

        {/* Layout Name and Device Resolution */}
        <div className="mb-4 flex flex-col gap-2">
          {/* Layout Name */}
          <div className="flex items-center justify-between">
            <label className="font-semibold mr-2">Enter Layout Name:</label>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder="Enter layout name"
              className="border rounded px-3 py-2 w-6/12"
            />
          </div>

          {/* Device Resolution */}
          <div className="flex items-center justify-between">
            <label className="font-semibold mr-2">Device Resolution:</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="hd">HD 720P</option>
              <option value="fullhd">Full HD 1080P</option>
              <option value="fourk">4k Ultra HD</option>
            </select>
          </div>
        </div>

        {/* i want to add device orientation */}
        {/* Device Orientation */}
        <div className="mb-4 flex items-center justify-between">
          <label className="font-semibold mr-2">Device Orientation:</label>
          <div className="flex items-center">
            <label className="mr-4">
              <input
                type="radio"
                value="horizontal"
                checked={orientation === "horizontal"}
                onChange={() => handleOrientationChange("horizontal")}
                className="mr-1"
              />
              Horizontal
            </label>
            <label>
              <input
                type="radio"
                value="vertical"
                checked={orientation === "vertical"}
                onChange={() => handleOrientationChange("vertical")}
                className="mr-1"
              />
              Vertical
            </label>
          </div>
        </div>

        {/* Layout */}
        <div className="flex items-center justify-center mb-2">
          <div
            className="border border-black"
            ref={layoutRef}
            style={{
              width: `${stageDimensions.width}px`,
              height: `${stageDimensions.height}px`,
            }}
          >
            <Stage
              width={stageDimensions.width}
              height={stageDimensions.height}
              onClick={handleStageClick}
            >
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

        {/* Input & Button */}
        <div className="mb-4 flex justify-center items-center gap-2">
          <button
            onClick={handleSaveLayout}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaSave />
            <span>Save Layout</span>
          </button>
          <button
            onClick={handleAddDivision}
            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <IoMdAdd />
            <span>Add Division</span>
          </button>
        </div>

        {/* Division Controllers */}
        <div className="flex flex-col items-center mb-4 gap-4">
          {divisions.map((division, index) => (
            <div
              key={division.id}
              className={`border-2 ${selectedDivisionIndex === index ? "border-blue-500" : "border-gray-300"
                } rounded w-full max-w-3xl px-3 py-2`}
            >
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <h2 className="text-md font-semibold">
                  Division {index + 1} {selectedDivisionIndex === index && "(Selected)"}
                </h2>
                <div className="flex items-center gap-1">
                  <label className="font-semibold">y:</label>
                  <input
                    type="number"
                    value={division.y}
                    onChange={(e) => handleDivisionChange(index, "y", e.target.value)}
                    className="border rounded px-1 py-1 w-12"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="font-semibold">x:</label>
                  <input
                    type="number"
                    value={division.x}
                    onChange={(e) => handleDivisionChange(index, "x", e.target.value)}
                    className="border rounded px-1 py-1 w-12"
                  />
                </div>
                {/* Proportional Width */}
                <div className="flex items-center gap-1">
                  <label className="font-semibold">Width:</label>
                  <span className="text-sm">
                    {orientation === "vertical"
                      ? Math.round((division.height / stageWidth) * resolutionMapping[resolution].height)
                      : Math.round((division.width / stageWidth) * resolutionMapping[resolution].width)}
                  </span>
                </div>

                {/* Proportional Height */}
                <div className="flex items-center gap-1">
                  <label className="font-semibold">Height:</label>
                  <span className="text-sm">
                    {orientation === "vertical"
                      ? Math.round((division.width / stageHeight) * resolutionMapping[resolution].width)
                      : Math.round((division.height / stageHeight) * resolutionMapping[resolution].height)}
                  </span>
                </div>


                {/* Delete Button */}
                <div className="flex items-center ml-auto">
                  <button
                    onClick={() => handleDeleteDivision(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
