'use client'
import { useState, useRef, useEffect } from 'react'
import { Appointment, Referral, TokenMeta } from '@/app/api/patient360/route'
import AppointmentCard from './AppointmentCard'
import ReferralCard from './ReferralCard'
import PlatformView, { LogLine } from './PlatformView'

interface Patient360Data {
  appointments: Appointment[]
  referrals: Referral[]
  tokens: TokenMeta | null
  timings: { appointments: number; referrals: number; total: number }
}

interface Props {
  trigger?: { name: string; key: number } | null
}

type OptimisticUpdate = Partial<Appointment> | 'delete'

const SCENARIOS = [
  { tag: '360', color: 'bg-purple-100 text-purple-700 border-purple-200', name: 'Patient 360', query: 'Alice Johnson', hint: 'Full view — appts + referrals' },
  { tag: 'A2A', color: 'bg-blue-100 text-[#00A1E0] border-blue-200',       name: 'By Name',     query: 'Carlos Ruiz',    hint: 'Appointments by patient name' },
  { tag: 'A2A', color: 'bg-blue-100 text-[#00A1E0] border-blue-200',       name: 'By Name',     query: 'John Smith',     hint: 'Try another patient' },
  { tag: 'MCP', color: 'bg-emerald-100 text-[#00b67a] border-emerald-200', name: 'Referrals',   query: 'Alice Johnson',  hint: 'Referrals from FHIR backend' },
  { tag: 'MCP', color: 'bg-emerald-100 text-[#00b67a] border-emerald-200', name: 'Referrals',   query: 'Carlos Ruiz',    hint: 'Referrals for Carlos' },
]

let logCounter = 0
const makeLog = (type: LogLine['type'], text: string): LogLine => ({
  id: `log-${++logCounter}-${Date.now()}`,
  type,
  text,
})

