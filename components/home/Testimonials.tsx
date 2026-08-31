import { Container } from "@/components/layout/Container";

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-b border-border py-16 md:py-24"
    >
      <Container>
        <h2
          id="testimonials-heading"
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          Student outcomes
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This section will hold verified learner stories once they are ready
          to publish.
        </p>
      </Container>
    </section>
  );
}
