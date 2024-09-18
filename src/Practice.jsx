import React, { useRef, useState } from "react";

const Practice = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [intervalId, setIntervalId] = useState(null);
  const divRef = useRef(null);
  const canvasRef = useRef(null);

  const startRecording = () => {
    setRecording(true);

    // Create a canvas element to record the div
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions same as div
    const div = divRef.current;
    canvas.width = div.offsetWidth;
    canvas.height = div.offsetHeight;

    const stream = canvas.captureStream(30); // Capture 30 frames per second
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setChunks((prevChunks) => [...prevChunks, event.data]);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "div-recording.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    };

    recorder.start();
    setMediaRecorder(recorder);

    const interval = setInterval(() => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the div's content on the canvas
      context.drawImage(div, 0, 0, canvas.width, canvas.height);
    }, 1000 / 30); // 30 frames per second

    setIntervalId(interval);
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return (
    <div>
      {/* Div to be recorded */}
      <div
        ref={divRef}
        style={{
          border: "1px solid black",
          padding: "20px",
          width: "300px",
          height: "300px",
          overflow: "hidden",
        }}
      >
        <img
          src="https://cdn.pixabay.com/photo/2024/09/05/15/13/vietnam-9025183_640.jpg"
          alt="Sample"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Hidden canvas used for recording */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <div>
        {!recording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
      </div>
    </div>
  );
};

export default Practice;
