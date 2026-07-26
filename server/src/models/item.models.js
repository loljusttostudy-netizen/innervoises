import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        default: "General",
        trim: true
    },
    hsn: {
        type: String,
        default: "",
        trim: true
    },
    unit: {
        type: String,
        default: "NOS",
        trim: true
    },
    rate: {
        type: Number,
        required: true,
        default: 0
    },
    gst: {
        type: Number,
        enum: [0, 5, 12, 18, 28],
        default: 18
    },
    rateDecimalPlaces: {
        type: Number,
        default: null
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Item = mongoose.model("Item", itemSchema);
