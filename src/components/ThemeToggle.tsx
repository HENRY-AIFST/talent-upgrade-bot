import { useState, useEffect, useCallback } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const getStoredTheme = (): "dark" | "light" => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  }
  return "dark";
};

const applyTheme = (theme: "dark" | "light") => {
  const root = document.documentElement;
  if (theme === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"dark" | "light">(getStoredTheme);

  // Sync DOM on mount (handles navigation between pages)
  useEffect(() => {
    applyTheme(theme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  // Listen for storage changes from other tabs/components
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "theme") {
        const t = e.newValue === "light" ? "light" : "dark";
        setTheme(t);
        applyTheme(t);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

export default ThemeToggle;
