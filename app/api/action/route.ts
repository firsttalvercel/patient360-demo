import { NextRequest, NextResponse } from 'next/server'

const A2A_URL = process.env.APPOINTMENTS_AGENT_URL || 'http://localhost:8082'

export interface ActionResult {
  response: string
  tokens?: { model: string; promptTokens: number; responseTokens: number; totalTokens: number }
  timing: number
}

export async function POST(req: NextRequest) {
  const { instruction } = await req.json()
  const t = Date.now()

  const res = await fetch(`${A2A_URL}/appointments-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `action-${Date.now()}`,
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
  const responseText: string = parts[0]?.text || 'Action completed.'
  const tokenText: string    = parts[1]?.text || ''

  let tokens
  const m = tokenText.match(/LLM: (.+?) \| Prompt tokens: (\d+) \| Response tokens: (\d+) \| Total: (\d+)/)
  if (m) tokens = { model: 'Salesforce', promptTokens: +m[2], responseTokens: +m[3], totalTokens: +m[4] }

  return NextResponse.json({ response: responseText, tokens, timing: Date.now() - t })
}
