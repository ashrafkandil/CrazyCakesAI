"use client";

import { Star } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AddReviewDialogProps = {
  trigger: React.ReactNode;
};

export function AddReviewDialog({ trigger }: AddReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function resetForm() {
    setName("");
    setRating(5);
    setQuote("");
    setError(null);
    setDone(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const trimmedName = name.trim();
    const trimmedQuote = quote.trim();
    if (!trimmedName) {
      setError("Please add your name.");
      return;
    }
    if (!trimmedQuote) {
      setError("Please share your review.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          author: trimmedName,
          quote: trimmedQuote,
          rating,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Could not save your review. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not save your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share your review</DialogTitle>
          <DialogDescription>
            Tell us about your Marwa Crazy Cakes experience. Your review will be held for moderation
            before it is published.
          </DialogDescription>
        </DialogHeader>
        {done ? (
          <div className="py-6 text-center">
            <p className="font-serif text-xl font-semibold text-primary">Thank you!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your review has been received and is awaiting moderation.
            </p>
            <Button className="mt-6" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="review-name">Name</Label>
              <input
                id="review-name"
                type="text"
                required
                autoComplete="name"
                className="form-field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-rating">Rating</Label>
              <div className="flex items-center gap-1" id="review-rating">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  const filled = value <= rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                      onClick={() => setRating(value)}
                      className="cursor-pointer rounded-sm p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          filled ? "fill-gold text-gold" : "text-muted-foreground/40"
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="review-quote">Your review</Label>
              <Textarea
                id="review-quote"
                required
                rows={5}
                value={quote}
                onChange={(event) => setQuote(event.target.value)}
                placeholder="Tell us about your cake, the design, the service…"
              />
            </div>
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit review"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}