import { Container } from "@/components/layout/Container";

export function CTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-16 md:py-24"
    >
      <Container>
        <h2
          id="cta-heading"
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          Start your next step
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This section will invite visitors to enroll or talk with the team
          about the right program.
        </p>
      </Container>
    </section>
  );
}
