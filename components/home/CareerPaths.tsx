import { Container } from "@/components/layout/Container";

export function CareerPaths() {
  return (
    <section
      aria-labelledby="career-paths-heading"
      className="border-b border-border py-16 md:py-24"
    >
      <Container>
        <h2
          id="career-paths-heading"
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          Career paths
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This section will outline the roles learners can work toward and how
          each path is organized.
        </p>
      </Container>
    </section>
  );
}
