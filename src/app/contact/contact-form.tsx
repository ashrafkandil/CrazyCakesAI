"use client";

import { Upload } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

export function ContactForm({ eventTypes = [] }: { eventTypes?: string[] }) {
  const [submitted, setSubmitted] = useState(false);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form
      onSubmit={submitForm}
      className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-serif text-2xl font-semibold text-primary">Request a Custom Quote</h2>
      {submitted ? (
        <div className="mt-8 rounded-lg bg-blush p-8 text-center">
          <h3 className="font-script text-3xl text-primary">Thank you!</h3>
          <p className="mt-3 text-muted-foreground">
            Your inquiry is ready. We&apos;ll be in touch within 24 hours.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Name *<input required className="form-field mt-2" />
          </label>
          <label className="text-sm font-medium">
            Email *<input type="email" required className="form-field mt-2" />
          </label>
          <label className="text-sm font-medium">
            Phone *<input type="tel" required className="form-field mt-2" />
          </label>
          <label className="text-sm font-medium">
            Event Type *
            <select required className="form-field mt-2">
              <option value="">Select event type</option>
              {eventTypes.map((label) => (
                <option key={label}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Event Date *<input type="date" required className="form-field mt-2" />
          </label>
          <label className="text-sm font-medium">
            Number of Servings *
            <input type="number" min="1" required className="form-field mt-2" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Event/Delivery Location
            <input className="form-field mt-2" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Attach image/file (optional)
            </span>
            <input
              type="file"
              accept="image/*,.pdf,.txt"
              className="form-field mt-2 file:mr-4 file:border-0 file:bg-secondary file:px-3 file:py-1"
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Tell us more about your theme! *
            <textarea required rows={5} className="form-field mt-2 resize-none" />
          </label>
          <Button type="submit" size="lg" className="sm:col-span-2">
            Send Inquiry
          </Button>
        </div>
      )}
    </form>
  );
}
