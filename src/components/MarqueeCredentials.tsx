'use client'
import { motion } from 'framer-motion'

const credentials = [
  { number: '2,000+', label: 'Arrangements' },
  { number: '3', label: 'Grammy Nominations' },
  { number: '$580M', label: 'Box Office' },
  { number: '30+', label: 'Years Pioneer' },
  { number: '400+', label: 'Singers at Carnegie' },
]

export function MarqueeCredentials() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 py-12">
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {[...credentials, ...credentials, ...credentials, ...credentials].map((cred, i) => (
          <div key={i} className="flex items-center gap-3">
            <motion.span
              className="text-4xl md:text-5xl font-bold"
              style={{
                fontFamily: 'Inter Tight, sans-serif',
                fontVariationSettings: '"wght" 700',
              }}
              animate={{
                fontVariationSettings: ['"wght" 700', '"wght" 900', '"wght" 700'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              {cred.number}
            </motion.span>
            <span className="text-lg text-muted-foreground">{cred.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
