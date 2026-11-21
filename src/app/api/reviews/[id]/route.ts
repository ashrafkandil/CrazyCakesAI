import { z } from "zod";

import { getWritableDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return Response.json({ ok: false, message: "Invalid review ID" }, { status: 400 });
  }

  const db = getWritableDb();
  try {
    const info = db.prepare("DELETE FROM testimonials WHERE id = ?").run(id);
    if (info.changes > 0) {
      return Response.json({ ok: true, message: "Review deleted" });
    }
    return Response.json({ ok: false, message: "Review not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to delete review:", error);
    return Response.json({ ok: false, message: "Failed to delete review" }, { status: 500 });
  }
}