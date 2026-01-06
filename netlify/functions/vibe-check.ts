// netlify/functions/vibe-check.ts
import { Handler } from "@netlify/functions";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Giữ nguyên danh sách MODELS của bạn
const MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
];

interface GenerationResult {
  content: string;
  model: string;
}

// Hàm gọi AI (được sửa đổi để linh hoạt hơn)
async function generateWithRetry(
  prompt: string,
  isJsonMode: boolean = false, // Thêm cờ này để ép trả về JSON khi cần
  modelIndex: number = 0
): Promise<GenerationResult> {
  if (modelIndex >= MODELS.length) {
    throw new Error("Server quá tải, vui lòng thử lại sau.");
  }

  const currentModel = MODELS[modelIndex];

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: isJsonMode
            ? "Bạn là một API trả về dữ liệu JSON. Chỉ trả về một mảng JSON (JSON Array) chứa các chuỗi String. Không markdown, không giải thích."
            : "Bạn là một trợ lý Vibe Coding chuyên nghiệp. Hãy giải thích ngắn gọn, vui vẻ và tạo ra code mẫu React/Typescript sạch đẹp.",
        },
        { role: "user", content: prompt },
      ],
      model: currentModel,
      temperature: 0.8, // Tăng nhẹ nhiệt độ để ý tưởng sáng tạo hơn
      max_tokens: 4096,
      // response_format: { type: "json_object" } // Groq hỗ trợ JSON mode ở một số model, nhưng để an toàn ta xử lý thủ công text
    });

    return {
      content: completion.choices[0]?.message?.content || "",
      model: currentModel,
    };
  } catch (error: any) {
    // Logic retry giữ nguyên
    const status = error?.status || error?.statusCode || 500;
    if (status === 429 || (status >= 500 && status < 600)) {
      return generateWithRetry(prompt, isJsonMode, modelIndex + 1);
    }
    throw error;
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt, action } = JSON.parse(event.body || "{}");

    // --- CASE 1: GỢI Ý Ý TƯỞNG (NEW) ---
    if (action === "suggest") {
      const suggestPrompt =
        'Hãy tạo ra 5 ý tưởng project Web App ngắn gọn, thú vị, hiện đại bằng React/Typescript (Ví dụ: Glassmorphism Portfolio, Music Player, Dashboard...). Chỉ trả về Array JSON raw, ví dụ: ["Ý tưởng 1", "Ý tưởng 2"]';

      const { content, model } = await generateWithRetry(
        suggestPrompt,
        true,
        0
      );

      // Xử lý chuỗi JSON trả về (đôi khi AI bọc trong markdown ```json ... ```)
      let cleanJson = content.replace(/```json|```/g, "").trim();
      let ideas = [];
      try {
        ideas = JSON.parse(cleanJson);
      } catch (e) {
        // Fallback nếu AI trả về lỗi format
        ideas = [
          "Portfolio cá nhân 3D",
          "Todo App kéo thả",
          "Weather App tối giản",
        ];
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ result: ideas, model }),
      };
    }

    // --- CASE 2: GENERATE CODE (CŨ) ---
    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt" }),
      };
    }

    const { content, model } = await generateWithRetry(prompt, false, 0);

    return {
      statusCode: 200,
      body: JSON.stringify({ result: content, model: model }),
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
