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

// // import React from "react";
// import images from "../../assets/images";
// import videos from "../../assets/videos";
// import DraggableMedia from "./DraggableMedia";
// import { useEffect, useState } from "react";
// import request from "../../services/request";

// const ImageGallery = ({ onSelectMedia }) => {
//   // State to store fetched media
//   const [media, setMedia] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch media files from API on component mount
//   useEffect(() => {
//     const fetchMedia = async () => {
//       try {
//         const token = localStorage.getItem("token"); // Ensure the token is correctly stored
//         if (!token) {
//           console.error("No token found, redirecting to login.");
//           return; // Redirect or handle missing token
//         }

//         const response = await request({
//           url: "/files/my",
//           method: "get",
//           params: { page: 1 },
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         setMedia(response.data.data); // Assuming response.data.data holds media list
//       } catch (error) {
//         if (error.response && error.response.status === 401) {
//           console.error("Token is invalid or expired. Please login again.");
//           // Redirect to login or handle token refresh if necessary
//         } else {
//           console.error("Error fetching media", error);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMedia();
//   }, []);

//   console.log("debug token  : ", localStorage.getItem("token"));
//   return (
//     <div className="p-2">
//       <div className="border-2 border-gray-200 p-2 rounded">
//         {/* Header */}
//         <h2 className="text-2xl font-bold mb-4">Images & Videos Gallery</h2>

//         {loading ? (
//           <p>Loading...</p>
//         ) : (
//           <>
//             {/* Image Gallery */}
//             <div className="flex flex-wrap gap-3 mb-4 cursor-pointer">
//               {media
//                 .filter((item) => item.file_type === "image")
//                 .map((image) => (
//                   <DraggableMedia
//                     key={image.id}
//                     id={image.id}
//                     src={`${baseURL}/${image.file_path}`} // Use dynamic src for images
//                     type="image"
//                     onSelect={() => onSelectMedia(image.file_path, image.id)}
//                   />
//                 ))}
//             </div>

//             {/* Video Gallery */}
//             <div className="flex flex-wrap gap-3 cursor-pointer">
//               {media
//                 .filter((item) => item.file_type === "video")
//                 .map((video) => (
//                   <DraggableMedia
//                     key={video.id}
//                     id={video.id}
//                     src={`${baseURL}/${video.file_path}`} // Use dynamic src for videos
//                     type="video"
//                     onSelect={() => onSelectMedia(video.file_path, video.id)}
//                   />
//                 ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ImageGallery;
