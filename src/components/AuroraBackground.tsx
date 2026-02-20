'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'

interface AuroraBackgroundProps {
  className?: string
  children?: ReactNode
  variant?: 'default' | 'hero' | 'section'
  intensity?: 'subtle' | 'medium' | 'vibrant'
}

export function AuroraBackground({
  children,
  className = '',
  variant = 'default',
  intensity = 'medium'
}: AuroraBackgroundProps) {
  const shouldReduceMotion = useReducedMotion()

  // Color configurations based on variant
  const variants = {
    hero: {
      base: 'from-[#0a0e27] via-[#1a1d35] to-[#2d1b42]',
      aurora1: 'rgba(120, 119, 198, 0.3)',
      aurora2: 'rgba(180, 140, 255, 0.2)',
      aurora3: 'rgba(100, 160, 255, 0.2)',
    },
    section: {
      base: 'from-[#0f1629] via-[#1e2139] to-[#2a1f3d]',
      aurora1: 'rgba(100, 99, 178, 0.2)',
      aurora2: 'rgba(160, 120, 235, 0.15)',
      aurora3: 'rgba(80, 140, 235, 0.15)',
    },
    default: {
      base: 'from-primary via-primary/95 to-accent',
      aurora1: 'rgba(120, 119, 198, 0.2)',
      aurora2: 'rgba(180, 140, 255, 0.15)',
      aurora3: 'rgba(100, 160, 255, 0.1)',
    },
  }

  const config = variants[variant]

  // Intensity multipliers for aurora effect
  const intensityMultiplier = {
    subtle: 0.6,
    medium: 1,
    vibrant: 1.4,
  }

  const multiplier = intensityMultiplier[intensity]

  return (
    <div className={`relative ${className}`}>
      {/* Base Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.base}`} />

      {/* Aurora Animation Layer */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, ${config.aurora1}, transparent),
              radial-gradient(ellipse 60% 50% at 80% 70%, ${config.aurora2}, transparent),
              radial-gradient(ellipse 70% 60% at 20% 80%, ${config.aurora3}, transparent)
            `,
            backgroundSize: '200% 200%',
            willChange: 'background-position',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* SVG Noise Texture Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay pointer-events-none">
        <filter id={`noiseFilter-${variant}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noiseFilter-${variant})`} />
      </svg>

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
