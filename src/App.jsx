import { createContext, useState, useEffect } from "react";
import SaveLayout from "./components/SaveLayout/SaveLayout";
import ImageGallery from "./components/Image&Gallery/ImageGallery";
import Timeline from "./components/Timeline/Timeline";
import VideoForm from "./components/VideoForm/VideoForm";

export const PlaylistContext = createContext();

const App = () => {
  const [layouts, setLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(null);

  // for playlist name video api code start
  const [playlistName, setPlaylistName] = useState("");
  // for playlist name video api code end
  // Load layouts from localStorage on initial render
  useEffect(() => {
    const storedLayouts = JSON.parse(localStorage.getItem("layouts")) || [];
    setLayouts(storedLayouts);
  }, []);

  // Save a new layout and store it in localStorage
  const saveLayout = (newLayout) => {
    const updatedLayouts = [...layouts, newLayout];
    setLayouts(updatedLayouts);
    localStorage.setItem("layouts", JSON.stringify(updatedLayouts));
  };

  const removeloadLayout = () => {
    setCurrentLayout(null);
    setCurrentLayoutIndex(null);
  };
  // Modify deleteLayout function
  const deleteLayout = (layoutIndex) => {
    const updatedLayouts = layouts.filter((_, index) => index !== layoutIndex);
    setLayouts(updatedLayouts);
    localStorage.setItem("layouts", JSON.stringify(updatedLayouts));

    // If the deleted layout is the current one, clear the current layout
    if (layoutIndex === currentLayoutIndex) {
      removeloadLayout();
    }
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

      {/* <CustomLayout onSaveLayout={saveLayout} /> */}

      <SaveLayout
        layouts={layouts}
        onDeleteLayout={deleteLayout}
        onLoadLayout={loadLayout}
        currentLayoutIndex={currentLayoutIndex}
        setLayouts={setLayouts}
        onCancle={removeloadLayout}
      />
      <Timeline layout={currentLayout} onCancle={removeloadLayout} />
      <ImageGallery />
    </PlaylistContext.Provider>
  );
};

export default App;
