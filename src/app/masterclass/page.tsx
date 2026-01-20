import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Video,
  FileText,
  Download,
} from "lucide-react";

export const metadata = {
  title: "Masterclass",
  description:
    "Self-paced online courses to master vocal arranging, directing, and a cappella performance. Learn from the father of contemporary a cappella.",
};

const courses = [
  {
    title: "A Cappella Arranging Fundamentals",
    description:
      "Master the building blocks of creating compelling a cappella arrangements.",
    duration: "6 hours",
    lessons: 24,
    level: "Beginner",
    features: [
      "Voice leading basics",
      "Transcription techniques",
      "VP notation",
      "Pro tools demos",
      "Practice exercises",
      "Certificate",
    ],
  },
  {
    title: "Advanced Arranging Techniques",
    description:
      "Take your arrangements from good to competition-winning.",
    duration: "10 hours",
    lessons: 36,
    level: "Intermediate",
    features: [
      "Complex harmonies",
      "Groove & feel",
      "Emotional dynamics",
      "Genre adaptation",
      "Live arrangement reviews",
      "Discord community",
    ],
  },
  {
    title: "The Complete A Cappella Director",
    description:
      "Everything you need to lead a successful vocal group.",
    duration: "15 hours",
    lessons: 48,
    level: "All Levels",
    popular: true,
    features: [
      "Rehearsal mastery",
      "Blend & balance",
      "Conflict resolution",
      "Recruiting strategies",
      "Competition prep",
      "Monthly live Q&As",
      "1-on-1 coaching call",
    ],
  },
];

const included = [
  { icon: Video, title: "HD Video Lessons", description: "Crystal-clear instruction" },
  { icon: FileText, title: "Downloadable PDFs", description: "Reference materials" },
  { icon: Download, title: "Audio Examples", description: "Learn by listening" },
  { icon: Users, title: "Community Access", description: "Connect with peers" },
];

const stats = [
  { value: "10,000+", label: "Students Enrolled" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "50+", label: "Countries Represented" },
  { value: "100%", label: "Satisfaction Guarantee" },
];

export default function MasterclassPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              <BookOpen className="h-3 w-3 mr-1" />
              Online Masterclass
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Learn A Cappella From the Master
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Self-paced online courses covering everything from basic
              arranging to advanced directing techniques. Learn on your
              schedule, at your own pace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="#courses">
                  Browse Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#courses">
                  <Play className="mr-2 h-4 w-4" />
                  View Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-heading text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Courses
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each course is designed to take you from where you are to where
              you want to be.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.title}
                className={`relative flex flex-col ${
                  course.popular ? "border-primary shadow-lg" : ""
                }`}
              >
                {course.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Star className="h-3 w-3 mr-1" />
                    Best Value
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <Badge variant="secondary" className="w-fit mx-auto mb-2">
                    {course.level}
                  </Badge>
                  <CardTitle className="font-heading text-xl">
                    {course.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {course.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col">
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="h-4 w-4" />
                      {course.lessons} lessons
                    </span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {course.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={course.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/masterclass/${course.title.toLowerCase().replace(/ /g, '-')}`}>
                      Enroll Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              What's Included
            </Badge>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {included.map((item) => (
              <div key={item.title} className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of students who have transformed their a cappella
            skills. 30-day money-back guarantee on all courses.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="#courses">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
