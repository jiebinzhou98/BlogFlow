// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  const { title } = await request.json()
  if (!title) {
    return new Response(JSON.stringify({ error: 'Missing title' }), { status: 400 })
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `Write a short and engaging restaurant review for "${title}". Keep it under 100 words. Focus on ambiance, food, and overall experience.` }],
        },
      ],
    })

    const text = result.response.text()
    return new Response(JSON.stringify({ text }), { status: 200 })
  } catch (error) {
    console.error('[Gemini API Error]', error)
    return new Response(JSON.stringify({ error: 'Gemini API error' }), { status: 500 })
  }
}