export default function DemoSplitScreen({ trigger }: Props) {
  const [name, setName]           = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData]           = useState<Patient360Data | null>(null)
  const [logs, setLogs]           = useState<LogLine[]>([])
  const [activeView, setActiveView] = useState<'doctor' | 'patient'>('doctor')
  const [actingId, setActingId]     = useState<string | null>(null)
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (!trigger) return
    setName(trigger.name)
    runSearch(trigger.name)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger?.key])

  const clearTo = () => { timeoutRefs.current.forEach(clearTimeout); timeoutRefs.current = [] }
  const delay   = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); timeoutRefs.current.push(t) }

  async function runSearch(q: string) {
    if (!q.trim() || isLoading) return
    clearTo()
    setIsLoading(true)
    setData(null)
    setLogs([])

    const add = (line: LogLine) => setLogs(prev => [...prev, line])
    add(makeLog('info',    `Intent received: "Show me ${q}"`))
    delay(() => add(makeLog('loading', '[Salesforce] Classifying intent...')), 350)

    const res    = await fetch('/api/patient360', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName: q }),
    })
    const result: Patient360Data = await res.json()

    delay(() => add(makeLog('success', `Intent: get-appointments-by-name { patient_name: "${q}" }`)),        100)
    delay(() => add(makeLog('loading', '[A2A Agent] → appointments backend...')),                            350)
    delay(() => add(makeLog('success', `${result.appointments.length} appointment(s) (${result.timings.appointments}ms)`)), 700)
    delay(() => add(makeLog('loading', '[MCP / Referral API] → FHIR backend...')),                          900)
    delay(() => add(makeLog('success', `${result.referrals.length} referral(s) matched (${result.timings.referrals}ms)`)),  1200)
    delay(() => add(makeLog('divider', '')),                                                                 1400)
    delay(() => {
      if (result.tokens) {
        add(makeLog('meta', `Model: Salesforce`))
        add(makeLog('meta', `Tokens — prompt: ${result.tokens.promptTokens} | out: ${result.tokens.responseTokens} | total: ${result.tokens.totalTokens}`))
      }
      add(makeLog('meta', `Wall time: ${result.timings.total}ms`))
    }, 1500)
    delay(() => { setData(result); setIsLoading(false) }, 1600)
  }

  async function handleAction(aptId: string, instruction: string, optimistic?: OptimisticUpdate) {
    setActingId(aptId)
    const add = (line: LogLine) => setLogs(prev => [...prev, line])
    add(makeLog('divider', ''))
    add(makeLog('info',    `Action: "${instruction}"`))
    add(makeLog('loading', '[A2A Agent] → processing action...'))

    const res    = await fetch('/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instruction }),
    })
    const result = await res.json()

    add(makeLog('success', result.response))
    if (result.tokens) add(makeLog('meta', `Tokens: ${result.tokens.totalTokens} · ${result.timing}ms`))

    // Optimistically update local state
    if (optimistic && data) {
      setData(prev => {
        if (!prev) return prev
        if (optimistic === 'delete') {
          return { ...prev, appointments: prev.appointments.filter(a => a.id !== aptId) }
        }
        return {
          ...prev,
          appointments: prev.appointments.map(a => a.id === aptId ? { ...a, ...optimistic } : a),
        }
      })
    }
    setActingId(null)
  }


  // Patient-friendly summary
  function PatientSummary() {
    if (!data) return null
    const next = data.appointments.find(a => a.status !== 'cancelled')
    const rest = data.appointments.filter(a => a !== next)

    return (
      <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
        {/* Patient banner */}
        <div className="bg-gradient-to-br from-[#00b67a]/10 to-transparent border border-[#00b67a]/20 rounded-2xl p-5">
          <p className="text-xs text-[#00b67a] font-semibold uppercase tracking-widest mb-1">Hello,</p>
          <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
          <p className="text-slate-500 text-sm mt-1">
            {data.appointments.length} appointment{data.appointments.length !== 1 ? 's' : ''} · {data.referrals.length} referral{data.referrals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Next appointment — featured */}
        {next && (
          <div>
            <p className="text-xs text-[#00A1E0] uppercase tracking-widest font-semibold mb-2">Your next appointment</p>
            <AppointmentCard
              apt={next} index={0}
              onAction={(instr, opt) => handleAction(next.id, instr, opt)}
              acting={actingId === next.id}
            />
          </div>
        )}

        {/* Rest of appointments */}
        {rest.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">
              Other appointments ({rest.length})
            </p>
            <div className="space-y-2">
              {rest.map((apt, i) => (
                <AppointmentCard
                  key={apt.id} apt={apt} index={i + 1}
                  onAction={(instr, opt) => handleAction(apt.id, instr, opt)}
                  acting={actingId === apt.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Referrals */}
        {data.referrals.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Your referrals</p>
            <div className="space-y-2">
              {data.referrals.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-slate-800 text-sm font-medium">{r.diagnosis}</p>
                    <p className="text-slate-400 text-xs">→ {r.toProvider?.name?.includes('/') ? 'Specialist' : (r.toProvider?.name ?? 'Specialist')}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200">active</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <section id="demo" className="py-20 px-6 bg-slate-50">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[#00A1E0] text-xs font-semibold tracking-widest uppercase mb-3">Live Demo</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Ask about a patient</h2>
        </div>

        {/* Search bar */}
        <div className="flex gap-3 max-w-xl mx-auto mb-10">
          <input
            className="flex-1 bg-white border border-slate-200 rounded-xl px-5 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A1E0] focus:ring-2 focus:ring-[#00A1E0]/10 transition-all text-sm shadow-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runSearch(name)}
            placeholder="Type a patient name..."
          />
          <button
            onClick={() => runSearch(name)}
            disabled={isLoading}
            className="px-6 py-3 bg-[#00A1E0] hover:bg-[#0090c7] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shadow-sm whitespace-nowrap"
          >
            {isLoading ? 'Searching…' : 'Search Patient'}
          </button>
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_320px] gap-6">

          {/* COL 1 — Scenarios + free text */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">Quick scenarios</p>
            {SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setName(s.query); runSearch(s.query) }}
                className={`text-left bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all group ${name === s.query && data ? 'ring-2 ring-[#00A1E0]/30 border-[#00A1E0]/40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${s.color}`}>
                    {s.tag}
                  </span>
                  <span className="text-slate-300 group-hover:text-[#00A1E0] text-sm transition-colors">→</span>
                </div>
                <p className="text-slate-800 font-semibold text-sm">{s.query}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.hint}</p>
              </button>
            ))}

            {/* Free text */}
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Or type your own</p>
              <input
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00A1E0] transition-all"
                placeholder="Any patient name..."
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch(name)}
              />
              <button
                onClick={() => runSearch(name)}
                disabled={isLoading || !name.trim()}
                className="mt-2 w-full py-2 rounded-lg bg-slate-900 hover:bg-[#00A1E0] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                Search →
              </button>
            </div>
          </div>

          {/* COL 2 — Doctor / Patient view */}
          <div className="flex flex-col gap-4">
            {/* View toggle */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
              <button
                onClick={() => setActiveView('doctor')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'doctor' ? 'bg-[#00A1E0] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                👨‍⚕️ Doctor View
              </button>
              <button
                onClick={() => setActiveView('patient')}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeView === 'patient' ? 'bg-[#00b67a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                🧑 Patient View
              </button>
            </div>

            {/* Empty state */}
            {!data && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
                <p className="text-slate-400 font-medium">Select a scenario or search a patient</p>
                <p className="text-slate-300 text-sm mt-1">Results will appear here</p>
              </div>
            )}

            {/* Skeleton */}
            {isLoading && !data && (
              <div className="flex-1 rounded-2xl border border-slate-200 bg-white py-24 animate-pulse" />
            )}

            {/* DOCTOR VIEW */}
            {data && activeView === 'doctor' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-[#00A1E0]/10 to-transparent border border-[#00A1E0]/20 rounded-2xl p-5">
                  <p className="text-xs text-[#00A1E0] font-semibold uppercase tracking-widest mb-1">Clinical Record</p>
                  <h3 className="text-2xl font-bold text-slate-900">{name}</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {data.appointments.length} appointment{data.appointments.length !== 1 ? 's' : ''} · {data.referrals.length} referral{data.referrals.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#00A1E0] uppercase tracking-widest mb-3 flex items-center gap-2">
                      Appointments <span className="bg-[#00A1E0]/10 text-[#00A1E0] rounded-full px-2 py-0.5 text-[10px]">{data.appointments.length}</span>
                    </p>
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {data.appointments.length === 0
                        ? <p className="text-slate-400 text-sm">No appointments found.</p>
                        : data.appointments.map((apt, i) => (
                            <AppointmentCard
                              key={apt.id} apt={apt} index={i}
                              onAction={(instr, opt) => handleAction(apt.id, instr, opt)}
                              acting={actingId === apt.id}
                            />
                          ))
                      }
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#00b67a] uppercase tracking-widest mb-3 flex items-center gap-2">
                      Referrals <span className="bg-[#00b67a]/10 text-[#00b67a] rounded-full px-2 py-0.5 text-[10px]">{data.referrals.length}</span>
                    </p>
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {data.referrals.length === 0
                        ? <p className="text-slate-400 text-sm">No referrals found.</p>
                        : data.referrals.map((r, i) => <ReferralCard key={r.referralId ?? i} referral={r} index={i} />)
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PATIENT VIEW */}
            {data && activeView === 'patient' && <PatientSummary />}

          </div>

          {/* COL 3 — Platform terminal (stays dark) */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">Platform view</p>
            <div className="flex-1 min-h-[520px]">
              <PlatformView lines={logs} isLoading={isLoading} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
