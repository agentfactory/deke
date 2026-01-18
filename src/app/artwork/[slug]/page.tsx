import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { artworks } from "@/lib/artwork-data";
import { ArtworkViewer } from "@/components/artwork/artwork-viewer";
import { PhilosophySection } from "@/components/artwork/philosophy-section";
import { TechnicalSpecs } from "@/components/artwork/technical-specs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ArtworkPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ArtworkPageProps): Promise<Metadata> {
  const artwork = artworks.find((a) => a.id === params.slug);

  if (!artwork) {
    return {
      title: "Artwork Not Found",
    };
  }

  return {
    title: artwork.title,
    description: artwork.description,
    openGraph: {
      title: artwork.title,
      description: artwork.subtitle,
      type: "website",
    },
  };
}

// Generate static params for all artworks
export async function generateStaticParams() {
  return artworks.map((artwork) => ({
    slug: artwork.id,
  }));
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const artwork = artworks.find((a) => a.id === params.slug);

  if (!artwork) {
    notFound();
  }

  // Fetch philosophy content
  let philosophyContent = "";
  if (artwork.philosophyFile) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}${artwork.philosophyFile}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        philosophyContent = await res.text();
      }
    } catch (error) {
      console.error("Failed to fetch philosophy content:", error);
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Generative Art
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {artwork.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-6">
              {artwork.subtitle}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {artwork.description}
            </p>
          </div>
        </div>
      </section>

      {/* Viewer Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ArtworkViewer pdfUrl={artwork.pdfUrl} title={artwork.title} />
            </div>
            <div>
              <TechnicalSpecs specs={artwork.technicalSpecs} />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      {philosophyContent && (
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <PhilosophySection philosophyContent={philosophyContent} />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Interested in Commissioning Artwork?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Custom generative art pieces are available for commission.
              Each piece is uniquely created using algorithmic processes
              and can be tailored to your vision.
            </p>
            <Button size="lg" asChild>
              <Link href="/contact">
                Get in Touch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
