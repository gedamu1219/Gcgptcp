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
        // console.log('Db connected');
        connection.release();
console.log('Db connected')

        app.listen(3888, err => {
            if (err) {
                throw err;
            }
            console.log('Server is running on port http://localhost:3888');
        });
    } catch (error) {
        console.error('Error starting server:', error.message);
    }
}

startServer();






