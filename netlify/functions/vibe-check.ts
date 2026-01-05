// netlify/functions/vibe-check.ts
import { Handler } from "@netlify/functions";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Danh sách Model theo thứ tự ưu tiên: Chất lượng -> Tốc độ
const MODELS = [
  "openai/gpt-oss-120b", // Model chính
  "openai/gpt-oss-20b", // Model dự phòng
  "llama-3.3-70b-versatile", // Model thông minh nhất
  "llama-3.1-8b-instant", // Model nhanh nhất
  "mixtral-8x7b-32768", // Model dự phòng Dự phòng cuối
];

// Định nghĩa kiểu dữ liệu trả về
interface GenerationResult {
  content: string;
  model: string;
}

// Cập nhật hàm đệ quy để trả về Object thay vì string
async function generateWithRetry(
  prompt: string,
  modelIndex: number = 0
): Promise<GenerationResult> {
  if (modelIndex >= MODELS.length) {
    throw new Error(
      "Tất cả các model đều đang bận hoặc gặp lỗi. Vui lòng thử lại sau."
    );
  }

  const currentModel = MODELS[modelIndex];
  console.log(`Attempting with model: ${currentModel} (Index: ${modelIndex})`);

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Bạn là một trợ lý Vibe Coding chuyên nghiệp. Hãy giải thích ngắn gọn, vui vẻ và tạo ra code mẫu React/Typescript sạch đẹp dựa trên ý tưởng của người dùng. Hãy trả lời bằng Tiếng Việt.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: currentModel,
      temperature: 0.7,
      max_tokens: 4096,
    });

    // TRẢ VỀ CẢ MODEL NAME
    return {
      content: completion.choices[0]?.message?.content || "",
      model: currentModel,
    };
  } catch (error: any) {
    const status = error?.status || error?.statusCode || 500;
    console.warn(`Model ${currentModel} failed with status: ${status}`);

    if (status === 429 || (status >= 500 && status < 600)) {
      console.log(`Switching to backup model...`);
      return generateWithRetry(prompt, modelIndex + 1);
    }
    throw error;
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing prompt" }),
      };
    }

    // Destructure kết quả từ hàm đệ quy
    const { content, model } = await generateWithRetry(prompt, 0);

    return {
      statusCode: 200,
      // Gửi model name về client
      body: JSON.stringify({ result: content, model: model }),
    };
  } catch (error: any) {
    console.error("Final Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Lỗi xử lý yêu cầu",
        details: "Hệ thống đang quá tải, vui lòng thử lại.",
      }),
    };
  }
};
