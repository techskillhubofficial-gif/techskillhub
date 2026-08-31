import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <Container className="py-12 md:py-16">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          TechSkill Hub
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Site-wide links, contact details, and legal information will appear
          here.
        </p>
      </Container>
    </footer>
  );
}
