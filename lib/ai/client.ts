import Groq from 'groq-sdk'

let groqClient: Groq | null = null

function getClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return groqClient
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const client = getClient()

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('No content returned from AI')

  return JSON.parse(content) as T
}
