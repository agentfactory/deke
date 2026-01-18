export interface Artwork {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  pdfUrl: string;
  philosophyFile?: string;
  technicalSpecs: {
    series: string;
    sampleSize: string;
    range: string;
    medium: string;
    fileSize: string;
  };
  created: string;
}

export const artworks: Artwork[] = [
  {
    id: "systematic-reverie",
    title: "Systematic Reverie",
    subtitle: "Documentation of Directional Shift Patterns",
    description: "A generative art piece exploring vector transitions through systematic observation. Twenty trajectory studies documenting the art of misdirection as scientific phenomenon.",
    pdfUrl: "/artwork/systematic_reverie.pdf",
    philosophyFile: "/artwork/design_philosophy.md",
    technicalSpecs: {
      series: "Series I - Vector Studies",
      sampleSize: "n = 20",
      range: "Δθ: 55°–125° variable",
      medium: "Algorithmic / Generative",
      fileSize: "27 KB",
    },
    created: "2026-01-18",
  },
  // Future artworks can be added here
];
