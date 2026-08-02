import mongoose, { Schema } from "mongoose";

const partySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ["Government", "Local"],
        default: "Local"
    },
    gstin: {
        type: String,
        default: "",
        trim: true
    },
    phone: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        default: "",
        trim: true
    },
    state: {
        type: String,
        required: true,
        default: "Uttar Pradesh"
    },
    billingAddress: {
        type: String,
        default: ""
    },
    shippingAddress: {
        type: String,
        default: ""
    },
    placeOfSupply: {
        type: String,
        default: "Uttar Pradesh"
    },
    salesBy: {
        type: String,
        default: ""
    },
    priceList: {
        type: String,
        default: "Default"
    },
    referenceNumber: {
        type: String,
        default: ""
    },
    // Logistics defaults
    vehicleNo: { type: String, default: "" },
    noOfCases: { type: String, default: "" },
    transportName: { type: String, default: "" },
    eWayBillNo: { type: String, default: "" },
    soNo: { type: String, default: "" },
    soDate: { type: String, default: "" },
    contractNoGEMC: { type: String, default: "" },
    cpNo: { type: String, default: "" },
    cpDate: { type: String, default: "" },
    memoNo: { type: String, default: "" },
    memoDate: { type: String, default: "" },
    customFields: [
        {
            label: { type: String, trim: true, default: "" },
            value: { type: String, trim: true, default: "" }
        }
    ],
    // Banking
    bankName: { type: String, default: "" },
    accountNo: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    paymentTerms: { type: String, default: "" },
    packingDetails: { type: String, default: "" },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Party = mongoose.model("Party", partySchema);
