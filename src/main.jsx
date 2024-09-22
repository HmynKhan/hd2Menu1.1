// import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// import Practice from "./Practice.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
    {/* <Practice /> */}
  </React.StrictMode>
);
