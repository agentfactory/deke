import {
  HeroSection,
  CredentialsBar,
  ServicesSection,
  VideoSection,
  BooksSection,
  PhotoGallery,
  TestimonialsSection,
  ServicesTabsSection,
  WorkshopTopicsSection,
  FAQSection,
  ContactSection,
} from "@/components/landing";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CredentialsBar />
      <ServicesSection />
      <VideoSection />
      <BooksSection />
      <PhotoGallery />
      <TestimonialsSection />
      <ServicesTabsSection />
      <WorkshopTopicsSection />
      <FAQSection />
      <ContactSection />
    </>
  );
}
