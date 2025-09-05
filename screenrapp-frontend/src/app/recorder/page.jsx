"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function RecorderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState("");
  const videoRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/recordings";

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 180) { // 3 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setMessage("");
      // Get display stream
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false // optional
      });
      // Get microphone audio
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Combine streams
      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
      ]);

      // Assign preview
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm; codecs=vp8,opus"
      });

      recorder.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        if (blob.size === 0) {
          setMessage("Recording failed. No data captured.");
          return;
        }
        const url = URL.createObjectURL(blob);
        setRecordedVideo({
          blob,
          url,
          filename: `recording-${Date.now()}.webm`,
          size: blob.size
        });
        // Stop preview
        if (videoRef.current) videoRef.current.srcObject = null;
      };

      recorder.start(100); // emit data every 100ms
      setMediaRecorder(recorder);
      setChunks([]);
      setIsRecording(true);
      setTimer(0);
    } catch (err) {
      console.error(err);
      setMessage("Cannot start recording. Make sure you allow tab sharing and microphone access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadRecording = async () => {
    if (!recordedVideo) return;
    try {
      setMessage("Uploading...");
      const formData = new FormData();
      formData.append("recording", recordedVideo.blob, recordedVideo.filename);

      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage(res.data.message || "Uploaded successfully");
      setRecordedVideo(null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload failed");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-6 text-center">Screen & Audio Recorder</h1>

      {/* Live preview */}
      {isRecording && (
        <video ref={videoRef} autoPlay muted className="w-full max-w-lg rounded-lg mb-4 shadow-lg" />
      )}

      <div className="flex gap-4 mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Stop Recording
          </button>
        )}
      </div>

      {isRecording && <p className="mb-4 text-gray-700">Recording: {timer}s / 180s</p>}

      {recordedVideo && (
        <div className="w-full max-w-lg flex flex-col items-center mb-4">
          <video src={recordedVideo.url} controls className="w-full rounded-lg mb-4 shadow-lg" />
          <div className="flex gap-4 w-full">
            <a
              href={recordedVideo.url}
              download={recordedVideo.filename}
              className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Download
            </a>
            <button
              onClick={uploadRecording}
              className="flex-1 text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Upload
            </button>
          </div>
          <p className="mt-2 text-gray-600 text-sm">
            Size: {(recordedVideo.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      )}

      {message && <p className="text-center text-gray-700 mt-4">{message}</p>}
    </main>
  );
}
