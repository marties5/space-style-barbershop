"use client";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <SignOutButton>
      <button className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white shadow-md hover:bg-red-600 active:scale-95 transition-all duration-150">
        <LogOut size={18} />
        Logout
      </button>
    </SignOutButton>
  );
}
