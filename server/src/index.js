import 'dotenv/config';
import app from './app.js';
import { connectDb } from './db/db.connection.js';

const PORT = process.env.PORT || 5001;

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to DB:", err);
    });
