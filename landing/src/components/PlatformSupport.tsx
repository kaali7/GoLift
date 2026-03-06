'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Monitor, Globe, Apple, Laptop } from 'lucide-react'

const platforms = [
  {
    icon: Globe,
    name: 'Web App',
    description: 'Access from any browser, anywhere. Full-featured responsive design.',
    status: 'Available',
    statusColor: 'text-green-400',
  },
  {
    icon: Monitor,
    name: 'Windows',
    description: 'Native desktop app built with Tauri. Fast and lightweight.',
    status: 'Available',
    statusColor: 'text-green-400',
  },
  {
    icon: Laptop,
    name: 'macOS',
    description: 'Seamless experience on Apple desktops and laptops.',
    status: 'Available',
    statusColor: 'text-green-400',
  },
  {
    icon: Apple,
    name: 'Mobile',
    description: 'iOS and Android apps for on-the-go tracking.',
    status: 'Coming Soon',
    statusColor: 'text-primary-400',
  },
]

export default function PlatformSupport() {
  return (
    <section id="platforms" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Platforms</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
            Train Anywhere,
            <span className="gradient-text"> Any Device</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            GoLift works seamlessly across web and desktop. Same features, same experience, wherever you are.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Platform Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {platforms.map((platform, idx) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6 hover:border-primary-600/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center flex-shrink-0">
                    <platform.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-white mb-1">
                      {platform.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {platform.description}
                    </p>
                    <span className={`text-sm font-medium ${platform.statusColor}`}>
                      {platform.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop Screenshot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-primary-600/20 to-primary-400/20 rounded-3xl blur-3xl" />
              
              {/* Desktop frame */}
              <div className="relative bg-surface-dark rounded-2xl p-3 border border-primary-700/30 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 h-6 bg-background-dark rounded-lg" />
                </div>
                <Image
                  src="/tauri_window_show_app.png"
                  alt="GoLift Desktop App"
                  width={500}
                  height={400}
                  className="rounded-lg transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
