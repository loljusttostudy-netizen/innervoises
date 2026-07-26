import { Payment } from "../models/payment.models.js";
import { Invoice } from "../models/invoice.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const recordPayment = asyncHandler(async (req, res) => {
    const { partyId, invoiceId, amount, date, mode, reference, notes } = req.body;

    if (!partyId || !amount || !date) {
        throw new ApiError(400, "Party, amount, and date are required");
    }

    const payment = await Payment.create({
        party: partyId,
        invoice: invoiceId || null,
        amount: Number(amount),
        date,
        mode: mode || "bank",
        reference: reference || "",
        notes: notes || "",
        createdBy: req.user._id
    });

    // If payment is against a specific invoice, update its status
    if (invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        if (invoice) {
            const allPayments = await Payment.find({ invoice: invoiceId });
            const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

            if (totalPaid >= invoice.total) {
                invoice.status = "paid";
            } else if (totalPaid > 0) {
                invoice.status = "partial";
            }
            await invoice.save();
        }
    }

    return res.status(201).json(
        new ApiResponse(201, payment, "Payment recorded successfully")
    );
});

const getPayments = asyncHandler(async (req, res) => {
    const { partyId, invoiceId } = req.query;
    let filter = {};

    if (partyId) filter.party = partyId;
    if (invoiceId) filter.invoice = invoiceId;

    const payments = await Payment.find(filter)
        .populate("party", "name gstin")
        .populate("invoice", "invoiceNo total")
        .sort({ date: -1, createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, payments, "Payments retrieved successfully")
    );
});

const deletePayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    // Re-evaluate invoice status if payment was tied to an invoice
    if (payment.invoice) {
        const invoice = await Invoice.findById(payment.invoice);
        if (invoice) {
            const remainingPayments = await Payment.find({ invoice: invoice._id });
            const totalPaid = remainingPayments.reduce((sum, p) => sum + p.amount, 0);

            if (totalPaid >= invoice.total) {
                invoice.status = "paid";
            } else if (totalPaid > 0) {
                invoice.status = "partial";
            } else {
                invoice.status = invoice.saleType === "cash" ? "paid" : "generated";
            }
            await invoice.save();
        }
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Payment deleted successfully")
    );
});

export {
    recordPayment,
    getPayments,
    deletePayment
};
