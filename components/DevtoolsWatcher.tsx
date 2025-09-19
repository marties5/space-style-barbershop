"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DevtoolsWatcher() {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV == "development") return;

    let open = false;
    const check = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > 160 || heightDiff > 160) {
        if (!open) {
          open = true;
          router.push("/");
        }
      } else {
        open = false;
      }
    }, 1000);

    return () => clearInterval(check);
  }, [router]);

  return null;
}
