import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TechnicalSpecsProps {
  specs: {
    series: string;
    sampleSize: string;
    range: string;
    medium: string;
    fileSize: string;
  };
}

export function TechnicalSpecs({ specs }: TechnicalSpecsProps) {
  const items = [
    { label: "Series", value: specs.series },
    { label: "Sample Size", value: specs.sampleSize },
    { label: "Range", value: specs.range },
    { label: "Medium", value: specs.medium },
    { label: "File Size", value: specs.fileSize },
  ];

  return (
    <Card className="bg-muted/30">
      <CardHeader>
        <CardTitle className="text-lg">Technical Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <dt className="text-sm text-muted-foreground font-medium">
                {item.label}
              </dt>
              <dd className="text-sm font-mono">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
