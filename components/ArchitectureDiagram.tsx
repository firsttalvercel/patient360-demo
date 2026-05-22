export default function ArchitectureDiagram() {
  return (
    <section className="py-24 px-6 bg-white border-t border-slate-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#00A1E0] text-xs font-semibold tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="text-4xl font-bold text-slate-900">Two MuleSoft AI capabilities.<br />One patient view.</h2>
          <p className="mt-4 text-slate-500 text-base max-w-xl mx-auto">
            A single natural language query orchestrates two independent MuleSoft systems in real time.
          </p>
        </div>

        {/* Query input */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-10 py-5 text-center shadow-sm max-w-sm w-full">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Doctor asks</p>
            <p className="text-slate-800 font-semibold text-lg">&ldquo;Show me Alice Johnson&rdquo;</p>
          </div>
        </div>
        <Arrow />

        {/* Two capability columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          {/* LEFT — A2A Agent column */}
          <div className="flex flex-col gap-3">
            {/* A2A Agent box */}
            <div className="bg-[#00A1E0]/6 border-2 border-[#00A1E0]/30 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00A1E0] flex items-center justify-center text-white font-bold text-sm shadow">A2A</div>
                <div>
                  <p className="text-slate-900 font-bold">MuleSoft A2A Agent</p>
                  <p className="text-[#00A1E0] text-xs font-medium">Appointments Intelligence</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><span className="text-[#00A1E0]">✦</span> Understands natural language — no structured query needed</li>
                <li className="flex items-start gap-2"><span className="text-[#00A1E0]">✦</span> Retrieves, updates, or cancels appointments autonomously</li>
                <li className="flex items-start gap-2"><span className="text-[#00A1E0]">✦</span> Returns structured results to any calling system</li>
              </ul>
            </div>

            <Arrow />

            {/* Salesforce + MySQL side by side — parallel, not chained */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0070d2]/6 border border-[#0070d2]/25 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#0070d2] flex items-center justify-center text-white text-xs font-bold shadow">SF</div>
                <p className="text-slate-800 font-semibold text-xs">Salesforce</p>
                <p className="text-slate-400 text-[10px] leading-snug">AI intent extraction</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
                  </svg>
                </div>
                <p className="text-slate-800 font-semibold text-xs">MySQL DB</p>
                <p className="text-slate-400 text-[10px] leading-snug">Appointments data</p>
              </div>
            </div>
          </div>

          {/* RIGHT — MCP Referral column */}
          <div className="flex flex-col gap-3">
            {/* MCP box */}
            <div className="bg-[#00b67a]/6 border-2 border-[#00b67a]/30 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00b67a] flex items-center justify-center text-white font-bold text-sm shadow">MCP</div>
                <div>
                  <p className="text-slate-900 font-bold">MuleSoft MCP Server</p>
                  <p className="text-[#00b67a] text-xs font-medium">Referral Management</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2"><span className="text-[#00b67a]">✦</span> Exposes referral tools to any AI model or agent</li>
                <li className="flex items-start gap-2"><span className="text-[#00b67a]">✦</span> Create, search, and retrieve patient referrals</li>
                <li className="flex items-start gap-2"><span className="text-[#00b67a]">✦</span> Governed access via MuleSoft API policies</li>
              </ul>
            </div>

            <Arrow />

            {/* FHIR Pool Query */}
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow shrink-0">HL7</div>
              <div>
                <p className="text-slate-800 font-semibold text-sm">FHIR Pool Query</p>
                <p className="text-slate-400 text-xs">HL7 FHIR R4 · ServiceRequest · Patient · Practitioner</p>
              </div>
            </div>

            <Arrow />

            {/* FHIR DB */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center text-white shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
                </svg>
              </div>
              <div>
                <p className="text-slate-800 font-semibold text-sm">FHIR Clinical Backend</p>
                <p className="text-slate-400 text-xs">hapifhir.demos.mulesoft.com · referral records</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Arrow />
        </div>

        {/* Result */}
        <div className="flex justify-center mt-2">
          <div className="bg-gradient-to-r from-[#00A1E0]/10 via-white to-[#00b67a]/10 border border-slate-200 rounded-2xl px-12 py-6 text-center shadow-sm max-w-md w-full">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">Result</p>
            <p className="text-slate-900 font-bold text-xl">Patient 360 View</p>
            <p className="text-slate-500 text-sm mt-1">Appointments + Referrals · Doctor &amp; Patient perspectives</p>
          </div>
        </div>

      </div>
    </section>
  )
}

function Arrow() {
  return <div className="text-slate-300 text-2xl select-none text-center py-1">↓</div>
}
