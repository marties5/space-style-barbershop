"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConnectionDetector() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const goOnline = () => {
      setIsOnline(true);
      if (window.location.pathname === "/offline") {
        router.replace("/");
        window.location.reload();
      }
    };
  
    const goOffline = () => {
      setIsOnline(false);
      router.replace("/offline");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [router]);

  return null;
}
