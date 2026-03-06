'use client'

import { motion } from 'framer-motion'
import { UserPlus, Dumbbell, Play, TrendingUp } from 'lucide-react'

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up in seconds with email verification. Set up your profile and fitness goals.',
  },
  {
    step: 2,
    icon: Dumbbell,
    title: 'Choose Your Plan',
    description: 'Pick from workout templates or build your own custom training program.',
  },
  {
    step: 3,
    icon: Play,
    title: 'Start Training',
    description: 'Begin your workout session. Track sets, reps, weights, and rest periods.',
  },
  {
    step: 4,
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'See your improvements over time with detailed insights and analytics.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-primary-900/5 to-background-dark" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mt-3 mb-4">
            Get Started in
            <span className="gradient-text"> 4 Simple Steps</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From signup to seeing results, GoLift makes your fitness journey straightforward and effective.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-700/50 to-transparent -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, idx) => (
              <motion.div 
                key={item.step} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative"
              >
                {/* Step card */}
                <div className="glass-card rounded-2xl p-8 text-center hover:border-primary-600/50 transition-all h-full group">
                  {/* Step number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm border-4 border-background-dark group-hover:bg-primary-600 transition-colors">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-primary-900/50 flex items-center justify-center mx-auto mb-5 mt-2 group-hover:bg-primary-800/50 transition-colors">
                    <item.icon className="w-8 h-8 text-primary-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-heading font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
