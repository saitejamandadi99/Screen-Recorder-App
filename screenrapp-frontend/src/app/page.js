"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-8">
    
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4 animate-fadeIn">
          Screen & Audio Recorder
        </h1>
        <p className="text-lg text-gray-600">
          Record your browser tab with microphone audio, preview it, and save it
          for later. Simple, fast, and secure.
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl w-full">
        {[
          {
            title: "Record Easily",
            desc: "Capture your tab with mic audio in one click.",
          },
          {
            title: "Preview & Save",
            desc: "Watch recordings instantly and download as .webm.",
          },
          {
            title: "Manage Recordings",
            desc: "Access your uploaded recordings anytime.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {feature.title}
            </h2>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>

      
      <div className="flex gap-6">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition transform hover:scale-105"
        >
          Start Recording
        </Link>
        <Link
          href="/recordings"
          className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition transform hover:scale-105"
        >
          View Recordings
        </Link>
      </div>

      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
