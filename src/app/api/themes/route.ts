import { getDb, getWritableDb } from "@/lib/db";
import { getThemes, getDefaultTheme } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const themes = getThemes();
  const currentTheme = getDefaultTheme();
  return Response.json({ themes, currentTheme });
}

export async function POST(request: Request) {
  let body: { themeId: number } | null = null;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body || typeof body.themeId !== "number") {
    return Response.json({ error: "themeId is required" }, { status: 400 });
  }

  const db = getWritableDb();
  try {
    // Reset all themes to not default
    db.prepare("UPDATE themes SET is_default = 0").run();

    // Set the selected theme as default
    const info = db.prepare("UPDATE themes SET is_default = 1 WHERE id = ?").run(body.themeId);

    if (info.changes === 0) {
      return Response.json({ error: "Theme not found" }, { status: 404 });
    }

    const currentTheme = getDefaultTheme();
    return Response.json({ currentTheme });
  } catch (error) {
    return Response.json({ error: "Failed to update theme" }, { status: 500 });
  } finally {
    db.close();
  }
}