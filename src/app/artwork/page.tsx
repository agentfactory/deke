import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { artworks } from "@/lib/artwork-data";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export const metadata = {
  title: "Artwork Gallery | Deke Sharon",
  description:
    "Explore generative art pieces and algorithmic creations by Deke Sharon.",
};

export default function ArtworkIndexPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Gallery
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Artwork Gallery
            </h1>
            <p className="text-lg text-muted-foreground">
              A collection of generative art pieces exploring systematic
              patterns, algorithmic processes, and the intersection of
              precision and creativity.
            </p>
          </div>
        </div>
      </section>

      {/* Artwork Grid */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <Card
                key={artwork.id}
                className="group hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  {/* Preview/Thumbnail */}
                  <div className="relative aspect-square rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 overflow-hidden">
                    <div className="text-center p-8">
                      <FileText className="h-16 w-16 mx-auto text-primary/30 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {artwork.technicalSpecs.medium}
                      </p>
                    </div>
                  </div>

                  <CardTitle className="font-heading text-2xl mb-2">
                    {artwork.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {artwork.subtitle}
                  </p>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {artwork.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>{artwork.technicalSpecs.series}</span>
                    <span>{artwork.technicalSpecs.sampleSize}</span>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/artwork/${artwork.id}`}>
                      View Artwork
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state for future expansion */}
          {artworks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No artworks available at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              About These Works
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Each piece in this collection represents an exploration of
              generative art—where algorithms and systematic processes create
              visual patterns that reveal hidden structures and relationships.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              These works blend the precision of mathematical systems with
              the organic quality of human aesthetic judgment, documenting
              phenomena that exist at the intersection of order and chaos.
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">
                Commission Custom Artwork
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
