"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PendingReview = {
  id: number;
  author: string;
  initials: string;
  review_date: string;
  quote: string;
  rating: number;
  sort: number;
};

type ApproveAction = {
  id: number;
  success: boolean;
  message?: string;
};

async function approveReview(id: number): Promise<ApproveAction> {
  const response = await fetch(`/api/reviews/${id}/approve`, {
    method: "POST",
  });
  const data = await response.json();
  return { id, success: data.ok, message: data.message };
}

async function deleteReview(id: number): Promise<ApproveAction> {
  const response = await fetch(`/api/reviews/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return { id, success: data.ok, message: data.message };
}

export default function AdminReviewsPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [pending, setPending] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const ADMIN_PASSWORD = "crazycakes13";

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      await loadPendingReviews();
    } else {
      setError("Incorrect password");
    }
  }

  async function loadPendingReviews() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews/pending");
      const data = await response.json();
      setPending(data.reviews || []);
    } catch {
      setError("Failed to load pending reviews");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleApprove(id: number) {
    const result = await approveReview(id);
    if (result.success) {
      setPending((current) => current.filter((r) => r.id !== id));
      showToast(result.message || "Review approved successfully", "success");
    } else {
      showToast(result.message || "Failed to approve review", "error");
    }
  }

  async function handleDelete(id: number) {
    const result = await deleteReview(id);
    if (result.success) {
      setPending((current) => current.filter((r) => r.id !== id));
      showToast(result.message || "Review deleted successfully", "success");
    } else {
      showToast(result.message || "Failed to delete review", "error");
    }
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-5">
        <Card className="w-full max-w-md p-6">
          <h1 className="font-serif text-2xl font-bold text-primary mb-4">
            Review Moderation
          </h1>
          <form onSubmit={handleLogin} className="grid gap-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
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
            <Button type="submit">Access Reviews</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-primary">
          Pending Review Moderation
        </h1>
        <Button variant="secondary" onClick={() => setAuthenticated(false)}>
          Logout
        </Button>
      </div>

      {toast && (
        <div
          className={`mb-4 px-4 py-3 rounded-md text-sm ${
            toast.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {pending.length === 0 && !loading && (
        <p className="text-muted-foreground">No pending reviews to moderate.</p>
      )}

      <div className="mt-4 grid gap-4">
        {pending.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {review.initials}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-primary">{review.author}</h3>
                <p className="text-xs text-muted-foreground">{review.review_date}</p>
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-sm text-gold" aria-label={`${review.rating} out of 5 stars`}>
                    {"★".repeat(review.rating)}
                  </span>
                </div>
                <p className="mt-2 text-sm italic leading-7 text-muted-foreground">
                  "{review.quote}"
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => handleApprove(review.id)}>
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(review.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}