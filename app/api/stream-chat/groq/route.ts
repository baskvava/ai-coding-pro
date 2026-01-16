import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // 1. 檢查 API Key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set" },
        { status: 500 }
      );
    }

    // 2. 改為呼叫 Groq API (OpenAI 兼容介面)
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, // 加上認證
        },
        body: JSON.stringify({
          // model: "llama3-70b-8192", // 舊版
          model: "llama-3.3-70b-versatile", // 推薦：最新版 Llama 3.3 70B
          messages: messages,
          stream: true, // 開啟串流
          temperature: 0.7, // 可選：控制創意度
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      throw new Error(`Groq API Error: ${groqResponse.status} - ${errorText}`);
    }

    if (!groqResponse.body) {
      throw new Error("No response body from Groq");
    }

    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            // 解碼新收到的區塊
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Groq/OpenAI 的串流是以 "\n\n" 為分隔，但我們按行處理即可
            const lines = buffer.split("\n");

            // 保留最後一行（可能不完整）到下一次迴圈
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmedLine = line.trim();

              // 3. 解析 Groq 的 SSE 格式 (Server-Sent Events)
              // 格式通常是: data: {"id":..., "choices":[{...}]}
              if (!trimmedLine.startsWith("data: ")) continue;

              const jsonStr = trimmedLine.replace("data: ", "");

              // 處理結束訊號
              if (jsonStr === "[DONE]") continue;

              try {
                const json = JSON.parse(jsonStr);

                // Groq (OpenAI 格式) 的內容在 choices[0].delta.content
                const content = json.choices?.[0]?.delta?.content;

                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (e) {
                console.error("Error parsing JSON line:", e);
              }
            }
          }
        } catch (err) {
          console.error("Stream reading error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("Stream API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
