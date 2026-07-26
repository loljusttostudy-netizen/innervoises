import mongoose, { Schema } from "mongoose";

const businessProfileSchema = new Schema({
    companyName: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    pincode: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    gstin: {
        type: String,
        default: ""
    },
    taglines: {
        type: [String],
        default: []
    },
    logoUrl: {
        type: String,
        default: ""
    },
    logoPublicId: {
        type: String,
        default: ""
    },
    stampUrl: {
        type: String,
        default: ""
    },
    stampPublicId: {
        type: String,
        default: ""
    },
    signatureUrl: {
        type: String,
        default: ""
    },
    signaturePublicId: {
        type: String,
        default: ""
    },
    bankName: {
        type: String,
        default: ""
    },
    bankBranch: {
        type: String,
        default: ""
    },
    accountNo: {
        type: String,
        default: ""
    },
    ifsc: {
        type: String,
        default: ""
    },
    accountName: {
        type: String,
        default: ""
    },
    defaultPaymentTerms: {
        type: String,
        default: "30 Days from date of issue"
    },
    footerText: {
        type: String,
        default: "This is a computer generated invoice"
    },
    templateId: {
        type: String,
        enum: ["classic", "modern", "minimal"],
        default: "classic"
    },
    // Visual Designer & Canva/Petpooja style customizer fields
    invoiceTitle: {
        type: String,
        default: "TAX INVOICE"
    },
    tableBorderStyle: {
        type: String,
        enum: ["box", "lines", "minimal"],
        default: "box"
    },
    primaryColor: {
        type: String,
        default: "#2d241b"
    },
    showHsn: {
        type: Boolean,
        default: true
    },
    showDescription: {
        type: Boolean,
        default: true
    },
    showBankDetails: {
        type: Boolean,
        default: true
    },
    showStamp: {
        type: Boolean,
        default: true
    },
    showSignature: {
        type: Boolean,
        default: true
    },
    customCss: {
        type: String,
        default: ""
    },
    customHtml: {
        type: String,
        default: ""
    },
    rateDecimalPlaces: {
        type: Number,
        default: 2,
        min: 0,
        max: 6
    },
    qtyDecimalPlaces: {
        type: Number,
        default: 2,
        min: 0,
        max: 6
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const BusinessProfile = mongoose.model("BusinessProfile", businessProfileSchema);
