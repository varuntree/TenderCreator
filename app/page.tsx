import AboutHighlights from '@/components/sections/about-highlights';
import FAQSection from '@/components/sections/faq-section';
import FeaturesCarousel from '@/components/sections/features-carousel';
import FeaturesShowcase from '@/components/sections/features-showcase';
import Hero from '@/components/sections/hero';
import Pricing from '@/components/sections/pricing';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturesCarousel />
      <FeaturesShowcase />
      <AboutHighlights />
      <FAQSection />
      <Pricing />
    </>
  );
}
