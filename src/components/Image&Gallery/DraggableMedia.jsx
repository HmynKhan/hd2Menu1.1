// import React from "react";

const DraggableMedia = ({ id, src, type, onSelect }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("mediaSrc", src);
    e.dataTransfer.setData("mediaId", id);
    e.dataTransfer.setData("mediaType", type);
  };

  return (
    <div
      className="cursor-move cursor-pointer"
      draggable
      onDragStart={handleDragStart}
      onClick={onSelect}
    >
      {type === "image" ? (
        <img
          src={src}
          alt={`media-${id}`}
          className="w-[60px] h-[40px] object-cover"
        />
      ) : (
        <video
          src={src}
          className="w-[60px] h-[40px] object-cover"
          // autoPlay
          muted
          // loop
        />
      )}
    </div>
  );
};

export default DraggableMedia;
