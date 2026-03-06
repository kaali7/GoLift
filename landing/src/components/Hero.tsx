'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-background-dark to-background-dark" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/50 border border-primary-700/50 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-primary-300 font-medium">Smart Fitness Platform</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
              Train Smarter.
              <span className="block gradient-text">Get Results.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8">
              GoLift is your complete workout tracking platform. Create custom plans, track every session, and see your progress with actionable insights.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary-700 hover:bg-primary-600 text-white font-semibold text-lg transition-all hover:shadow-xl hover:shadow-primary-700/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-gray-700 hover:border-primary-600 text-gray-300 hover:text-white font-semibold text-lg transition-all hover:bg-primary-900/20"
              >
                Explore Features
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
              <div>
                <div className="text-2xl font-heading font-bold text-white">100%</div>
                <div className="text-sm text-gray-500">Free to Use</div>
              </div>
              <div className="w-px h-12 bg-gray-700" />
              <div>
                <div className="text-2xl font-heading font-bold text-white">3+</div>
                <div className="text-sm text-gray-500">Platforms</div>
              </div>
              <div className="w-px h-12 bg-gray-700" />
              <div>
                <div className="text-2xl font-heading font-bold text-white">AI-Ready</div>
                <div className="text-sm text-gray-500">Architecture</div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - App Screenshot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative animate-float">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-600/30 to-primary-400/30 rounded-3xl blur-2xl" />
              
              {/* Device frame */}
              <div className="relative bg-surface-dark rounded-3xl p-2 border border-primary-700/30 shadow-2xl">
                <Image
                  src="/active_workout_view.png"
                  alt="GoLift Active Workout View"
                  width={400}
                  height={800}
                  className="rounded-2xl"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
