import { ClerkProvider } from "@clerk/nextjs";
import type { Appearance } from "@clerk/types";
import localFont from "next/font/local";
import { Header } from "./_template/components/header";
import { templateMetadata } from "./_template/content/metadata";
import "./globals.css";

export const metadata = templateMetadata;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const clerkAppearanceObject = {
  cssLayerName: "clerk",
  variables: { colorPrimary: "#000000" },
  elements: {
    socialButtonsBlockButton:
      "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
    socialButtonsBlockButtonText: "font-semibold",
    formButtonReset:
      "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
    membersPageInviteButton:
      "bg-black border border-black border-solid hover:bg-white hover:text-black",
    card: "bg-[#fafafa]",
  },
} satisfies Appearance;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <ClerkProvider
        appearance={clerkAppearanceObject}
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <body className={`min-h-screen flex flex-col antialiased`}>
          <Header />
          {children}
        </body>
      </ClerkProvider>
    </html>
  );
}
