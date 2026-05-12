import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateJSON } from '@/lib/ai/client'
import { TASK_BREAKDOWN_PROMPT } from '@/lib/ai/prompts'
import { z } from 'zod'
import type { AIBreakdown } from '@/types/task'

const requestSchema = z.object({
  taskTitle: z.string().min(1).max(200),
  context: z.string().max(500).optional(),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = requestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { taskTitle, context } = parsed.data

  const breakdown = await generateJSON<AIBreakdown>(
    TASK_BREAKDOWN_PROMPT(taskTitle, context)
  )

  return NextResponse.json(breakdown)
}
