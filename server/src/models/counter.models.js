import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
    prefix: {
        type: String,
        required: true
    },
    currentNumber: {
        type: Number,
        required: true,
        default: 1
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// Compound unique index per user and prefix series
counterSchema.index({ prefix: 1, createdBy: 1 }, { unique: true });

export const Counter = mongoose.model("Counter", counterSchema);

// Drop legacy single-field index prefix_1 if present
Counter.collection.dropIndex("prefix_1").catch(() => {
    // Legacy index prefix_1 does not exist or already dropped
});
