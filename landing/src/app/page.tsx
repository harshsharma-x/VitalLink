'use client'

import Hero from '@/components/Hero'
import About from '@/components/About'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Impact from '@/components/Impact'
import FutureScope from '@/components/FutureScope'
import TechStack from '@/components/TechStack'
import Demo from '@/components/Demo'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Features />
      <HowItWorks />
      <Impact />
      <FutureScope />
      <TechStack />
      <Demo />
      <Footer />
    </main>
  )
}
