import "dotenv/config";
import express from "express";
import db from "./db/db.config.js";
import cors from "cors";
import { errorHandler } from "./src/middleware/error-handler.js";
import mainRouter from "./src/api/main.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://gcgptcp.vercel.app",
  "https://gcgptcp-git-main-gedamumersha27-9922s-projects.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.trim().replace(/\/$/, "");

      if (
        allowedOrigins.includes(cleanOrigin) ||
        /^https:\/\/gcgptcp[a-z0-9-]*\.vercel\.app$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      console.log("Blocked by CORS. Origin was:", JSON.stringify(origin));
      return callback(new Error("Not allowed by CORS"));
    },
  }),
);

app.use("/api", mainRouter);

//Finally we will add error handler middleware
app.use(errorHandler);

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
