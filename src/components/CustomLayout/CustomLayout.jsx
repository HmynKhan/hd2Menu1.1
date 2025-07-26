/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Transformer, Text } from "react-konva";
import PopUpMessage from "../PopUpMessage";
import { IoMdAdd } from "react-icons/io";
import { FaSave } from "react-icons/fa";

const CustomLayout = ({ onSaveLayout, editingLayout, onUpdateLayout, fetchLayouts }) => {


  console.log("editingLayout",editingLayout);
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


  // const scaleFactor = resolutionMapping[resolution].height / stageHeight; // Scale height to the resolution
  const scaleFactor = resolutionMapping[resolution].width / stageWidth; // Scale width properly

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
  
    if (editingLayout) {
      setLayoutName(editingLayout.name || "");
      // setResolution(editingLayout.width === 1920 ? "fullhd" : editingLayout.width === 1280 ? "hd" : "fourk");
      // setOrientation(editingLayout.layout === "landscape" ? "horizontal" : "vertical");

      const isVertical = editingLayout.layout === "portrait";

setResolution(
  isVertical
    ? (editingLayout.height === 1920 ? "fullhd" : editingLayout.height === 1280 ? "hd" : "fourk")
    : (editingLayout.width === 1920 ? "fullhd" : editingLayout.width === 1280 ? "hd" : "fourk")
);

setOrientation(isVertical ? "vertical" : "horizontal");

// Set correct stage dimensions
setStageDimensions({
  width: isVertical ? stageHeight : stageWidth,
  height: isVertical ? stageWidth : stageHeight,
});


    
      // Convert layout divisions to fit within stage
      const stageWidth1 = 400;
      const stageHeight1 = 300;

      const scaleFactorX = isVertical
        ? stageHeight1 / editingLayout.width
        : stageWidth1 / editingLayout.width;
      
      const scaleFactorY = isVertical
        ? stageWidth1 / editingLayout.height
        : stageHeight1 / editingLayout.height;
          
        setDivisions(
          editingLayout.divisions.map(division => ({
            ...division,
            x: division.x * scaleFactorX,
            y: division.y * scaleFactorY,
            width: division.width * scaleFactorX,
            height: division.height * scaleFactorY
          }))
        );
        
    }
      }, [message, editingLayout]);
    
const generateUniqueColor = (index) => {
  const hue = (index * 137) % 360;
  const saturation = 40; // reduce saturation to make it softer
  const lightness = 89; // increased from 70 to 85 for lighter color
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
      id: `${divisions.length + 1}`,
    };

    setDivisions((prevDivisions) => [...prevDivisions, newDivision]);
  };



  // i want to change for divison not in vertical
  const handleSaveLayout = async () => {
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
  
    const savedStageDimensions = orientation === "horizontal"
    ? {
        width: resolutionMapping[resolution].width,
        height: resolutionMapping[resolution].height,
      }
    : {
        width: resolutionMapping[resolution].height, // Swap for vertical
        height: resolutionMapping[resolution].width, // Swap for vertical
      };
  
      
    const savedLayout = {
      name: layoutName,
      stageDimensions: savedStageDimensions,
      orientation: orientation,
      created_by: Date.now().toString(),
      divisions: divisions.map((division) => {
        return orientation === "horizontal"
  ? {
      x: (division.x / stageWidth) * resolutionMapping[resolution].width,
      y: (division.y / stageHeight) * resolutionMapping[resolution].height,
      width: (division.width / stageWidth) * resolutionMapping[resolution].width,
      height: (division.height / stageHeight) * resolutionMapping[resolution].height,
      fill: division.fill,
      id: division.id,
    }
  : {
      x: (division.x / stageHeight) * resolutionMapping[resolution].height, // Adjust for vertical
      y: (division.y / stageWidth) * resolutionMapping[resolution].width, // Adjust for vertical
      width: (division.width / stageHeight) * resolutionMapping[resolution].height, // Adjust width
      height: (division.height / stageWidth) * resolutionMapping[resolution].width, // Adjust height
      fill: division.fill,
      id: division.id,
    };

      }),
    };
      
    console.log("Final Layout Object to Save:", savedLayout);
  
    const token = localStorage.getItem("token"); // Fetch token

    if (!token) {
      setMessage({ text: "Please Login First.", type: "error" });
      return; // Stop execution if token is missing
    }
    
    try {
      const response = await fetch("https://dev.app.hd2.menu/api/store-layout-value", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify(savedLayout),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save layout");
      }
  
      const data = await response.json();
      console.log("Response:", data);
  
      setMessage({ text: "Layout saved successfully!", type: "success" });
  
      await fetchLayouts(); 


      // Reset state
      setLayoutName("");
      setDivisions([]);
      setSelectedDivisionIndex(null);
      setDivisionDetails({ x: "", y: "", width: "", height: "" });
      setResolution("hd");
    } catch (error) {
      console.error("Error saving layout:", error);
      setMessage({ text: "Failed to save layout. Please try again.", type: "error" });
    }
  };
  

  const handleUpdateLayout = () => {
    const scaleFactorX = editingLayout.width / stageWidth;
    const scaleFactorY = editingLayout.height / stageHeight;
    

    // const updatedLayout = {
    //   id: editingLayout.id,
    //   name: layoutName,
    //   stageDimensions: {
    //     width: resolutionMapping[resolution].width,
    //     height: resolutionMapping[resolution].height,
    //   },
    //   orientation,
    //   divisions: JSON.stringify(divisions.map(division => ({
    //     x: division.x * scaleFactorX, 
    //     y: division.y * scaleFactorY,
    //     id: division.id, 
    //     fill: division.fill, 
    //     width: division.width * scaleFactorX,
    //     height: division.height * scaleFactorY
    //   })))    };
    const updatedLayout = {
      id: editingLayout.id,
      name: layoutName,
      stageDimensions: orientation === "vertical"
          ? { width: resolutionMapping[resolution].height, height: resolutionMapping[resolution].width } // Swap for vertical
          : { width: resolutionMapping[resolution].width, height: resolutionMapping[resolution].height },
  
      orientation: orientation,
      divisions: divisions.map(division => ({
          x: orientation === "vertical"
              ? (division.x / stageHeight) * resolutionMapping[resolution].height // Swap for vertical
              : (division.x / stageWidth) * resolutionMapping[resolution].width,
          y: orientation === "vertical"
              ? (division.y / stageWidth) * resolutionMapping[resolution].width
              : (division.y / stageHeight) * resolutionMapping[resolution].height,
          width: orientation === "vertical"
              ? (division.width / stageHeight) * resolutionMapping[resolution].height
              : (division.width / stageWidth) * resolutionMapping[resolution].width,
          height: orientation === "vertical"
              ? (division.height / stageWidth) * resolutionMapping[resolution].width
              : (division.height / stageHeight) * resolutionMapping[resolution].height,
          fill: division.fill, 
          id: division.id 
      }))
  };
            
    onUpdateLayout(updatedLayout); // Send updated data back to SaveLayout

console.log("Final Layout Object to Update:", JSON.stringify(updatedLayout, null, 2));


};
    
  

