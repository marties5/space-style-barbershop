export type ViewMode = "table" | "card";
export const getViewMode = (): "table" | "card" => {
  if (typeof window === "undefined") return "table";
  const saved = localStorage.getItem("viewMode");
  return (saved as "table" | "card") ?? "table";
};

export const setViewMode = (mode: "table" | "card") => {
  if (typeof window === "undefined") return;
  localStorage.setItem("viewMode", mode);
};
