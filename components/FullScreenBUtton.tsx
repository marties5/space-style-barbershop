"use client";
import { useCallback } from "react";

export default function FullscreenButton() {
  const goFull = useCallback(async () => {
    if (document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Fullscreen gagal:", err);
      }
    }
  }, []);

  return (
    <button
      onClick={goFull}
      className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md"
    >
      Buka Fullscreen
    </button>
  );
}
