"use client";

import { useEffect } from "react";

export default function DisableZoom() {
  useEffect(() => {
    const preventZoom = (e: WheelEvent | KeyboardEvent) => {
      if (e instanceof WheelEvent && e.ctrlKey) {
        e.preventDefault();
      }
      if (
        e instanceof KeyboardEvent &&
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("wheel", preventZoom as any, { passive: false });
    document.addEventListener("keydown", preventZoom as any);

    return () => {
      document.removeEventListener("wheel", preventZoom as any);
      document.removeEventListener("keydown", preventZoom as any);
    };
  }, []);

  return null;
}
