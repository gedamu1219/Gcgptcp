import express from 'express';
const mainRouter = express.Router();
import chatRouter from './chat/chat.routes.js';
// /api/chat
mainRouter.use('/chat', chatRouter);
// /api/admin
// mainRouter.use('/admin', adminRouter);
export default mainRouter;