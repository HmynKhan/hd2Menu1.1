// import React from "react";
import images from "../../assets/images";
import videos from "../../assets/videos";
import DraggableMedia from "./DraggableMedia";

const ImageGallery = ({ onSelectMedia }) => {
  return (
    <div className="p-2">
      <div className="border-2 border-gray-200 p-2 rounded">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-4">Images & Videos Gallery</h2>

        {/* Image Gallery */}
        <div className="flex flex-wrap gap-3 mb-4 cursor-pointer">
          {images.map((image) => (
            <DraggableMedia
              key={image.id}
              id={image.id}
              src={image.src}
              type="image"
              onSelect={() => onSelectMedia(image.src, image.id)}
            />
          ))}
        </div>

        {/* Video Gallery */}
        <div className="flex flex-wrap gap-3 cursor-pointer">
          {videos.map((video) => (
            <DraggableMedia
              key={video.id}
              id={video.id}
              src={video.src}
              type="video"
              onSelect={() => onSelectMedia(video.src, video.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
