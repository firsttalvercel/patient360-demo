import { Referral } from '@/app/api/patient360/route'

// FHIR refs like "Practitioner/1006" — strip them, show fallback
function cleanName(name: string | undefined, fallback: string): string {
  if (!name || name.includes('/')) return fallback
  return name
}

export default function ReferralCard({ referral: r, index }: { referral: Referral; index: number }) {
  const toName   = cleanName(r.toProvider?.name,   'Specialist')
  const fromName = cleanName(r.fromProvider?.name, 'Referring Physician')

  return (
    <div
      className="animate-fade-in-up bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[10px] text-slate-400 font-mono mb-0.5">REF-{r.referralId?.slice(0, 8) ?? '?'}</p>
          <p className="font-bold text-slate-800 text-sm leading-snug">{r.diagnosis}</p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap shrink-0">
          Active
        </span>
      </div>

      {/* Provider flow */}
      <div className="bg-slate-50 rounded-lg px-3 py-2.5 text-xs space-y-1">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-400">From</span>
          <span className="font-medium text-slate-700">{fromName}</span>
        </div>
        <div className="text-slate-300 pl-1">↓</div>
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-slate-400">To</span>
          <span className="font-medium text-slate-700">{toName}</span>
        </div>
      </div>

      {/* Notes */}
      {r.notes && (
        <p className="mt-2.5 text-[11px] text-slate-400 italic line-clamp-2">{r.notes}</p>
      )}
    </div>
  )
}
