import mongoose, { Schema } from "mongoose";

const invoiceItemSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: "Item"
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "-"
    },
    hsn: {
        type: String,
        default: ""
    },
    qty: {
        type: Number,
        required: true,
        default: 1
    },
    unit: {
        type: String,
        default: "NOS"
    },
    rate: {
        type: Number,
        required: true,
        default: 0
    },
    gst: {
        type: Number,
        default: 18
    },
    amount: {
        type: Number,
        required: true
    },
    rateDecimalPlaces: {
        type: Number,
        default: 2
    }
}, { _id: true });

const invoiceSchema = new Schema({
    invoiceNo: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    factory: {
        type: Schema.Types.ObjectId,
        ref: "Factory",
        required: true
    },
    party: {
        type: Schema.Types.ObjectId,
        ref: "Party",
        required: true
    },
    placeOfSupply: {
        type: String,
        required: true
    },
    isIntraState: {
        type: Boolean,
        default: true
    },
    saleType: {
        type: String,
        enum: ["cash", "credit"],
        default: "credit"
    },
    items: [invoiceItemSchema],
    subtotal: {
        type: Number,
        default: 0
    },
    totalTaxableAmount: {
        type: Number,
        default: 0
    },
    cgst: {
        type: Number,
        default: 0
    },
    sgst: {
        type: Number,
        default: 0
    },
    igst: {
        type: Number,
        default: 0
    },
    roundOff: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    totalInWords: {
        type: String,
        default: ""
    },
    // Logistics overrides
    vehicleNo: { type: String, default: "" },
    transportName: { type: String, default: "" },
    noOfCases: { type: String, default: "" },
    eWayBillNo: { type: String, default: "" },
    memoNo: { type: String, default: "" },
    memoDate: { type: String, default: "" },
    soNo: { type: String, default: "" },
    soDate: { type: String, default: "" },
    contractNoGEMC: { type: String, default: "" },
    cpNo: { type: String, default: "" },
    cpDate: { type: String, default: "" },

    status: {
        type: String,
        enum: ["draft", "generated", "paid", "partial", "cancelled"],
        default: "generated"
    },
    pdfUrl: {
        type: String,
        default: ""
    },
    templateId: {
        type: String,
        default: "classic"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Invoice = mongoose.model("Invoice", invoiceSchema);
