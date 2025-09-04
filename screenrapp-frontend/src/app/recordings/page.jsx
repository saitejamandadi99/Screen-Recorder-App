"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/recordings";

  // Fetch recordings from backend
  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/all`);
      setRecordings(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch recordings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this recording?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRecordings((prev) => prev.filter((rec) => rec.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete recording");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Uploaded Recordings</h1>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((rec) => (
          <div
            key={rec.id}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition flex flex-col"
          >
            <video
              src={rec.filepath}
              controls
              className="w-full rounded-xl mb-4"
            />
            <h2 className="font-semibold text-gray-800">{rec.filename}</h2>
            <p className="text-gray-500 text-sm mb-2">
              Size: {(rec.filesize / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Uploaded: {new Date(rec.createdAt).toLocaleString()}
            </p>
            <div className="flex gap-2 mt-auto">
              <a
                href={rec.filepath}
                download
                className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(rec.id)}
                className="flex-1 text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && recordings.length === 0 && (
        <p className="text-center text-gray-500 mt-12">
          No recordings uploaded yet.
        </p>
      )}
    </main>
  );
}
