"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const companies = [
  "TCS",
  "Infosys",
  "Accenture",
  "Cognizant",
  "Capgemini",
  "IBM",
  "Wipro",
  "HCLTech",
  "Tech Mahindra",
  "Deloitte",
  "LTIMindtree",
  "Oracle",
];

export function HiringPartners() {
  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
            🤝 Hiring Network
          </span>

          <h2 className="mt-6 text-5xl font-bold">
            Learn Skills Companies Actually Hire For
          </h2>

          <p className="mt-6 text-lg text-slate-300">
            Our curriculum is designed around real industry requirements to
            prepare students for careers at leading technology companies.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {companies.map((company, index) => (
            <motion.div
              key={company}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border border-slate-800 bg-slate-900 transition hover:border-blue-500 hover:shadow-xl">
                <CardContent className="flex h-24 items-center justify-center">
                  <h3 className="text-xl font-bold text-white">
                    {company}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {[
            { value: "150+", label: "Hiring Partners" },
            { value: "10,000+", label: "Students Trained" },
            { value: "95%", label: "Placement Assistance" },
            { value: "500+", label: "Industry Projects" },
          ].map((item) => (
            <Card
              key={item.label}
              className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <CardContent className="p-8 text-center">
                <h3 className="text-4xl font-bold">{item.value}</h3>
                <p className="mt-2 text-blue-100">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}