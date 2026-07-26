import { Invoice } from "../models/invoice.models.js";
import { Payment } from "../models/payment.models.js";
import { Party } from "../models/party.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getDashboardStats = asyncHandler(async (req, res) => {
    const invoices = await Invoice.find({ createdBy: req.user._id, status: { $ne: "cancelled" } })
        .populate("party", "name gstin")
        .sort({ createdAt: -1 });
    const payments = await Payment.find({ createdBy: req.user._id }).populate("party", "name");
    const parties = await Party.find({ createdBy: req.user._id });

    let totalBilled = 0;
    let totalCreditBilled = 0;
    let totalCashBilled = 0;

    invoices.forEach(inv => {
        totalBilled += inv.total;
        if (inv.saleType === "cash") {
            totalCashBilled += inv.total;
        } else {
            totalCreditBilled += inv.total;
        }
    });

    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0) + totalCashBilled;
    const totalReceivable = Math.max(0, totalBilled - totalCollected);

    // Recent invoices (top 5)
    const recentInvoices = invoices.slice(0, 5);

    // Party outstanding breakdown
    const partyStats = await Promise.all(
        parties.map(async (party) => {
            const partyInvoices = invoices.filter(i => i.party && i.party._id.toString() === party._id.toString());
            const partyPayments = payments.filter(p => p.party && p.party._id.toString() === party._id.toString());

            let due = 0;
            partyInvoices.forEach(inv => {
                if (inv.saleType === "credit") due += inv.total;
            });
            partyPayments.forEach(p => {
                due -= p.amount;
            });

            return {
                partyId: party._id,
                name: party.name,
                category: party.category,
                due
            };
        })
    );

    const outstandingParties = partyStats.filter(p => p.due > 0).sort((a, b) => b.due - a.due);

    return res.status(200).json(
        new ApiResponse(200, {
            totalBilled,
            totalCashBilled,
            totalCreditBilled,
            totalCollected,
            totalReceivable,
            totalInvoices: invoices.length,
            totalParties: parties.length,
            recentInvoices,
            outstandingParties
        }, "Dashboard statistics retrieved")
    );
});

export { getDashboardStats };
