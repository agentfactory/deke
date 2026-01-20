"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Music, Film, Radio, GraduationCap, Check, Layers } from "lucide-react";

const tabs = [
  {
    value: "arranging",
    label: "Arranging",
    icon: Music,
    title: "A Cappella Arranging",
    content: {
      included: [
        "2,000+ a cappella arrangements for groups worldwide",
        "Custom arrangements: any song, any style, all levels",
        "TV/Film: Pitch Perfect, The Sing-Off, The Social Network",
        "Broadway: In Transit, Andrew Lloyd Webber's Unmasked",
        "Published catalog available",
      ],
      timeline: {
        time: "Within 1 week",
        note: "Most arrangements completed within a week. Rush delivery available for additional fee.",
      },
    },
  },
  {
    value: "directing",
    label: "Directing",
    icon: Film,
    title: "Music Direction",
    content: {
      included: [
        "Music direction for TV, film, Broadway, live events",
        "On-camera and off-camera directing",
        "Large-scale event direction (400+ singers)",
        "Touring show direction",
        "Group founding and development",
      ],
    },
  },
  {
    value: "producing",
    label: "Producing",
    icon: Radio,
    title: "Vocal Production",
    content: {
      included: [
        "Album production: Billboard Top 40 albums, Grammy-nominated work",
        "Vocal production for TV/Film",
        "Event production and conceptualization",
        "Recording, editing, mixing, mastering",
      ],
    },
  },
  {
    value: "coaching",
    label: "Coaching & Workshops",
    icon: GraduationCap,
    title: "Workshops & Coaching",
    content: {
      included: [
        "Live group coaching before audiences",
        "Pitch Perfect Singalong (90-120 min, draws hundreds)",
        "30+ specialized seminar topics",
        "Custom content tailored to your group",
      ],
      formats: [
        "Single sessions",
        "Ongoing coaching",
        "In-person",
        "Virtual",
        "Private",
        "Public masterclass",
      ],
    },
  },
];

export function ServicesTabsSection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-hero text-white" id="workshops">
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-4 backdrop-blur-sm">
            <Layers className="h-4 w-4" />
            Full Service
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How Deke Can Transform Your Project
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            World-class expertise across arranging, directing, producing, and coaching
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="arranging" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/10 backdrop-blur-sm p-1.5 md:p-2 gap-1.5 md:gap-2 h-auto rounded-xl">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-white data-[state=active]:text-primary text-white/80 py-2.5 md:py-3 rounded-lg text-sm md:text-base"
                >
                  <tab.icon className="h-4 w-4 mr-2 hidden sm:inline" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6 md:mt-8">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elevated">
                  <CardHeader className="pb-4">
                    <CardTitle className="font-heading text-2xl md:text-3xl flex items-center gap-3 text-foreground">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-accent/10">
                        <tab.icon className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                      </div>
                      {tab.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className={tab.content.timeline ? "grid md:grid-cols-2 gap-6" : ""}>
                      <div>
                        <h4 className="font-semibold text-base md:text-lg mb-3 flex items-center gap-2 text-foreground">
                          <Check className="h-5 w-5 text-accent" />
                          What&apos;s Included
                        </h4>
                        <ul className="space-y-2">
                          {tab.content.included.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-muted-foreground text-sm md:text-base"
                            >
                              <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {tab.content.timeline && (
                        <div className="bg-secondary/50 rounded-lg p-5 md:p-6">
                          <h4 className="font-semibold text-base md:text-lg mb-3 text-foreground">
                            Timeline
                          </h4>
                          <p className="text-xl md:text-2xl font-bold text-accent mb-2">
                            {tab.content.timeline.time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tab.content.timeline.note}
                          </p>
                        </div>
                      )}
                    </div>

                    {tab.content.formats && (
                      <div className="border-t pt-6">
                        <h4 className="font-semibold text-base md:text-lg mb-3 text-foreground">
                          Formats Available
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {tab.content.formats.map((format) => (
                            <Badge key={format} variant="outline" className="text-sm">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
