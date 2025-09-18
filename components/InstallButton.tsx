"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Check,
  Smartphone,
  Monitor,
  Share,
  Plus,
  Chrome,
  
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState<
    "desktop" | "ios" | "android" | "unknown"
  >("unknown");

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else if (isDesktop) setPlatform("desktop");
  }, []);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (installed PWA)
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      ) {
        setIsInstalled(true);
        return true;
      }

      // Check for fullscreen mode
      if (window.matchMedia("(display-mode: fullscreen)").matches) {
        setIsInstalled(true);
        return true;
      }

      return false;
    };

    if (checkIfInstalled()) return;

    // Handle beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      console.log("📌 beforeinstallprompt fired");
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Handle appinstalled event
    const installedHandler = () => {
      console.log("✅ PWA was installed");
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    window.addEventListener("appinstalled", installedHandler);

    // For platforms that don't support beforeinstallprompt
    const timer = setTimeout(() => {
      if (!canInstall && !isInstalled) {
        // Show manual install instructions after 3 seconds
        if (platform === "ios" || (platform === "android" && !deferredPrompt)) {
          setCanInstall(true);
        }
      }
    }, 3000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(timer);
    };
  }, [platform, canInstall, isInstalled, deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Native browser install (Chrome, Edge, etc.)
      setIsInstalling(true);

      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
          console.log("✅ User accepted the install prompt");
        } else {
          console.log("❌ User dismissed the install prompt");
        }
      } catch (error) {
        console.error("Error during installation:", error);
      } finally {
        setDeferredPrompt(null);
        setCanInstall(false);
        setIsInstalling(false);
      }
    } else {
      // Show manual instructions for iOS, or browsers that don't support beforeinstallprompt
      setShowInstructions(true);
    }
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case "ios":
        return {
          title: "Install App on iOS",
          steps: [
            "1. Tap the Share button in Safari",
            "2. Scroll down and tap 'Add to Home Screen'",
            "3. Tap 'Add' to install the app",
          ],
          icon: <Plus className="h-6 w-6" />,
        };
      case "android":
        return {
          title: "Install App on Android",
          steps: [
            "1. Tap the menu (⋮) in your browser",
            "2. Select 'Add to Home Screen' or 'Install App'",
            "3. Tap 'Add' to install the app",
          ],
          icon: <Chrome className="h-6 w-6" />,
        };
      case "desktop":
        return {
          title: "Install App on Desktop",
          steps: [
            "1. Click the install icon in your browser's address bar",
            "2. Or use the menu and select 'Install Space Style Barber'",
            "3. Click 'Install' to add to your desktop",
          ],
          icon: <Monitor className="h-6 w-6" />,
        };
      default:
        return {
          title: "Install App",
          steps: [
            "1. Look for an install option in your browser menu",
            "2. Or bookmark this page for easy access",
          ],
          icon: <Download className="h-6 w-6" />,
        };
    }
  };

  if (isInstalled) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Check className="h-4 w-4 text-green-600" />
        App Installed
      </Button>
    );
  }

  if (!canInstall) return null;

  const instructions = getInstallInstructions();

  return (
    <>
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        className="gap-2 bg-blue-600 hover:bg-blue-700"
      >
        {platform === "ios" ? (
          <Share className="h-4 w-4" />
        ) : platform === "android" ? (
          <Smartphone className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {isInstalling ? "Installing..." : "Install App"}
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {instructions.icon}
              {instructions.title}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3">
                <p>Follow these steps to install the app:</p>
                <div className="space-y-2">
                  {instructions.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
                {platform === "ios" && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 Look for the <Share className="inline h-4 w-4 mx-1" />{" "}
                      share icon at the bottom of Safari
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
