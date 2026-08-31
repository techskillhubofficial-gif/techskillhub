import { Container } from "@/components/layout/Container";

export function FAQ() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="border-b border-border py-16 md:py-24"
    >
      <Container>
        <h2
          id="faq-heading"
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          Frequently asked questions
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This section will answer common questions about programs, pacing,
          and support.
        </p>
      </Container>
    </section>
  );
}
