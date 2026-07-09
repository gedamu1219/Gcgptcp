import 'dotenv/config';
import express from "express";
import db from './db/db.config.js';
import cors from 'cors';
import { errorHandler } from './src/middleware/error-handler.js';

import mainRouter from './src/api/main.routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', mainRouter);

//Finally we will add error handler middleware
app.use(errorHandler);



// app.post('api/chat/conversations', (req, res) => {
//     res.send('post method');
// });

// app.get('api/chat/conversations', (req, res) => {
//     res.send('get method');
// });

async function startServer() {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log("Db connected");

    const PORT = process.env.PORT || 3888;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("=== SERVER START FAILED ===");
    console.error("Message:", error && error.message);
    console.error("Code:", error && error.code);
    console.error("Stack:", error && error.stack);
    console.error(
      "Full error object:",
      JSON.stringify(error, Object.getOwnPropertyNames(error || {})),
    );
    process.exit(1);
  }
}

startServer();




