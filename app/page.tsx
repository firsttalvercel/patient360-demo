import Hero from '@/components/Hero'
import ClientLayout from '@/components/ClientLayout'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <main className="bg-slate-50">
      <Hero />
      <ClientLayout />
      <footer className="border-t border-slate-200 bg-white py-10 px-6 text-center">
        <p className="text-slate-400 text-xs">
          Built on{' '}
          <span className="text-[#00A1E0] font-medium">MuleSoft A2A</span>
          {' · '}
          <span className="text-[#00b67a] font-medium">MCP Connector</span>
          {' · '}
          <span className="text-[#0070d2] font-medium">Salesforce</span>
        </p>
        <p className="text-slate-300 text-xs mt-1">Patient 360 Demo — DocPlanner</p>
      </footer>
      <ChatWidget />
    </main>
  )
}
