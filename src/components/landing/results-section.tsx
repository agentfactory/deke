"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Award, Star, TrendingUp } from "lucide-react";

const results = [
  {
    metric: "Regional to International",
    description: "Groups advancing from local competitions to ICCA championship level",
    icon: Trophy,
  },
  {
    metric: "3x Enrollment Growth",
    description: "University programs tripling enrollment after workshop series",
    icon: Users,
  },
  {
    metric: "Record Deals",
    description: "Professional groups landing major label contracts after album production",
    icon: Award,
  },
  {
    metric: "Carnegie Hall",
    description: "Choirs achieving performances on the world's most prestigious stages",
    icon: Star,
  },
];

export function ResultsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Results
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            The Deke Difference
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proven track record of taking groups from regional to world-class
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map((result, i) => (
            <motion.div
              key={result.metric}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="text-center h-full hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-transparent hover:border-accent/20">
                <CardHeader className="pb-3">
                  <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-accent/10 text-accent mx-auto mb-4">
                    <result.icon className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <CardTitle className="font-heading text-lg md:text-xl">
                    {result.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
