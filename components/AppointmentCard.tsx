'use client'
import { useState, useEffect } from 'react'
import { Appointment } from '@/app/api/patient360/route'

const ALL_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00']

function getSlots(date: string): { time: string; booked: boolean }[] {
  if (!date) return []
  const seed = date.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const booked = new Set([ALL_SLOTS[seed % 10], ALL_SLOTS[(seed + 3) % 10], ALL_SLOTS[(seed + 6) % 10]])
  return ALL_SLOTS.map(t => ({ time: t, booked: booked.has(t) }))
}

const statusStyle: Record<string, string> = {
  scheduled:   'bg-blue-50 text-blue-600 border border-blue-200',
  confirmed:   'bg-emerald-50 text-emerald-600 border border-emerald-200',
  rescheduled: 'bg-amber-50 text-amber-600 border border-amber-200',
  'follow-up': 'bg-purple-50 text-purple-600 border border-purple-200',
  cancelled:   'bg-red-50 text-red-500 border border-red-200',
}

export const DOCTOR_POOL = [
  { name: 'Dr. Sarah Chen',       specialty: 'Cardiology' },
  { name: 'Dr. James Wilson',     specialty: 'Neurology' },
  { name: 'Dr. Maria Rodriguez',  specialty: 'Orthopedics' },
  { name: 'Dr. David Kim',        specialty: 'Dermatology' },
  { name: 'Dr. Emily Thompson',   specialty: 'General Practice' },
  { name: 'Dr. Robert Martinez',  specialty: 'Oncology' },
  { name: 'Dr. Lisa Park',        specialty: 'Pediatrics' },
  { name: 'Dr. Michael Brown',    specialty: 'Psychiatry' },
]

type ActionPanel = 'delete' | 'reschedule' | 'doctor' | null

interface Props {
  apt: Appointment
  index: number
  onAction: (instruction: string, optimistic?: Partial<Appointment> | 'delete') => void
  acting?: boolean
}

export default function AppointmentCard({ apt, index, onAction, acting }: Props) {
  const badge = statusStyle[apt.status.toLowerCase()] ?? 'bg-slate-100 text-slate-500 border border-slate-200'
  const [panel, setPanel]   = useState<ActionPanel>(null)
  const [date, setDate]     = useState(apt.date)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slots, setSlots]   = useState<{ time: string; booked: boolean }[]>([])
  const [doctor, setDoctor] = useState(DOCTOR_POOL[0].name)

  useEffect(() => {
    if (panel === 'reschedule') {
      setSlots(getSlots(date))
      setSelectedSlot(null)
    }
  }, [date, panel])

  const toggle = (p: ActionPanel) => setPanel(prev => prev === p ? null : p)

  return (
    <div
      className="animate-fade-in-up bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      {/* Main info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] text-slate-400 font-mono mb-0.5">#{apt.id}</p>
            <p className="font-semibold text-slate-800 text-sm">{apt.doctor}</p>
            <p className="text-xs text-[#00A1E0] mt-0.5">{apt.specialty}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${badge}`}>
            {apt.status}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
          <span>📅 {apt.date}</span>
          <span>🕐 {apt.time}</span>
          <span>📍 {apt.location}</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex border-t border-slate-100 divide-x divide-slate-100">
        <ActionBtn active={panel === 'reschedule'} onClick={() => toggle('reschedule')}>📅 Reschedule</ActionBtn>
        <ActionBtn active={panel === 'doctor'}     onClick={() => toggle('doctor')}>👨‍⚕️ Doctor</ActionBtn>
        <ActionBtn active={panel === 'delete'}     onClick={() => toggle('delete')} danger>🗑 Delete</ActionBtn>
      </div>

      {/* Inline panels */}
      {panel === 'reschedule' && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2.5">
          {/* Date picker */}
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#00A1E0] bg-white" />

          {/* Available time slots */}
          {slots.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                Available slots for {date}
              </p>
              <div className="grid grid-cols-5 gap-1">
                {slots.map(({ time, booked }) => (
                  <button
                    key={time}
                    disabled={booked}
                    onClick={() => setSelectedSlot(time)}
                    className={`py-1.5 rounded-lg text-[11px] font-medium transition-all border
                      ${booked
                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                        : selectedSlot === time
                          ? 'bg-[#00A1E0] text-white border-[#00A1E0] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-[#00A1E0] hover:text-[#00A1E0]'
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            disabled={acting || !selectedSlot}
            onClick={() => {
              if (!selectedSlot) return
              onAction(
                `Reschedule appointment ${apt.id} to ${date} at ${selectedSlot}`,
                { date, time: selectedSlot, status: 'rescheduled' }
              )
              setPanel(null)
            }}
            className="w-full py-1.5 rounded-lg bg-[#00A1E0] hover:bg-[#0090c7] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors">
            {acting ? 'Saving…' : selectedSlot ? `Confirm — ${date} at ${selectedSlot}` : 'Select a time slot'}
          </button>
        </div>
      )}

      {panel === 'doctor' && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
          <select value={doctor} onChange={e => setDoctor(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#00A1E0] bg-white">
            {DOCTOR_POOL.map(d => (
              <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>
            ))}
          </select>
          <button disabled={acting}
            onClick={() => { onAction(`Update appointment ${apt.id} doctor to ${doctor}`, { doctor }); setPanel(null) }}
            className="w-full py-1.5 rounded-lg bg-[#00A1E0] hover:bg-[#0090c7] disabled:opacity-50 text-white text-xs font-semibold transition-colors">
            {acting ? 'Saving…' : 'Confirm doctor change'}
          </button>
        </div>
      )}

      {panel === 'delete' && (
        <div className="p-3 bg-red-50 border-t border-red-100 space-y-2">
          <p className="text-xs text-red-600 font-medium">Cancel appointment #{apt.id}?</p>
          <div className="flex gap-2">
            <button onClick={() => setPanel(null)}
              className="flex-1 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-white transition-colors">
              No, keep it
            </button>
            <button disabled={acting}
              onClick={() => { onAction(`Cancel appointment ${apt.id}`, 'delete'); setPanel(null) }}
              className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors">
              {acting ? 'Deleting…' : 'Yes, cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ children, onClick, active, danger }: { children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-2 text-[11px] font-medium transition-colors
        ${active   ? 'bg-slate-100 text-slate-700'
        : danger   ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
        :            'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
      {children}
    </button>
  )
}
