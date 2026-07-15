'use client'

import Hero from '@/components/Hero'
import About from '@/components/About'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Impact from '@/components/Impact'
import TechStack from '@/components/TechStack'
import Launch from '@/components/Launch'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Impact />
      <TechStack />
      <Launch />
      <Footer />
    </main>
  )
}
