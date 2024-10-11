import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

const VideoForm = () => {
  // State management for form fields
  // const [fromDate, setFromDate] = useState("");
  // const [fromTime, setFromTime] = useState("");
  // const [toDate, setToDate] = useState("");
  // const [toTime, setToTime] = useState("");
  // const [days, setDays] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  // const [playlistType, setPlaylistType] = useState("");
  // const [devices, setDevices] = useState("");
  // const [message, setMessage] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform necessary actions on form submit
    console.log({
      // fromDate,
      // fromTime,
      // toDate,
      // toTime,
      // days,
      playlistName,
      // playlistType,
      // devices,
      // message,
    });
    // alert("Form Submitted!");
  };

  return (
    <form
      className="p-6 w-full mx-auto bg-#f7f8fa shadow-md rounded-md"
      onSubmit={handleSubmit}
    >
      {/* 1st Row: From Date, From Time, To Date, To Time */}
      {/* <div className="grid grid-cols-4 gap-4">
 
        <div>
          <label className="block mb-1 text-sm font-medium">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            placeholder="mm/dd/yyyy"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">From Time</label>
          <input
            type="time"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            placeholder="mm/dd/yyyy"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">To Time</label>
          <input
            type="time"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          />
        </div>
      </div> */}

      {/* 2nd Row: Days */}
      {/* <div className="grid grid-cols-1 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Days</label>
          <input
            type="text"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            placeholder="Enter number of days"
          />
        </div>
      </div> */}

      {/* 3rd Row: Playlist Name, Playlist Type, Select Devices */}
      <div className="flex items-center gap-4 mt-4">
        {/* Playlist Name */}
        <label className="text-sm font-medium">Playlist Name</label>
        <input
          type="text"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          className="border border-gray-300 p-2 rounded flex-1"
          placeholder="Playlist Name"
        />

        {/* Playlist Type */}
        {/* <div>
          <label className="block mb-1 text-sm font-medium">
            Playlist Type
          </label>
          <select
            value={playlistType}
            onChange={(e) => setPlaylistType(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">--Select--</option>
            <option value="type1">Type 1</option>
            <option value="type2">Type 2</option>
            <option value="type3">Type 3</option>
          </select>
        </div> */}

        {/* Select Devices */}
        {/* <div>
          <label className="block mb-1 text-sm font-medium">
            Select Devices
          </label>
          <select
            value={devices}
            onChange={(e) => setDevices(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Nothing Selected</option>
            <option value="device1">Device 1</option>
            <option value="device2">Device 2</option>
            <option value="device3">Device 3</option>
          </select>
        </div> */}
      </div>

      {/* 4th Row: Select Message */}
      {/* <div className="grid grid-cols-1 gap-4 mt-4">
        <div>
          <label className="block mb-1 text-sm font-medium">
            Select Message
          </label>
          <select
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
          >
            <option value="">Nothing Selected</option>
            <option value="message1">Message 1</option>
            <option value="message2">Message 2</option>
            <option value="message3">Message 3</option>
          </select>
        </div>
      </div> */}

      {/* Bottom Left: Save Button */}
      <div className="mt-6 text-left">
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
        >
          <IoMdAdd />
          Save
        </button>
      </div>
    </form>
  );
};

export default VideoForm;
