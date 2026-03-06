'use client'

import { motion } from 'framer-motion'
import { Brain, Smartphone, Users, Sparkles } from 'lucide-react'

const futureFeatures = [
  {
    icon: Brain,
    title: 'AI Personalization',
    description: 'Smart workout recommendations based on your progress, goals, and recovery patterns.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Native iOS and Android apps for seamless on-the-go workout tracking.',
  },
  {
    icon: Users,
    title: 'Trainer Mode',
    description: 'Connect with certified trainers for personalized guidance and plans.',
  },
  {
    icon: Sparkles,
    title: 'Advanced Analytics',
    description: 'Long-term performance forecasting and detailed workout analysis.',
  },
]

export default function FutureVision() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-primary-900/10 to-background-dark" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/50 border border-primary-700/50 mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-primary-300 font-medium">Coming Soon</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
            The Future of
            <span className="gradient-text"> GoLift</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            We&apos;re constantly building. Here&apos;s what&apos;s on our roadmap to make your fitness journey even better.
          </p>
        </motion.div>

        {/* Future Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {futureFeatures.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative glass-card rounded-2xl p-8 hover:border-primary-600/50 transition-all"
            >
              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary-900/50 border border-primary-700/50">
                <span className="text-xs text-primary-400 font-medium">Planned</span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-primary-900/50 flex items-center justify-center mb-5 group-hover:bg-primary-800/50 transition-colors">
                <item.icon className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
