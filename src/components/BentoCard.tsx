'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { useMagneticHover } from '@/hooks/useMagneticHover'
import { Card } from '@/components/ui/card'
import { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function BentoCard({ children, className, delay = 0 }: BentoCardProps) {
  const { springX, springY, handleMouseMove, handleMouseLeave } = useMagneticHover(0.15)
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay }}
      style={shouldReduceMotion ? {} : { x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      className={className}
    >
      <Card className="h-full hover:shadow-2xl transition-shadow duration-300">
        {children}
      </Card>
    </motion.div>
  )
}
