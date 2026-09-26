import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PrivacySection from "@/components/PrivacySection";
import ForNGOs from "@/components/ForNGOs";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="bg-warm-bg">
        <HeroSection />
        <HowItWorks />
        <PrivacySection />
        <ForNGOs />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
