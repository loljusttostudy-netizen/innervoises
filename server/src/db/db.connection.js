import mongoose from "mongoose";
import { DB_NAME } from "./dbname.js";

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected !! Host: ${connection.connection.host}`);
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

export { connectDb };
