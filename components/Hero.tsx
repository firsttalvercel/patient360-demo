'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,161,224,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,161,224,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00A1E0] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Logos */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6 mb-14 bg-white/5 border border-white/10 rounded-2xl px-8 py-4"
        >
          <Image src="/mulesoft.webp" alt="MuleSoft" width={36} height={36} className="rounded-full" />
          <span className="text-white font-semibold text-sm tracking-wide">MuleSoft</span>
          <span className="text-white/20 text-xl font-light">×</span>
          <Image src="/docplanner.png" alt="DocPlanner" width={36} height={36} />
          <span className="text-white font-semibold text-sm tracking-wide">DocPlanner</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-7xl md:text-9xl font-extrabold tracking-tight text-white"
        >
          Patient{' '}
          <span className="text-[#00A1E0]">360</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-6 text-xl text-white/60 max-w-lg leading-relaxed"
        >
          The complete patient picture.<br />
          <span className="text-white/40 text-lg">Appointments, referrals and clinical history — unified in one AI-powered view.</span>
        </motion.p>

        {/* Tech pills */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          {[
            { label: 'A2A Agent',            color: 'border-[#00A1E0]/30 text-[#00A1E0]/70' },
            { label: 'MCP Referral Server',  color: 'border-[#00b67a]/30 text-[#00b67a]/70' },
            { label: 'Salesforce',           color: 'border-[#0070d2]/30 text-[#0070d2]/70' },
            { label: 'FHIR Backend',         color: 'border-white/10 text-white/30' },
          ].map(({ label, color }) => (
            <span key={label} className={`px-4 py-1.5 rounded-full border text-xs font-medium ${color}`}>
              {label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.a
          href="#demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 inline-flex flex-col items-center gap-2 text-white/30 hover:text-[#00A1E0] transition-colors cursor-pointer"
        >
          <span className="text-sm font-medium">See it live</span>
          <motion.span animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="text-lg">
            ↓
          </motion.span>
        </motion.a>
      </div>
    </section>
  )
}
