import { NextRequest, NextResponse } from 'next/server'

const A2A_URL      = process.env.APPOINTMENTS_AGENT_URL || 'http://localhost:8082'
const GEMINI_KEY   = process.env.GEMINI_API_KEY || ''
const GEMINI_HOST  = 'generativelanguage.googleapis.com'
const GEMINI_MODEL = 'gemini-2.5-flash'

type HistoryEntry = { role: 'user' | 'assistant'; text: string }

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string): string {
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTime(t: string): string {
  // t may be "09:00" or "1970-01-01T09:00:00"
  const hhmm = t.includes('T') ? t.split('T')[1].substring(0, 5) : t.substring(0, 5)
  const [h, m] = hhmm.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

// Extract patient name mentioned in recent conversation
function extractPatientName(history: HistoryEntry[]): string | null {
  const text = history.map(m => m.text).join(' ')
  const m = text.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/)
  return m ? m[1] : null
}

// Turn raw A2A text into clean readable lines
function formatRawResponse(raw: string): string {
  if (!raw || raw === 'No data returned.') return raw

  // Appointment list: "Patient X has N appointment(s):\n1. Appointment #..."
  const listMatch = raw.match(/Patient (.+?) has (\d+) appointment\(s\):\n([\s\S]+)/)
  if (listMatch) {
    const name  = listMatch[1]
    const count = parseInt(listMatch[2])
    const lines = listMatch[3].trim().split('\n').filter(Boolean)

    if (count === 0) return `No appointments found for ${name}.`

    // Parse each appointment line
    const parsed = lines.map(line => {
      const m = line.match(/\d+\. Appointment #(\d+) — (.+?) \((.+?)\) on (.+?) at (.+?), (.+?)\. Status: (.+)/)
      if (!m) return line
      return `#${m[1]}: ${m[2]} (${m[3]}) on ${formatDate(m[4])} at ${formatTime(m[5])} — ${m[6]} · ${m[7]}`
    })

    return `${name} has ${count} appointment${count !== 1 ? 's' : ''}:\n${parsed.join('\n')}`
  }

  // Single appointment: "Appointment #X: ..."
  const single = raw.match(/Appointment #(\d+): (.+?) with (.+?) \((.+?)\) on (.+?) at (.+?), (.+?)\. Status: (.+)\./)
  if (single) {
    return `Appointment #${single[1]} — ${single[3]} (${single[4]})\nDate: ${formatDate(single[5])} at ${formatTime(single[6])}\nLocation: ${single[7]}\nStatus: ${single[8]}`
  }

  // Action confirmations ("Appointment #X has been successfully updated...") — return as-is
  return raw
}

// Single Gemini call — only used to answer follow-up questions from context
async function answerFromContext(
  userMessage: string,
  history: HistoryEntry[]
): Promise<string | null> {
  if (!GEMINI_KEY || !history.length) return null

  const ctx = history
    .slice(-8)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n')

  try {
    const res = await fetch(
      `https://${GEMINI_HOST}/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a healthcare assistant. Answer the user's follow-up question using ONLY the conversation history below. If the answer is not in the history, reply with exactly: NEED_A2A

Conversation:
${ctx}

User follow-up: "${userMessage}"

Reply in 1-2 plain sentences. No markdown. No asterisks. Numbers only if listing.`,
            }],
          }],
          generationConfig: { temperature: 0, maxOutputTokens: 256 },
        }),
      }
    )
    const data = await res.json()
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
    console.log('[chat] context answer:', text.substring(0, 80))
    if (!text || text.includes('NEED_A2A')) return null
    return text
  } catch {
    return null
  }
}

async function callA2A(instruction: string): Promise<string> {
  const res = await fetch(`${A2A_URL}/appointments-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `chat-${Date.now()}`,
      method: 'message/send',
      params: {
        message: {
          kind: 'message',
          role: 'user',
          parts: [{ kind: 'text', text: instruction }],
          messageId: `msg-${Date.now()}`,
        },
      },
    }),
  })
  const data = await res.json()
  const parts = data.result?.artifacts?.[0]?.parts || []
  return parts[0]?.text || 'No data returned.'
}

// Enrich a short follow-up query with patient name from history
function enrichQuery(message: string, history: HistoryEntry[]): string {
  // Already has a name or ID → no enrichment needed
  if (/[A-Z][a-z]+ [A-Z][a-z]+/.test(message) || /\bP\d{4}\b/i.test(message)) return message
  // Short follow-up → try to inject patient name
  if (message.split(' ').length <= 6) {
    const name = extractPatientName(history)
    if (name) return `${message} (patient: ${name})`
  }
  return message
}

// ── handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { message, history = [] }: { message: string; history: HistoryEntry[] } = await req.json()
  if (!message?.trim()) return NextResponse.json({ reply: 'Please ask me something.' })

  // 1. Try answering from conversation context first (fast, no A2A call)
  const contextReply = await answerFromContext(message, history)
  if (contextReply) return NextResponse.json({ reply: contextReply })

  // 2. Enrich short follow-ups with patient name
  const query = enrichQuery(message, history)

  // 3. Call A2A agent
  const rawData = await callA2A(query)

  // 4. Format cleanly — no second LLM call, instant, reliable
  const reply = formatRawResponse(rawData)

  return NextResponse.json({ reply })
}
