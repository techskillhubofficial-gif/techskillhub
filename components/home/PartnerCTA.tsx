"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ArrowRight, Building2, Phone } from "lucide-react";

export function PartnerCTA() {
  return (
    <section className="bg-gradient-to-r from-[#0F172A] via-[#1D4ED8] to-[#2563EB] py-24">
      <Container>
        <div className="mx-auto max-w-4xl text-center text-white">

          <div className="mb-6 flex justify-center">
            <Building2 className="h-14 w-14" />
          </div>

          <h2 className="text-5xl font-bold">
            Ready to Partner with TechSkill Hub?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Campus Training • Corporate Learning • Placement Programs • AI Education
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">

            <Button
              size="lg"
              className="bg-white px-8 py-7 text-blue-700 hover:bg-slate-100"
            >
              Schedule Meeting
              <ArrowRight className="ml-2 h-5 w-5"/>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white bg-transparent px-8 py-7 text-white hover:bg-white hover:text-blue-700"
            >
              <Phone className="mr-2 h-5 w-5"/>
              WhatsApp Us
            </Button>

          </div>

        </div>
      </Container>
    </section>
  );
}