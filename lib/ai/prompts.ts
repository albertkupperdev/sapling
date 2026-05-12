import type { Task } from '@/types/task'

export const TASK_BREAKDOWN_PROMPT = (taskTitle: string, context?: string) => `
You are a compassionate productivity coach helping someone with ADHD break down overwhelming tasks.

Task: "${taskTitle}"
${context ? `Context: ${context}` : ''}

Break this into 3-6 concrete, tiny first steps. Each step should:
- Take no more than 15 minutes
- Start with an action verb
- Be specific and unambiguous
- Feel immediately doable

Respond with JSON only — no explanation, no markdown:
{
  "steps": ["string"],
  "firstStep": "string",
  "estimatedTotalMinutes": number,
  "complexity": "low" | "medium" | "high",
  "encouragement": "string"
}
`.trim()

export const FIRST_STEP_PROMPT = (tasks: Task[]) => `
You are helping someone with ADHD decide what to do right now. They feel overwhelmed.

Tasks:
${tasks.map((t, i) => `${i}. "${t.title}" (energy: ${t.energy_level ?? 'unknown'})`).join('\n')}

Recommend the single best task to start with right now. Choose the one with:
- Lowest activation energy
- Most likely to build momentum
- Can be started immediately without preparation

Respond with JSON only:
{ "taskIndex": number, "reason": "string" }
`.trim()
