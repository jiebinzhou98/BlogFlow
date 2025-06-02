// lib/gemini.ts
export async function generateRestaurantDescription(title: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })

    const data = await res.json()
    return data.text || 'Failed to generate restaurant description.'
  } catch (err) {
    console.error('[Client] Gemini fetch failed:', err)
    return 'Failed to generate restaurant description.'
  }
}
