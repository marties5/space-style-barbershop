"use client";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function DevtoolsWatcher() {
  useEffect(() => {
    let open = false;
    const check = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        if (!open) {
          open = true;
          redirect("/");
        }
      } else {
        open = false;
      }
    }, 1000);
    return () => clearInterval(check);
  }, []);

  return null;
}
