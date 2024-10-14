// VideoForm.jsx
import { useState, useContext } from "react";
import { PlaylistContext } from "../../App";

const VideoForm = () => {
  const [playlistNameInput, setPlaylistNameInput] = useState("");
  const context = useContext(PlaylistContext);
  const setPlaylistName = context?.setPlaylistName || (() => {});

  // Update playlist name in context whenever the input value changes
  const handleInputChange = (e) => {
    setPlaylistNameInput(e.target.value);
    setPlaylistName(e.target.value); // Update global playlist name
    // setPlaylistNameInput()
  };

  return (
    <form className="p-6 w-full mx-auto bg-#f7f8fa shadow-md rounded-md">
      <div className="flex items-center gap-4 mt-4">
        <label className="text-sm font-medium">Playlist Name</label>
        <input
          type="text"
          value={playlistNameInput}
          onChange={handleInputChange} // Use handleInputChange to update the global state
          className="border border-gray-300 p-2 rounded flex-1"
          placeholder="Playlist Name"
        />
      </div>
    </form>
  );
};

export default VideoForm;
