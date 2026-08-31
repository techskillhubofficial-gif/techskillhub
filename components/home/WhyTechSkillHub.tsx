import { Container } from "@/components/layout/Container";

export function WhyTechSkillHub() {
  return (
    <section
      aria-labelledby="why-heading"
      className="border-b border-border py-16 md:py-24"
    >
      <Container>
        <h2
          id="why-heading"
          className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          Why TechSkill Hub
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          This section will explain what makes the programs structured,
          practical, and worth committing to.
        </p>
      </Container>
    </section>
  );
}
