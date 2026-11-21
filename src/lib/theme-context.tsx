"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Theme } from "@/lib/data";

type ThemeContextType = {
  themes: Theme[];
  currentTheme: Theme | null;
  setTheme: (themeId: number) => void;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadThemes() {
      try {
        const response = await fetch("/api/themes");
        if (response.ok) {
          const data = await response.json();
          setThemes(data.themes);
          setCurrentTheme(data.currentTheme);
        }
      } catch (error) {
        console.error("Failed to load themes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadThemes();
  }, []);

  const setTheme = async (themeId: number) => {
    try {
      const response = await fetch("/api/themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentTheme(data.currentTheme);
        // Apply theme to document
        if (data.currentTheme) {
          applyTheme(data.currentTheme);
        }
      }
    } catch (error) {
      console.error("Failed to set theme:", error);
    }
  };

  useEffect(() => {
    if (currentTheme) {
      applyTheme(currentTheme);
    }
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ themes, currentTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", theme.primaryColor);
  root.style.setProperty("--color-primary-foreground", theme.primaryForeground);
  root.style.setProperty("--color-secondary", theme.secondaryColor);
  root.style.setProperty("--color-secondary-foreground", theme.secondaryForeground);
  root.style.setProperty("--color-background", theme.background);
  root.style.setProperty("--color-surface", theme.surface);
  root.style.setProperty("--color-muted", theme.muted);
  root.style.setProperty("--color-muted-foreground", theme.mutedForeground);
  root.style.setProperty("--color-border", theme.border);
  root.style.setProperty("--color-gold", theme.gold);
  root.style.setProperty("--color-overlay", theme.overlay);
  root.style.setProperty("--color-blush", theme.blush);
  root.setAttribute("data-theme", theme.name.toLowerCase());
}