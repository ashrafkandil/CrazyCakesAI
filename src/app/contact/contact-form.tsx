"use client";

import { ImagePlus, Sparkles } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  QUOTE_DRAFT_EVENT,
  clearQuoteDraft,
  readQuoteDraft,
  type QuoteField,
} from "@/lib/assistant/shared";

type FormState = Record<QuoteField, string>;

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  servings: "",
  location: "",
  theme: "",
};

export function ContactForm({ eventTypes = [], email }: { eventTypes?: string[]; email: string }) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // The AI assistant saves quote details in sessionStorage; pick them up here.
  useEffect(() => {
    function applyDraft() {
      const draft = readQuoteDraft();
      const keys = Object.keys(draft) as QuoteField[];
      if (keys.length === 0) return;
      setForm((current) => {
        const next = { ...current };
        for (const key of keys) {
          const value = draft[key];
          if (!value) continue;
          if (key === "eventType" && !eventTypes.includes(value)) continue;
          next[key] = value;
        }
        return next;
      });
      setPrefilled(true);
      setSubmitted(false);
    }
    applyDraft();
    window.addEventListener(QUOTE_DRAFT_EVENT, applyDraft);
    return () => window.removeEventListener(QUOTE_DRAFT_EVENT, applyDraft);
  }, [eventTypes]);

  function field(key: QuoteField) {
    return {
      name: key,
      value: form[key],
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm((current) => ({ ...current, [key]: event.target.value })),
    };
  }

  // No backend or paid email service needed: open the visitor's email app with the inquiry.
  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `Cake inquiry: ${form.eventType} on ${form.eventDate}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `Event type: ${form.eventType}`,
      `Event date: ${form.eventDate}`,
      `Number of servings: ${form.servings}`,
      `Event/Delivery location: ${form.location || "-"}`,
      "",
      "Theme / details:",
      form.theme,
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    clearQuoteDraft();
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
          <h3 className="font-script text-3xl text-primary">Almost there!</h3>
          <p className="mt-3 text-muted-foreground">
            Your email app should open with your inquiry. Just press Send (and attach any
            inspiration photos). We&apos;ll be in touch within 24 hours.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-6"
            onClick={() => setSubmitted(false)}
          >
            Back to the form
          </Button>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {prefilled ? (
            <p className="flex items-center gap-2 rounded-lg bg-blush px-4 py-3 text-sm text-secondary-foreground sm:col-span-2">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              Our assistant filled in some details. Please review them before sending.
            </p>
          ) : null}
          <label className="text-sm font-medium">
            Name *
            <input required autoComplete="name" className="form-field mt-2" {...field("name")} />
          </label>
          <label className="text-sm font-medium">
            Email *
            <input
              type="email"
              required
              autoComplete="email"
              className="form-field mt-2"
              {...field("email")}
            />
          </label>
          <label className="text-sm font-medium">
            Phone *
            <input
              type="tel"
              required
              autoComplete="tel"
              className="form-field mt-2"
              {...field("phone")}
            />
          </label>
          <label className="text-sm font-medium">
            Event Type *
            <select required className="form-field mt-2" {...field("eventType")}>
              <option value="">Select event type</option>
              {eventTypes.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Event Date *
            <input type="date" required className="form-field mt-2" {...field("eventDate")} />
          </label>
          <label className="text-sm font-medium">
            Number of Servings *
            <input
              type="number"
              min="1"
              required
              className="form-field mt-2"
              {...field("servings")}
            />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Event/Delivery Location
            <input className="form-field mt-2" {...field("location")} />
          </label>
          <label className="text-sm font-medium sm:col-span-2">
            Tell us more about your theme! *
            <textarea
              required
              rows={5}
              className="form-field mt-2 resize-none"
              {...field("theme")}
            />
          </label>
          <p className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
            <ImagePlus className="h-4 w-4 shrink-0" /> Have an inspiration photo? Attach it to the
            email that opens after you press Send.
          </p>
          <Button type="submit" size="lg" className="sm:col-span-2">
            Send Inquiry
          </Button>
        </div>
      )}
    </form>
  );
}
