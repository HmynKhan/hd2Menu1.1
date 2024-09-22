// CanvasRecorder.js - smusamashah
// To record canvas effitiently using MediaRecorder
// https://webrtc.github.io/samples/src/content/capture/canvas-record/

function CanvasRecorder(canvas, video_bits_per_sec) {
  var _this = this;
  this.start = startRecording;
  this.stop = stopRecording;
  this.save = download;

  _this.recordedBlobs = [];
  var supportedType = null;
  var mediaRecorder = null;

  var stream = canvas.captureStream(25);
  if (typeof stream == undefined || !stream) {
    return;
  }

  const video = document.createElement("video");
  video.style.display = "none";

  function startRecording() {
    let types = [
      "video/webm; codecs=vp9", // Generally considered highest quality
      "video/webm; codecs=h264", // Widely supported with decent quality
      "video/webm; codecs=vp8",
      "video/webm", // Generic webm
      "video/webm; codecs=daala", // Less common
      "video/mpeg",
      "video/mp4", // Most widely supported
    ];

    for (let i in types) {
      if (MediaRecorder.isTypeSupported(types[i])) {
        supportedType = types[i];
        break;
      }
    }
    if (supportedType == null) {
      console.log("No supported type found for MediaRecorder");
    }
    let options = {
      mimeType: supportedType,
      videoBitsPerSecond: video_bits_per_sec || 8000000, // 8Mbps
    };

    _this.recordedBlobs = [];
    try {
      mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      alert("MediaRecorder is not supported by this browser.");
      console.error("Exception while creating MediaRecorder:", e);
      return;
    }

    /*    console.log(
      "Created MediaRecorder",
      mediaRecorder,
      "with options",
      options
    ); */
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(100); // collect 100ms of data blobs
    // console.log("MediaRecorder started", mediaRecorder);
  }

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      _this.recordedBlobs.push(event.data);
    }
  }

  function handleStop(event) {
    const superBuffer = new Blob(_this.recordedBlobs, { type: supportedType });
    video.src = window.URL.createObjectURL(superBuffer);

    // Ensure the recorded blobs are not empty
    if (_this.recordedBlobs.length === 0) {
      console.error("No recorded data available.");
    }
  }

  function stopRecording() {
    mediaRecorder.stop();
    video.controls = true;
  }

  function download(file_name) {
    const name = file_name || "recording.webm";
    const blob = new Blob(_this.recordedBlobs, { type: supportedType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}

export { CanvasRecorder };
