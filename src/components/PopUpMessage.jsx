// import React from "react";

const PopUpMessage = ({ message, type }) => {
  const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
  const textColor = "text-white";

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} ${textColor} p-3 rounded shadow-lg`}
    >
      <div>{message}</div>
    </div>
  );
};

export default PopUpMessage;
