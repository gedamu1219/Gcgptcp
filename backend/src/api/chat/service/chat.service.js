import db from "../../../../db/db.config.js";
import { GoogleGenAI } from "@google/genai";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getRecentConversationRows = async (limit = 5) => {
  const normalizedLimit = Number.parseInt(limit, 10);
  const safeLimit =
    Number.isNaN(normalizedLimit) || normalizedLimit <= 0
      ? 20
      : normalizedLimit;

  const [rows] = await db.execute(
    `SELECT id, role, content, created_at
FROM conversations
ORDER BY id DESC
LIMIT ${safeLimit}`,
  );
  return rows.reverse();
};

// const ASSISTANT_FALLBACK_TEXT =
//   "I'm sorry, I can't generate a response right now because the AI service is unavailable or the quota has been exceeded. Please try again in a few moments.";

// const isQuotaError = (error) => {
//   const message = String(error?.message || "").toLowerCase();
//   const status = error?.status ?? error?.code ?? error?.response?.status;
//   return (
//     status === 429 ||
//     message.includes("quota") ||
//     message.includes("resource_exhausted") ||
//     message.includes("rate limit") ||
//     message.includes("quota exceeded")
//   );
// };

const generateAssistantAnswer = async ({ historyRows, question }) => {
  const formattedHistory = historyRows
    .filter((row) => row.content && row.content.trim())
    .map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      parts: [{ text: row.content }],
    }));

  const chat = geminiClient.chats.create({
    model: GEMINI_MODEL,
    config: { maxOutputTokens: 1024 },
    history: formattedHistory,
  });

  const result = await chat.sendMessage({ message: question });
  const assistantText = result.text || "";
  const totalTokens =
    result.usageMetadata?.totalTokenCount ?? result.totalTokens ?? 0;

  return { text: assistantText, totalTokens };
};

const getMessageById = async (messageID) => {
  const [rows] = await db.execute(
    "SELECT id, role, content, token_count, created_at FROM conversations WHERE id = ? LIMIT 1",
    [messageID],
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    tokenCount: Number(row.token_count || 0),
    createdAt: row.created_at,
  };
};

export async function createConversationService(question) {
  try {
    if (!question || !question.trim()) {
      const error = new Error("Question is required");
      error.status = 400;
      throw error;
    }

    console.log("Question:", question);

    const historyRows = await getRecentConversationRows(5);

    const [userResult] = await db.execute(
      "INSERT INTO conversations (content, role) VALUES (?, 'user')",
      [question],
    );

    const { text, totalTokens } = await generateAssistantAnswer({
      historyRows,
      question,
    });

    const [assistantResult] = await db.execute(
      "INSERT INTO conversations (content, role, token_count) VALUES (?, 'assistant', ?)",
      [text, totalTokens],
    );

    const userConversation = await getMessageById(userResult.insertId);
    const assistantConversation = await getMessageById(assistantResult.insertId);

    return {
      userConversation,
      assistantConversation,
    };
  } catch (error) {
    throw error;
  }
}
