import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

 export const formatDate = (dateString: Date) => {
   return new Date(dateString).toLocaleDateString("id-ID", {
     year: "numeric",
     month: "short",
     day: "numeric",
     hour: "2-digit",
     minute: "2-digit",
   });
 };