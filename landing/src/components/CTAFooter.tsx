'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Download } from 'lucide-react'

export default function CTAFooter() {
  return (
    <section id="download" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-bg opacity-90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Ready to Transform Your Training?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join GoLift today and start tracking your workouts with a platform designed for real results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#download"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary-700 font-semibold text-lg transition-all hover:bg-gray-100 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download Desktop App
            </a>
            <a
              href="#download"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/50 hover:border-white text-white font-semibold text-lg transition-all hover:bg-white/10"
            >
              Try Web App
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Additional info */}
          <p className="mt-8 text-white/60 text-sm">
            100% Free • No Credit Card Required • Works on Windows, macOS, Linux
          </p>
        </motion.div>
      </div>
    </section>
  )
}
