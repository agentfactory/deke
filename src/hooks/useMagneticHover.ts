'use client'
import { useMotionValue, useSpring } from 'framer-motion'

export function useMagneticHover(strength = 0.25) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { damping: 20, stiffness: 300 })
  const springY = useSpring(y, { damping: 20, stiffness: 300 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) * strength)
    y.set((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return { springX, springY, handleMouseMove, handleMouseLeave }
}
