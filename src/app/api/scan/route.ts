// Node.js runtime
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const formData = await req.formData();
  const image = formData.get('image') as File | null;

  if (!image) {
    return Response.json({ error: 'No image provided' }, { status: 400 });
  }

  const arrayBuffer = await image.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);

  const mimeType = (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
    image.type
  )
    ? image.type
    : 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let result;
  try {
    result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: base64 } },
            {
              text: 'This is the back of a gift card. Extract the following and return ONLY valid JSON with no markdown, no explanation:\n{"merchant": string|null, "code": string|null, "pin": string|null}\nIf a field is not visible or not applicable, use null.',
            },
          ],
        },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google AI API error';
    return Response.json({ error: message }, { status: 502 });
  }

  const text = result.response.text().trim();

  try {
    // Handle cases where the model wraps response in markdown code fences
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');
    const extracted = JSON.parse(jsonMatch[0]);
    return Response.json({
      merchant: typeof extracted.merchant === 'string' ? extracted.merchant : null,
      code: typeof extracted.code === 'string' ? extracted.code : null,
      pin: typeof extracted.pin === 'string' ? extracted.pin : null,
    });
  } catch {
    return Response.json(
      { error: 'Could not parse card details from image' },
      { status: 422 }
    );
  }
}
