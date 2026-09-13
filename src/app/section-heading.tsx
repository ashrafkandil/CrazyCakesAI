import type { ElementType } from "react";

type SectionHeadingProps = {
  title: string;
  eyebrow: string;
  as?: ElementType;
};

export function SectionHeading({ title, eyebrow, as: Tag = "h1" }: SectionHeadingProps) {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <Tag className="font-script text-4xl text-primary sm:text-5xl">{title}</Tag>
      <p className="mt-3 font-serif text-xs uppercase tracking-[0.26em] text-muted-foreground">
        {eyebrow}
      </p>
    </header>
  );
}
