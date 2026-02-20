'use client'
import { motion } from 'framer-motion'
import { useMagneticHover } from '@/hooks/useMagneticHover'
import { Button } from '@/components/ui/button'
import { ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'lg'
  asChild?: boolean
}

export function MagneticButton({ children, className, variant, size, asChild }: MagneticButtonProps) {
  const { springX, springY, handleMouseMove, handleMouseLeave } = useMagneticHover()

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Button variant={variant} size={size} className={className} asChild={asChild}>
        {children}
      </Button>
    </motion.div>
  )
}
