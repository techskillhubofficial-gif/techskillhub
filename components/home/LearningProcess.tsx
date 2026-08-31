import { Container } from "@/components/layout/Container";

export function LearningProcess() {
  return (
    <section
      aria-labelledby="learning-process-heading"
      className="border-b border-border py-16 md:py-24"
    >
      <Container>
        <h2
          id="learning-process-heading"
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          How learning works
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This section will walk through the steps from enrollment to
          completing a program.
        </p>
      </Container>
    </section>
  );
}
