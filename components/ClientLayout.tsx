'use client'
import { useState, useCallback } from 'react'
import DemoSplitScreen from './DemoSplitScreen'
import ArchitectureDiagram from './ArchitectureDiagram'
import SkillsShowcase from './SkillsShowcase'

export default function ClientLayout() {
  const [triggerQuery, setTriggerQuery] = useState<{ name: string; key: number } | null>(null)

  const handleTry = useCallback((name: string) => {
    setTriggerQuery(prev => ({ name, key: (prev?.key ?? 0) + 1 }))
    setTimeout(() => {
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }, [])

  return (
    <>
      <DemoSplitScreen trigger={triggerQuery} />
      <ArchitectureDiagram />
      <SkillsShowcase onTry={handleTry} />
    </>
  )
}
