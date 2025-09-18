"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface PWAStatus {
  hasServiceWorker: boolean;
  hasManifest: boolean;
  isHTTPS: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  supportsBeforeInstallPrompt: boolean;
  userAgent: string;
  displayMode: string;
  manifestData: any;
  serviceWorkerStatus: string;
}

export const PWADebugger = () => {
  const [status, setStatus] = useState<PWAStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPWAStatus = async () => {
      try {
        const pwaStatus: PWAStatus = {
          hasServiceWorker: "serviceWorker" in navigator,
          hasManifest: false,
          isHTTPS:
            location.protocol === "https:" || location.hostname === "localhost",
          isInstallable: false,
          isInstalled:
            window.matchMedia("(display-mode: standalone)").matches ||
            (navigator as any).standalone === true,
          supportsBeforeInstallPrompt:
            "BeforeInstallPromptEvent" in window ||
            "onbeforeinstallprompt" in window,
          userAgent: navigator.userAgent,
          displayMode: window.matchMedia("(display-mode: standalone)").matches
            ? "standalone"
            : window.matchMedia("(display-mode: fullscreen)").matches
            ? "fullscreen"
            : window.matchMedia("(display-mode: minimal-ui)").matches
            ? "minimal-ui"
            : "browser",
          manifestData: null,
          serviceWorkerStatus: "checking",
        };

        try {
          const manifestResponse = await fetch("/manifest.json");
          if (manifestResponse.ok) {
            pwaStatus.hasManifest = true;
            pwaStatus.manifestData = await manifestResponse.json();
          }
        } catch (error) {
          console.error("Manifest check failed:", error);
        }

        if (pwaStatus.hasServiceWorker) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            if (registration.active) {
              pwaStatus.serviceWorkerStatus = "active";
            } else if (registration.installing) {
              pwaStatus.serviceWorkerStatus = "installing";
            } else if (registration.waiting) {
              pwaStatus.serviceWorkerStatus = "waiting";
            } else {
              pwaStatus.serviceWorkerStatus = "registered";
            }
          } else {
            pwaStatus.serviceWorkerStatus = "not registered";
          }
        } else {
          pwaStatus.serviceWorkerStatus = "not supported";
        }

        const beforeInstallPromptHandler = () => {
          pwaStatus.isInstallable = true;
          setStatus({ ...pwaStatus });
        };

        window.addEventListener(
          "beforeinstallprompt",
          beforeInstallPromptHandler
        );

        setStatus(pwaStatus);
        setLoading(false);

        return () => {
          window.removeEventListener(
            "beforeinstallprompt",
            beforeInstallPromptHandler
          );
        };
      } catch (error) {
        console.error("PWA status check failed:", error);
        setLoading(false);
      }
    };

    checkPWAStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getBrowser = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  const getOS = (userAgent: string) => {
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      return "iOS";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Checking PWA Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Failed to Check PWA Status
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const browser = getBrowser(status.userAgent);
  const os = getOS(status.userAgent);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          PWA Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Browser</p>
            <Badge variant="outline">{browser}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium">OS</p>
            <Badge variant="outline">{os}</Badge>
          </div>
        </div>

        {/* PWA Requirements */}
        <div className="space-y-2">
          <h4 className="font-medium">PWA Requirements</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.isHTTPS)}
              <span className="text-sm">HTTPS or localhost</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.hasManifest)}
              <span className="text-sm">Web App Manifest</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.hasServiceWorker)}
              <span className="text-sm">Service Worker Support</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.serviceWorkerStatus === "active")}
              <span className="text-sm">
                Service Worker Status: {status.serviceWorkerStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Installation Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Installation Status</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(status.isInstalled)}
              <span className="text-sm">Currently Installed</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.isInstallable)}
              <span className="text-sm">
                Installable (beforeinstallprompt fired)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.supportsBeforeInstallPrompt)}
              <span className="text-sm">Supports beforeinstallprompt</span>
            </div>
          </div>
        </div>

        {/* Current Display Mode */}
        <div className="space-y-2">
          <h4 className="font-medium">Display Mode</h4>
          <Badge
            variant={
              status.displayMode === "standalone" ? "default" : "outline"
            }
          >
            {status.displayMode}
          </Badge>
        </div>

        {/* Manifest Info */}
        {status.manifestData && (
          <div className="space-y-2">
            <h4 className="font-medium">Manifest Data</h4>
            <div className="bg-gray-50 p-3 rounded text-xs">
              <pre>{JSON.stringify(status.manifestData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Browser Specific Notes */}
        <div className="space-y-2">
          <h4 className="font-medium">Browser Specific Notes</h4>
          <div className="text-sm space-y-1">
            {browser === "Safari" && (
              <p className="text-amber-600">
                ⚠️ Safari doesn't support beforeinstallprompt. Users must
                manually "Add to Home Screen"
              </p>
            )}
            {browser === "Firefox" && (
              <p className="text-amber-600">
                ⚠️ Firefox has limited PWA install support
              </p>
            )}
            {os === "iOS" && (
              <p className="text-blue-600">
                ℹ️ iOS requires manual installation via Safari's Share menu
              </p>
            )}
            {!status.isHTTPS && (
              <p className="text-red-600">
                ❌ PWA requires HTTPS in production
              </p>
            )}
          </div>
        </div>

        {/* Debug Actions */}
        <div className="space-y-2">
          <h4 className="font-medium">Debug Actions</h4>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
            <button
              onClick={async () => {
                if ("serviceWorker" in navigator) {
                  const registration =
                    await navigator.serviceWorker.getRegistration();
                  if (registration) {
                    await registration.update();
                    console.log("Service Worker update requested");
                    setTimeout(() => window.location.reload(), 1000);
                  }
                }
              }}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
            >
              Update SW
            </button>
            <button
              onClick={() => {
                if ("caches" in window) {
                  caches
                    .keys()
                    .then((names) => {
                      names.forEach((name) => {
                        caches.delete(name);
                      });
                    })
                    .then(() => {
                      console.log("All caches cleared");
                      window.location.reload();
                    });
                }
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear Cache
            </button>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="space-y-2">
          <h4 className="font-medium">Troubleshooting</h4>
          <div className="text-sm space-y-1">
            {status.serviceWorkerStatus === "registered" && (
              <p className="text-amber-600">
                ⚠️ Service Worker registered but not active yet. Try refreshing
                or clearing cache.
              </p>
            )}
            {!status.isInstallable && !status.isInstalled && (
              <div className="space-y-1">
                <p>Install button not showing? Try:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Make sure you're on HTTPS or localhost</li>
                  <li>Check that manifest.json is accessible</li>
                  <li>Verify service worker is registered and active</li>
                  <li>Try in Chrome or Edge (best PWA support)</li>
                  <li>Clear browser cache and reload</li>
                  <li>Make sure the app isn't already installed</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Troubleshooting */}
        <div className="space-y-2">
          <h4 className="font-medium">Troubleshooting</h4>
          <div className="text-sm space-y-1">
            {!status.isInstallable && !status.isInstalled && (
              <div className="space-y-1">
                <p>Install button not showing? Try:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Make sure you're on HTTPS or localhost</li>
                  <li>Check that manifest.json is accessible</li>
                  <li>Verify service worker is registered and active</li>
                  <li>Try in Chrome or Edge (best PWA support)</li>
                  <li>Clear browser cache and reload</li>
                  <li>Make sure the app isn't already installed</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
