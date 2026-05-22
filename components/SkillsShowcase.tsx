interface Skill {
  label: string
  labelColor: string
  title: string
  desc: string
  query: string
  queryLabel: string
}

const skills: Skill[] = [
  {
    label: '360',
    labelColor: 'bg-purple-100 text-purple-600 border-purple-200',
    title: 'Patient 360',
    desc: 'One query returns appointments + referrals unified — the full patient journey at a glance.',
    query: 'Alice Johnson',
    queryLabel: 'Show Alice Johnson',
  },
  {
    label: 'A2A',
    labelColor: 'bg-blue-100 text-[#00A1E0] border-blue-200',
    title: 'Appointments by Name',
    desc: 'Natural language query returns all appointments for a patient by their full name.',
    query: 'Luis Herrera',
    queryLabel: 'Show Luis Herrera',
  },
  {
    label: 'A2A',
    labelColor: 'bg-blue-100 text-[#00A1E0] border-blue-200',
    title: 'Appointments by Patient ID',
    desc: 'Retrieve all scheduled visits for a patient using their unique system ID.',
    query: 'John Smith',
    queryLabel: 'Show John Smith',
  },
  {
    label: 'A2A',
    labelColor: 'bg-blue-100 text-[#00A1E0] border-blue-200',
    title: 'Update / Reschedule',
    desc: 'Change date, time, doctor, or status of an existing appointment with plain English.',
    query: 'Alice Johnson',
    queryLabel: 'Reschedule Alice',
  },
  {
    label: 'MCP',
    labelColor: 'bg-emerald-100 text-[#00b67a] border-emerald-200',
    title: 'Search Referrals',
    desc: 'Find existing referrals by patient name or referral ID across the FHIR backend.',
    query: 'Luis Herrera',
    queryLabel: 'Referrals for Carlos',
  },
  {
    label: 'MCP',
    labelColor: 'bg-emerald-100 text-[#00b67a] border-emerald-200',
    title: 'Create Referral',
    desc: 'Generate a new FHIR-backed referral linking a patient to a specialist.',
    query: 'Alice Johnson',
    queryLabel: 'New referral for Alice',
  },
]

interface Props {
  onTry: (name: string) => void
}

export default function SkillsShowcase({ onTry }: Props) {
  return (
    <section className="py-24 px-6 bg-slate-50 border-t border-slate-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-purple-500 text-xs font-semibold tracking-widest uppercase mb-3">Capabilities</p>
          <h2 className="text-4xl font-bold text-slate-900">What the platform can do</h2>
          <p className="mt-3 text-slate-500 text-sm">Click any capability to try it live — results load instantly above.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {skills.map(s => (
            <div
              key={s.title}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
            >
              <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${s.labelColor} mb-4 w-fit`}>
                {s.label}
              </span>
              <h3 className="text-slate-900 font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">{s.desc}</p>
              <button
                onClick={() => onTry(s.query)}
                className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium hover:bg-[#00A1E0] hover:text-white hover:border-[#00A1E0] transition-all flex items-center justify-center gap-1"
              >
                → Try: &ldquo;{s.queryLabel}&rdquo;
              </button>
            </div>
          ))}
        </div>

        {/* Free text callout */}
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-7 text-center">
          <p className="text-slate-700 font-semibold text-lg mb-1">Try any patient name</p>
          <p className="text-slate-400 text-sm mb-5">The AI understands natural language — type any name from the database in the search bar above.</p>
          <a
            href="#demo"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-[#00A1E0] text-white text-sm font-semibold transition-colors"
          >
            ↑ Go to search
          </a>
        </div>
      </div>
    </section>
  )
}
