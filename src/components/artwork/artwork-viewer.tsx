"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface ArtworkViewerProps {
  pdfUrl: string;
  title: string;
}

export function ArtworkViewer({ pdfUrl, title }: ArtworkViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="space-y-4">
      <div className="relative w-full overflow-hidden rounded-lg border border-border bg-muted/30">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="h-[600px] w-full"
          onLoad={() => setIsLoading(false)}
        >
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="h-[600px] w-full"
          />
          <div className="flex h-[600px] items-center justify-center p-8">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Your browser doesn't support embedded PDFs.
              </p>
              <Button asChild>
                <a href={pdfUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            </div>
          </div>
        </object>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <div className="text-muted-foreground">Loading artwork...</div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <a href={pdfUrl} download={`${title}.pdf`}>
            <Download className="mr-2 h-4 w-4" />
            Download Artwork
          </a>
        </Button>
      </div>

      {/* Mobile-friendly notice */}
      <div className="md:hidden">
        <p className="text-center text-sm text-muted-foreground">
          For the best viewing experience on mobile, download the PDF.
        </p>
      </div>
    </div>
  );
}