const handleDragMove = (index, event) => {
  const shape = event.target;
  let newX = shape.x();
  let newY = shape.y();
  let newWidth = shape.width();
  let newHeight = shape.height();

  // Get current stage dimensions
  const stageW = orientation === "vertical" ? stageHeight : stageWidth;
  const stageH = orientation === "vertical" ? stageWidth : stageHeight;

  // Restrict division within layout boundaries
  newX = Math.max(0, Math.min(newX, stageW - newWidth));
  newY = Math.max(0, Math.min(newY, stageH - newHeight));

  shape.x(newX);
  shape.y(newY);

  const updatedDivisions = [...divisions];
  updatedDivisions[index] = {
    ...updatedDivisions[index],
    x: newX,
    y: newY,
  };

  setDivisions(updatedDivisions);
  setDivisionDetails({
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
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
  
    if (!shape) return;
  
    let newX = shape.x();
    let newY = shape.y();
    let newWidth = shape.width() * shape.scaleX();
    let newHeight = shape.height() * shape.scaleY();
  
    // Get current stage dimensions
    const stageW = orientation === "vertical" ? stageHeight : stageWidth;
    const stageH = orientation === "vertical" ? stageWidth : stageHeight;
  
    // Restrict resizing within layout boundaries
    newWidth = Math.min(newWidth, stageW - newX);
    newHeight = Math.min(newHeight, stageH - newY);
    
    newX = Math.max(0, Math.min(newX, stageW - newWidth));
    newY = Math.max(0, Math.min(newY, stageH - newHeight));
  
    shape.width(newWidth / shape.scaleX());
    shape.height(newHeight / shape.scaleY());
    shape.scaleX(1);
    shape.scaleY(1);
    shape.x(newX);
    shape.y(newY);
  
    const updatedDivisions = [...divisions];
    updatedDivisions[index] = {
      ...updatedDivisions[index],
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };
  
    setDivisions(updatedDivisions);
    setDivisionDetails({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      id: shape.id(),
    });
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
              {(divisions || []).map((rect, index) => (
                  <React.Fragment key={rect.id}>
                    
                    <Rect
                      x={rect.x}
                      y={rect.y}
                      width={rect.width}
                      height={rect.height}
                      fill={rect.fill}
                      // strokeWidth={1.0}
                      // stroke='black'
                      draggable
                      onDragMove={(e) => handleDragMove(index, e)}
                      onClick={() => handleClickDivision(index)}
                      ref={(node) => {
                        shapeRefs.current[index] = node;
                      }}
                    />
                  {/* <Text
                    x={rect.x + 5}
                    y={rect.y + 5}
                    text={`${rect?.id.replace("rect-", "")}`}
                    fontSize={12}
                    fill="black"
                    width={rect.width}
                    height={rect.height}
                  /> */}
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
  onClick={editingLayout ? handleUpdateLayout : handleSaveLayout}
  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-2"
>
  <FaSave />
  <span>{editingLayout ? "Update Layout" : "Save Layout"}</span>
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
