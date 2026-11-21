import { getPendingReviews } from "@/lib/review-notification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("app_id") || "web";

  const reviews = getPendingReviews();
  return Response.json({ reviews });
}