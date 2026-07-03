import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface WizardCardProps {
  eyebrow?: string
  title: string
  description?: string
  children: ReactNode
}

export default function WizardCard({ eyebrow, title, description, children }: WizardCardProps) {
  return (
    <motion.section
      key={title}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
      className="glass rounded-xl p-5 sm:p-6"
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      {description && <p className="text-muted text-sm leading-relaxed max-w-2xl mb-5">{description}</p>}
      {children}
    </motion.section>
  )
}
