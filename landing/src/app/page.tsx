import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import PlatformSupport from '@/components/PlatformSupport'
import HowItWorks from '@/components/HowItWorks'
import TrustSection from '@/components/TrustSection'
import FutureVision from '@/components/FutureVision'
import CTAFooter from '@/components/CTAFooter'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-background-dark">
      <Navbar />
      <Hero />
      <Features />
      <PlatformSupport />
      <HowItWorks />
      <TrustSection />
      <FutureVision />
      <CTAFooter />
      <Footer />
    </main>
  )
}
