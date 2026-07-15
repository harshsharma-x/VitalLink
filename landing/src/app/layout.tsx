import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VitalLink - Emergency Blood Matching Platform',
  description: 'Connect patients in urgent need of blood with verified donors in under 10 minutes. Save lives with VitalLink.',
  keywords: 'blood donation, emergency blood, blood bank, donate blood, India',
  openGraph: {
    title: 'VitalLink - Emergency Blood Matching Platform',
    description: 'Connect patients in urgent need of blood with verified donors in under 10 minutes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
