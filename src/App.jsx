import { useState, useEffect } from "react";
// import CustomLayout from "./components/CustomLayout/CustomLayout";
import SaveLayout from "./components/SaveLayout/SaveLayout";
import ImageGallery from "./components/Image&Gallery/ImageGallery";
import Timeline from "./components/Timeline/Timeline";
import VideoForm from "./components/VideoForm/VideoForm";

const App = () => {
  const [layouts, setLayouts] = useState([]);
  const [currentLayout, setCurrentLayout] = useState(null);
  console.log(currentLayout, "currentLayout");
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(null);

  // console.log("layout in app.jsx : ", layouts);
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
    setCurrentLayout(selectedLayout);
    setCurrentLayoutIndex(layoutIndex);
    // console.log("selectedLayout in app.jsx : ", selectedLayout);
  };

  return (
    <div>
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
    </div>
  );
};

export default App;
