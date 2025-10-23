import { Metadata } from "next";

export const templateMetadata: Metadata = {
  metadataBase: new URL("https://clerk-nextjs-app-router.vercel.app/"),
  title: "Aplikasi Barber",
  description: "Professional barber services and management system.",
  openGraph: { images: ["/og.png"] },
};

export const defaultMetadata: Metadata = {
  title: "Aplikasi Barber",
  description: "Professional barber services and management system.",
};
