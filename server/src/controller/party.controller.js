import { Party } from "../models/party.models.js";
import { Invoice } from "../models/invoice.models.js";
import { Payment } from "../models/payment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createParty = asyncHandler(async (req, res) => {
    const partyData = req.body;
    if (!partyData.name) {
        throw new ApiError(400, "Party name is required");
    }

    const party = await Party.create({
        ...partyData,
        createdBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, party, "Party created successfully")
    );
});

const getParties = asyncHandler(async (req, res) => {
    const parties = await Party.find({ createdBy: req.user._id }).sort({ name: 1 });

    // Attach computed balance for each party
    const partiesWithBalance = await Promise.all(
        parties.map(async (party) => {
            const invoices = await Invoice.find({ party: party._id, createdBy: req.user._id, status: { $ne: "cancelled" } });
            const payments = await Payment.find({ party: party._id, createdBy: req.user._id });

            let balance = 0;
            invoices.forEach((inv) => {
                if (inv.saleType === "credit") {
                    balance += inv.total;
                }
            });
            payments.forEach((pay) => {
                balance -= pay.amount;
            });

            return {
                ...party.toObject(),
                balance,
                invoicesCount: invoices.length
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(200, partiesWithBalance, "Parties retrieved successfully")
    );
});

const searchParties = asyncHandler(async (req, res) => {
    const { q = "" } = req.query;
    const query = q.trim();

    if (!query) {
        const topParties = await Party.find({ createdBy: req.user._id }).limit(10).select("name gstin state billingAddress shippingAddress");
        return res.status(200).json(new ApiResponse(200, topParties, "Top parties"));
    }

    const parties = await Party.find({
        createdBy: req.user._id,
        $or: [
            { name: { $regex: query, $options: "i" } },
            { gstin: { $regex: query, $options: "i" } }
        ]
    }).limit(10).select("name gstin state billingAddress shippingAddress");

    return res.status(200).json(
        new ApiResponse(200, parties, "Parties autocomplete suggestions")
    );
});

const getPartyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const party = await Party.findOne({ _id: id, createdBy: req.user._id });

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    const invoices = await Invoice.find({ party: party._id, createdBy: req.user._id }).sort({ createdAt: -1 });
    const payments = await Payment.find({ party: party._id, createdBy: req.user._id }).sort({ createdAt: -1 });

    // Compute ledger entries
    let ledger = [];

    invoices.forEach((inv) => {
        if (inv.status !== "cancelled") {
            ledger.push({
                type: "invoice",
                id: inv._id,
                no: inv.invoiceNo,
                date: inv.date,
                desc: `Invoice ${inv.invoiceNo} (${inv.saleType.toUpperCase()})`,
                debit: inv.saleType === "credit" ? inv.total : inv.total,
                credit: inv.saleType === "cash" ? inv.total : 0,
                saleType: inv.saleType,
                status: inv.status
            });
        }
    });

    payments.forEach((pay) => {
        ledger.push({
            type: "payment",
            id: pay._id,
            no: pay.reference || "PAYMENT",
            date: pay.date,
            desc: `Payment received (${pay.mode.toUpperCase()})`,
            debit: 0,
            credit: pay.amount,
            mode: pay.mode
        });
    });

    // Sort ledger by date ascending
    ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = 0;
    ledger = ledger.map((entry) => {
        runningBalance += (entry.debit - entry.credit);
        return {
            ...entry,
            runningBalance
        };
    });

    return res.status(200).json(
        new ApiResponse(200, {
            party,
            balance: runningBalance,
            ledger,
            invoices
        }, "Party details retrieved successfully")
    );
});

const updateParty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const party = await Party.findOneAndUpdate(
        { _id: id, createdBy: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    return res.status(200).json(
        new ApiResponse(200, party, "Party updated successfully")
    );
});

const deleteParty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const party = await Party.findOneAndDelete({ _id: id, createdBy: req.user._id });

    if (!party) {
        throw new ApiError(404, "Party not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Party deleted successfully")
    );
});

export {
    createParty,
    getParties,
    searchParties,
    getPartyById,
    updateParty,
    deleteParty
};
