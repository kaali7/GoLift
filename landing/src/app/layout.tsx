import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GoLift - Smart Fitness & Workout Tracking Platform',
  description: 'GoLift is a modern fitness platform for tracking workouts, managing training sessions, and getting actionable insights. Available on Web and Desktop.',
  keywords: ['fitness app', 'workout tracker', 'gym app', 'training plan', 'exercise tracking', 'fitness platform'],
  authors: [{ name: 'GoLift Team' }],
  openGraph: {
    title: 'GoLift - Smart Fitness & Workout Tracking Platform',
    description: 'Track workouts, manage sessions, and get insights. Available on Web & Desktop.',
    type: 'website',
    locale: 'en_US',
    siteName: 'GoLift',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoLift - Smart Fitness & Workout Tracking',
    description: 'Track workouts, manage sessions, and get insights. Available on Web & Desktop.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
