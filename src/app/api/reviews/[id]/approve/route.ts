import { approveReview } from "@/lib/review-notification";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return Response.json({ ok: false, message: "Invalid review ID" }, { status: 400 });
  }

  const success = approveReview(id);
  if (success) {
    return Response.json({ ok: true, message: "Review approved" });
  }
  return Response.json({ ok: false, message: "Failed to approve review" }, { status: 500 });
}