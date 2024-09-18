import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from './App.jsx'
import "./index.css";
// import Practice from "./Practice.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    {/* <Practice /> */}
  </StrictMode>
);
