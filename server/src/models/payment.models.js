import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema({
    party: {
        type: Schema.Types.ObjectId,
        ref: "Party",
        required: true
    },
    invoice: {
        type: Schema.Types.ObjectId,
        ref: "Invoice",
        default: null
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["cash", "bank", "upi", "cheque"],
        default: "bank"
    },
    reference: {
        type: String,
        default: ""
    },
    notes: {
        type: String,
        default: ""
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);
