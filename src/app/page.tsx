import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TheShift from '@/components/TheShift';
import PlatformCapabilities from '@/components/PlatformCapabilities';
import HowItWorks from '@/components/HowItWorks';
import Institutions from '@/components/Institutions';
import Principles from '@/components/Principles';
import EarlyAccessTeaser from '@/components/EarlyAccessTeaser';
import EarlyAccessModal from '@/components/EarlyAccessModal';
import ContactModal from '@/components/ContactModal';
import FaqSection from '@/components/FaqSection';
import TrustCompliance from '@/components/TrustCompliance';
import ClosingCta from '@/components/ClosingCta';
import Footer from '@/components/Footer';
import SocialRail from '@/components/SocialRail';
import AmbientCanvas from '@/components/AmbientCanvas';
import CursorGlow from '@/components/CursorGlow';
import ScrollRevealProvider from '@/components/ScrollRevealProvider';
import { EarlyAccessProvider } from '@/context/EarlyAccessContext';

export default function HomePage() {
  return (
    <EarlyAccessProvider>
      <ScrollRevealProvider>
        <div className="site-shell relative min-h-screen bg-deep">
          {/* Dynamic Ambient Background Canvas & Cursor Follower */}
          <AmbientCanvas />
          <CursorGlow />

          {/* Left Social Dock */}
          <SocialRail />

          {/* Sticky Header */}
          <Header />

          {/* Main Sections Flow */}
          <main>
            <Hero />
            <TheShift />
            <PlatformCapabilities />
            <HowItWorks />
            <Institutions />
            <Principles />
            <EarlyAccessTeaser />
            <FaqSection />
            <TrustCompliance />
            <ClosingCta />
          </main>

          {/* Site Footer */}
          <Footer />

          {/* Global Classy Early Access Popup Modal */}
          <EarlyAccessModal />

          {/* Global Classy Direct Contact Modal */}
          <ContactModal />
        </div>
      </ScrollRevealProvider>
    </EarlyAccessProvider>
  );
}

