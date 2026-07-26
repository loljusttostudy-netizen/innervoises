import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
    prefix: {
        type: String,
        required: true,
        unique: true
    },
    currentNumber: {
        type: Number,
        required: true,
        default: 1
    }
}, { timestamps: true });

export const Counter = mongoose.model("Counter", counterSchema);
