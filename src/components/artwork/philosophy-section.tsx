"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhilosophySectionProps {
  philosophyContent: string;
}

export function PhilosophySection({ philosophyContent }: PhilosophySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split content into paragraphs
  const paragraphs = philosophyContent
    .split("\n\n")
    .filter(p => p.trim() && !p.startsWith("#"))
    .map(p => p.trim());

  // Show first paragraph as preview
  const preview = paragraphs[0];
  const fullContent = paragraphs;

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-2xl">Design Philosophy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            {preview}
          </p>

          {isExpanded && fullContent.slice(1).map((paragraph, index) => (
            <p key={index} className="text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {paragraphs.length > 1 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
