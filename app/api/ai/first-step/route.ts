import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/ai/client'
import { FIRST_STEP_PROMPT } from '@/lib/ai/prompts'
import { z } from 'zod'
import type { Task } from '@/types/task'

const requestSchema = z.object({
  tasks: z.array(z.object({ id: z.string(), title: z.string(), energy_level: z.number().nullable() })),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const result = await generateJSON<{ taskIndex: number; reason: string }>(
    FIRST_STEP_PROMPT(parsed.data.tasks as Task[])
  )

  return NextResponse.json(result)
}
