import { Metadata } from "next";

export const templateMetadata: Metadata = {
  metadataBase: new URL("https://clerk-nextjs-app-router.vercel.app/"),
  title: "Space Style Barber",
  description: "Professional barber services and management system.",
  openGraph: { images: ["/og.png"] },
};

// Default metadata for when template is removed
export const defaultMetadata: Metadata = {
  title: "Space Style Barber",
  description: "Professional barber services and management system.",
};
