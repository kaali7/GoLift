'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  Dumbbell, 
  Timer, 
  BarChart3, 
  Calendar,
  Target,
  Zap
} from 'lucide-react'

const features = [
  {
    icon: Dumbbell,
    title: 'Workout Plans',
    description: 'Choose from templates or create your own custom workout plans with warm-up, main workout, and recovery exercises.',
    image: '/active_workout_view.png',
  },
  {
    icon: Timer,
    title: 'Session Tracking',
    description: 'Track every set, rep, and weight in real-time. Mark exercises as complete and log your feedback.',
    image: '/session_start.png',
  },
  {
    icon: BarChart3,
    title: 'Progress Insights',
    description: 'Visualize your strength trends, track workout history, and see measurable progress over time.',
    image: '/insights_dashboard.png',
  },
]

const additionalFeatures = [
  {
    icon: Calendar,
    title: 'Structured Programs',
    description: 'Multi-day workout plans with proper rest and recovery scheduling.',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set fitness goals and track your journey with clear milestones.',
  },
  {
    icon: Zap,
    title: 'Quick Actions',
    description: 'Start workouts instantly with a clean, intuitive interface.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-surface-dark/50 to-background-dark" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
            Everything You Need to
            <span className="gradient-text"> Succeed</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From workout creation to progress tracking, GoLift gives you the tools to train smarter and achieve your fitness goals.
          </p>
        </motion.div>

        {/* Main Features with Screenshots */}
        <div className="space-y-24 mb-24">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center`}
            >
              {/* Content */}
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex-1 text-center lg:text-left"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900/50 border border-primary-700/50 mb-6">
                  <feature.icon className="w-7 h-7 text-primary-400" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {feature.description}
                </p>
              </motion.div>

              {/* Screenshot */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="flex-1 flex justify-center"
              >
                <div className="relative glass-card rounded-3xl p-4 card-shadow hover:border-primary-600/50 transition-all duration-500">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={350}
                    height={700}
                    className="rounded-2xl"
                  />
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {additionalFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card rounded-2xl p-8 hover:border-primary-600/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center mb-5 group-hover:bg-primary-800/50 transition-colors">
                <feature.icon className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
