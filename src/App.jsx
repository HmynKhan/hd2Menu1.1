import { useState, useEffect } from "react";
import CustomLayout from "./components/CustomLayout/CustomLayout";
import SaveLayout from "./components/SaveLayout/SaveLayout";
import ImageGallery from "./components/Image&Gallery/ImageGallery";
import Timeline from "./components/Timeline/Timeline";

const App = () => {
  const [layouts, setLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(null);

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

  // Delete a layout based on its index
  const deleteLayout = (layoutIndex) => {
    const updatedLayouts = layouts.filter((_, index) => index !== layoutIndex);
    setLayouts(updatedLayouts);
    localStorage.setItem("layouts", JSON.stringify(updatedLayouts));

    // If the deleted layout is the current one, clear the current layout
    if (layoutIndex === currentLayoutIndex) {
      setCurrentLayout(null);
      setCurrentLayoutIndex(null);
    }
  };

  // Load a layout by setting it as the current layout
  const loadLayout = (layoutIndex) => {
    const selectedLayout = layouts[layoutIndex];
    setCurrentLayout(selectedLayout);
    setCurrentLayoutIndex(layoutIndex);
  };

  const removeloadLayout = () => {
    setCurrentLayout(null);
    setCurrentLayoutIndex(null);
  };

  return (
    <div>
      <CustomLayout onSaveLayout={saveLayout} />
      <SaveLayout
        layouts={layouts}
        onDeleteLayout={deleteLayout}
        onLoadLayout={loadLayout}
        currentLayoutIndex={currentLayoutIndex}
      />
      <Timeline layout={currentLayout} onCancle={removeloadLayout} />
      <ImageGallery />
    </div>
  );
};

export default App;
