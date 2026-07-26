import mongoose, { Schema } from "mongoose";

const factorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Factory = mongoose.model("Factory", factorySchema);
