/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import SaveLayout from "./components/SaveLayout/SaveLayout";
import ImageGallery from "./components/Image&Gallery/ImageGallery";
import Timeline from "./components/Timeline/Timeline";
import VideoForm from "./components/VideoForm/VideoForm";
import PopUpMessage from "./components/PopUpMessage";

export const PlaylistContext = createContext();

const App = () => {
  const [layouts, setLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  // for playlist name video api code start
  const [playlistName, setPlaylistName] = useState("");
  // for playlist name video api code end
  // Load layouts from localStorage on initial render

  // Save a new layout and store it in localStorage
  // const saveLayout = (newLayout) => {
  //   const updatedLayouts = [...layouts, newLayout];
  //   setLayouts(updatedLayouts);
  //   localStorage.setItem("layouts", JSON.stringify(updatedLayouts));
  // };

  const removeloadLayout = () => {
    setCurrentLayout(null);
    setCurrentLayoutIndex(null);
  };


  const fetchLayouts = async () => {
    try {
      const response = await fetch("https://dev.app.hd2.menu/api/user-layouts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`, // Use Bearer token
        },
      });
      setLayouts(response.data.data); // Update state with fresh data
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  // Modify deleteLayout function
  const deleteLayout = async (layoutId) => {
    if (!layoutId) {
      setMessage({ text: "Invalid layout ID", type: "error" });
      return;
    }
  
    try {
      const response = await fetch(`https://dev.app.hd2.menu/api/delete-layout-value/${layoutId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,  // Include token
        },
      });
      
  
      if (!response.ok) {
        throw new Error("Failed to delete layout from server");
      }
  
      console.log(`Layout with ID ${layoutId} deleted successfully`);
  
      setMessage({ text: "Layout deleted successfully!", type: "success" });
  
      // Fetch updated layouts after deletion
      // await fetchLayouts(); 
  
      if (currentLayout && currentLayout.id === layoutId) {
        removeloadLayout();
      }

      setTimeout(() => setMessage({ text: "", type: "" }), 3000); // Hide message after 3 sec

    } catch (error) {
      console.error("Error deleting layout:", error);
      setMessage({ text: "Failed to delete layout. Please try again.", type: "error" });
    }
  

    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };
        
  // Load a layout by setting it as the current layout
  const loadLayout = (layoutIndex) => {
    const selectedLayout = layouts[layoutIndex];

    // Adjust the current layout based on orientation
    const stageDimensions =
      selectedLayout.orientation === "vertical"
        ? {
            width: selectedLayout.stageDimensions.height,
            height: selectedLayout.stageDimensions.width,
          }
        : selectedLayout.stageDimensions;

    // **This is where the divisions' x, y, width, height should be swapped based on the orientation**
    const adjustedDivisions = selectedLayout.divisions.map((division) => {
      if (selectedLayout.orientation === "vertical") {
        return {
          x: division.y, // Swap x and y for vertical
          y: division.x,
          width: division.height, // Swap width and height for vertical
          height: division.width,
        };
      } else {
        return division; // Keep as is for horizontal
      }
    });

    setCurrentLayout({
      ...selectedLayout,
      stageDimensions, // Apply correct dimensions based on orientation
      divisions: adjustedDivisions, // Apply correct division coordinates based on orientation
    });

    setCurrentLayoutIndex(layoutIndex);
  };

  return (
    <PlaylistContext.Provider value={{ playlistName, setPlaylistName }}>
      <h1 className="mt-4 font-bold text-center text-5xl">hd2Menu</h1>
      <VideoForm />

      <SaveLayout
        layouts={layouts}
        onDeleteLayout={deleteLayout}
        onLoadLayout={loadLayout}
        currentLayoutIndex={currentLayoutIndex}
        setLayouts={setLayouts}
        onCancle={removeloadLayout}
        fetchLayouts={fetchLayouts}

      />
      <Timeline layout={currentLayout} onCancle={removeloadLayout} />
      <ImageGallery />
      {message.text && (
        <PopUpMessage
          message={message.text}
          type={message.type}
          onClose={() => setMessage({ text: "", type: "" })}
        />
      )}

    </PlaylistContext.Provider>
  );
};

export default App;
