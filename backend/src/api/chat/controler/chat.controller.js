import {
  createConversationService,
  getRecentConversationRows,
} from "../service/chat.service.js";

// async function main() {
//     const response = await geminiClient.models.generateContent({
//         model: 'gemini-3-flash-preview',
//         contents: 'Explain how AI works in a few words',
//     });
//     console.log(response.text);
// }
// main();

export async function createConversationController(req, res) {
  try {
    // throw new Error('create conversation api error');
    // res.send('create conversation api');
    // console.log(req.body);
    const { question } = req.body;

    const result = await createConversationService(question);

    res.status(201).json({
      status: true,
      message: "Conversation created successfully",
      data: result,
    });
  } catch (error) {
    throw error;
  }
  // console.log(req.body);
  // throw new Error('Something went wrong tyr again later');
  // res.send('create conversation api');
}
export async function getConversationsController(req, res) {
  // res.send('get conversations api');
  try {
    const result = await getRecentConversationRows(100);
    res.status(200).json({
      status: true,
      message: "Conversations retrieved successfully",
      data: { conversations: result },
    });
  } catch (error) {
    throw error;
  }
}
