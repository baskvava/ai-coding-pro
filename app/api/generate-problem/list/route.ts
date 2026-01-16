import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    // 1. Check API Key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set" },
        { status: 500 }
      );
    }

    // 2. Call Groq API (OpenAI compatible interface)
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Recommended: Latest Llama 3.3 70B
          messages: [
            {
              role: "user",
              /**
               * @todo improve prompt engineering here
               * Now, we have a simple prompt to generate coding problems.
               * the prompt can generate from another AI model for more complex logic
               * depending on algo, system design, frontend, backend, fullstack, devops, etc.
               */
              content: `You are a strict API. Return a JSON array of 5 algorithmic coding interview problems related to "${query}".
                Output format: [{"id": string, "title": string, "difficulty": "Easy"|"Medium"|"Hard"}]
                Do not output markdown. Return ONLY the raw JSON array.`,
            },
          ],
          stream: false, // <--- 修改：設為 false 或直接移除 (預設為 false)
          temperature: 0.7,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(`Groq API Error: ${groqResponse.status} - ${errorText}`);
    }

    // 3. Parse JSON Response directly
    // 非串流模式下，直接解析完整的 JSON 物件
    const data = await groqResponse.json();

    // OpenAI 格式的非串流回應結構通常位於 choices[0].message.content
    // 注意：串流時是 .delta.content，非串流時是 .message.content
    const content = data.choices?.[0]?.message?.content || "";

    // 4. Return JSON Response
    // return NextResponse.json({ role: "assistant", content: content });
    return NextResponse.json({
      result: content,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
