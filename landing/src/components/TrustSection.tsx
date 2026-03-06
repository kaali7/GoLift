'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Database, Zap } from 'lucide-react'

const trustPoints = [
  {
    icon: Lock,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with token refresh and secure password handling.',
  },
  {
    icon: Shield,
    title: 'Data Privacy',
    description: 'Your workout data stays yours. No selling to third parties.',
  },
  {
    icon: Database,
    title: 'Reliable Storage',
    description: 'PostgreSQL database with proper migrations and data integrity.',
  },
  {
    icon: Zap,
    title: 'Fast & Lightweight',
    description: 'Tauri desktop app uses minimal resources while delivering native performance.',
  },
]

export default function TrustSection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Trust & Reliability</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
            Built with
            <span className="gradient-text"> Quality in Mind</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            GoLift is built on solid foundations with security, performance, and reliability at its core.
          </p>
        </motion.div>

        {/* Trust Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center hover:border-primary-600/50 transition-all group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-900/50 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-800/50 transition-colors">
                <item.icon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 glass-card rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-heading font-semibold text-white mb-4">
            Modern Tech Stack
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['FastAPI', 'React', 'TypeScript', 'Tauri', 'PostgreSQL', 'Tailwind CSS'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-lg bg-primary-900/30 border border-primary-700/30 text-primary-300 text-sm font-medium hover:bg-primary-800/40 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
