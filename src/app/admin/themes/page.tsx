"use client";

import { useState, useEffect } from "react";
import { Theme } from "@/lib/data";
import { useTheme } from "@/lib/theme-context";

const ADMIN_PASSWORD = "crazycakes13";

export default function AdminThemesPage() {
  const { themes, currentTheme, setTheme, loading } = useTheme();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setError("Incorrect password");
    }
  };

  const handleSetTheme = async (themeId: number) => {
    try {
      await setTheme(themeId);
    } catch (error) {
      console.error("Failed to set theme:", error);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-5">
        <div className="w-full max-w-md p-6 rounded-lg border border-border bg-background">
          <h1 className="font-script text-2xl font-bold text-primary mb-4 text-center">
            Theme Administration
          </h1>
          {error && (
            <p className="text-sm text-destructive mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-field"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
            >
              Access Themes
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-script text-2xl font-bold text-primary">Theme Administration</h1>
        <button
          onClick={() => window.location.reload()}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 max-w-2xl">
          {themes.map((theme: Theme) => (
            <div
              key={theme.id}
              className={`rounded-lg border p-4 transition-all ${
                theme.id === currentTheme?.id
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg"
                    style={{
                      backgroundColor: theme.primaryColor,
                      border: "1px solid " + theme.border,
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-primary">{theme.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {theme.isDefault ? "Default theme" : "Click to activate"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSetTheme(theme.id)}
                  disabled={theme.id === currentTheme?.id}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    theme.id === currentTheme?.id
                      ? "bg-green-100 text-green-800 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {theme.id === currentTheme?.id ? "Active" : "Activate"}
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.primaryColor }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.secondaryColor }}
                  title="Secondary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.background }}
                  title="Background"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.muted }}
                  title="Muted"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.gold }}
                  title="Gold"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}