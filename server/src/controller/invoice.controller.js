import { Invoice } from "../models/invoice.models.js";
import { Party } from "../models/party.models.js";
import { Factory } from "../models/factory.models.js";
import { Counter } from "../models/counter.models.js";
import { BusinessProfile } from "../models/businessProfile.models.js";
import { Item } from "../models/item.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { numberToWordsIndian } from "../utils/numberToWords.js";
import { generateInvoicePdf, compileInvoiceHtml } from "../utils/pdfGenerator.js";
import mongoose from "mongoose";

// Utility to parse invoice number into prefix and integer suffix
function parseInvoiceNo(invoiceNo) {
    const match = invoiceNo.match(/^(.*\/|\D+)?(\d+)$/);
    if (match) {
        return {
            prefix: match[1] || "",
            num: parseInt(match[2], 10)
        };
    }
    return { prefix: invoiceNo, num: 1 };
}

const getNextNumber = asyncHandler(async (req, res) => {
    const { prefix = "SH/26-27/" } = req.query;

    const counter = await Counter.findOne({ prefix, createdBy: req.user._id });
    if (counter) {
        return res.status(200).json(
            new ApiResponse(200, {
                prefix,
                nextNumber: counter.currentNumber + 1,
                suggestedInvoiceNo: `${prefix}${counter.currentNumber + 1}`
            }, "Next invoice number suggested")
        );
    } else {
        // Try finding highest existing invoice with this prefix
        const invoices = await Invoice.find({ createdBy: req.user._id, invoiceNo: { $regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } });
        let maxNum = 0;
        invoices.forEach(inv => {
            const parsed = parseInvoiceNo(inv.invoiceNo);
            if (parsed.num > maxNum) maxNum = parsed.num;
        });

        const nextNum = maxNum > 0 ? maxNum + 1 : 1;
        return res.status(200).json(
            new ApiResponse(200, {
                prefix,
                nextNumber: nextNum,
                suggestedInvoiceNo: `${prefix}${nextNum}`
            }, "Next invoice number suggested")
        );
    }
});

const checkRateAnomaly = asyncHandler(async (req, res) => {
    const { itemId, partyId, rate } = req.query;

    if (!itemId || !partyId || rate === undefined) {
        return res.status(200).json(
            new ApiResponse(200, { isAnomaly: false }, "Missing parameters for rate check")
        );
    }

    const currentRate = parseFloat(rate);
    if (isNaN(currentRate) || currentRate <= 0) {
        return res.status(200).json(
            new ApiResponse(200, { isAnomaly: false }, "Invalid rate")
        );
    }

    // Aggregate past invoices for this item + party
    const stats = await Invoice.aggregate([
        { $match: { party: new mongoose.Types.ObjectId(partyId), createdBy: req.user._id, status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $match: { "items.item": new mongoose.Types.ObjectId(itemId) } },
        {
            $group: {
                _id: null,
                avgRate: { $avg: "$items.rate" },
                count: { $sum: 1 }
            }
        }
    ]);

    if (!stats || stats.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, { isAnomaly: false, hasHistory: false }, "No rate history found")
        );
    }

    const avgRate = stats[0].avgRate;
    const diff = currentRate - avgRate;
    const percentageDev = (diff / avgRate) * 100;
    const isAnomaly = Math.abs(percentageDev) >= 20;

    return res.status(200).json(
        new ApiResponse(200, {
            isAnomaly,
            hasHistory: true,
            avgRate: parseFloat(avgRate.toFixed(4)),
            percentageDev: parseFloat(percentageDev.toFixed(1)),
            message: isAnomaly
                ? `Rate ₹${currentRate} is ${Math.abs(percentageDev.toFixed(1))}% ${percentageDev > 0 ? "higher" : "lower"} than average ₹${avgRate.toFixed(2)} for this buyer`
                : "Rate is within normal range"
        }, "Rate anomaly check result")
    );
});

const createInvoice = asyncHandler(async (req, res) => {
    const {
        invoiceNo, date, factoryId, partyId, placeOfSupply,
        saleType = "credit", items,
        vehicleNo, transportName, noOfCases, eWayBillNo,
        memoNo, memoDate, soNo, soDate, contractNoGEMC, cpNo, cpDate,
        customFields = []
    } = req.body;

    if (!invoiceNo || !date || !factoryId || !partyId || !items || items.length === 0) {
        throw new ApiError(400, "Missing required fields: invoiceNo, date, factory, party, items");
    }

    const factory = await Factory.findOne({ _id: factoryId, createdBy: req.user._id });
    if (!factory) throw new ApiError(404, "Factory not found");

    const party = await Party.findOne({ _id: partyId, createdBy: req.user._id });
    if (!party) throw new ApiError(404, "Party not found");

    const pos = placeOfSupply || party.state;
    const isIntraState = factory.state.trim().toLowerCase() === pos.trim().toLowerCase();

    // Fetch business profile for default decimal precision if needed
    const profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });
    const globalRateDecimals = profile?.rateDecimalPlaces ?? 2;

    // Calculate line amounts and taxes, auto-saving new catalog items if needed
    let subtotal = 0;
    let totalGstAmount = 0;

    for (const r of items) {
        const q = Number(r.qty || 0);
        const rt = Number(r.rate || 0);
        if (q <= 0) {
            throw new ApiError(400, `Quantity for "${r.name || 'item'}" must be greater than 0`);
        }
        if (rt <= 0) {
            throw new ApiError(400, `Rate for "${r.name || 'item'}" must be greater than 0`);
        }
    }

    const processedItems = await Promise.all(items.map(async (r) => {
        let targetItemId = r.itemId || null;

        if (!targetItemId && r.name && r.name.trim()) {
            let existingItem = await Item.findOne({
                createdBy: req.user._id,
                name: { $regex: `^${r.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" }
            });
            if (!existingItem) {
                existingItem = await Item.create({
                    name: r.name.trim(),
                    hsn: r.hsn || "",
                    unit: r.unit || "NOS",
                    rate: Number(r.rate || 0),
                    gstRate: Number(r.gst || 18),
                    description: r.description || "-",
                    category: "General",
                    createdBy: req.user._id
                });
            }
            targetItemId = existingItem._id;
        }

        const qty = Number(r.qty || 0);
        const rate = Number(r.rate || 0);
        const gstPct = Number(r.gst || 18);
        const amount = qty * rate;
        const lineGst = amount * (gstPct / 100);

        subtotal += amount;
        totalGstAmount += lineGst;

        return {
            item: targetItemId,
            name: r.name,
            description: r.description || "-",
            hsn: r.hsn || "",
            qty,
            unit: r.unit || "NOS",
            rate,
            gst: gstPct,
            amount,
            rateDecimalPlaces: r.rateDecimalPlaces ?? globalRateDecimals
        };
    }));

    let cgst = 0, sgst = 0, igst = 0;
    if (isIntraState) {
        cgst = totalGstAmount / 2;
        sgst = totalGstAmount / 2;
    } else {
        igst = totalGstAmount;
    }

    const totalTaxableAmount = subtotal;
    const rawTotal = subtotal + totalGstAmount;
    const total = Math.round(rawTotal);
    const roundOff = total - rawTotal;

    const totalInWords = numberToWordsIndian(total);

    // Initial status
    const status = saleType === "cash" ? "paid" : "generated";

    const invoice = await Invoice.create({
        invoiceNo,
        date,
        factory: factory._id,
        party: party._id,
        placeOfSupply: pos,
        isIntraState,
        saleType,
        items: processedItems,
        subtotal,
        totalTaxableAmount,
        cgst,
        sgst,
        igst,
        roundOff,
        total,
        totalInWords,
        vehicleNo: vehicleNo || party.vehicleNo || "",
        transportName: transportName || party.transportName || "",
        noOfCases: noOfCases || party.noOfCases || "",
        eWayBillNo: eWayBillNo || party.eWayBillNo || "",
        memoNo: memoNo || party.memoNo || "",
        memoDate: memoDate || party.memoDate || "",
        soNo: soNo || party.soNo || "",
        soDate: soDate || party.soDate || "",
        contractNoGEMC: contractNoGEMC || party.contractNoGEMC || "",
        cpNo: cpNo || party.cpNo || "",
        cpDate: cpDate || party.cpDate || "",
        customFields: Array.isArray(customFields) ? customFields.filter(f => f.label && f.label.trim()) : [],
        status,
        templateId: profile?.templateId || "classic",
        createdBy: req.user._id
    });

    // Save custom fields on Party so they are remembered for future invoices
    if (Array.isArray(customFields) && customFields.length > 0) {
        const validCustomFields = customFields.filter(f => f.label && f.label.trim());
        if (validCustomFields.length > 0) {
            await Party.findByIdAndUpdate(party._id, {
                $set: { customFields: validCustomFields.map(f => ({ label: f.label.trim(), value: '' })) }
            });
        }
    }

    // Update Counter for auto-numbering
    const parsed = parseInvoiceNo(invoiceNo);
    if (parsed.prefix) {
        await Counter.findOneAndUpdate(
            { prefix: parsed.prefix, createdBy: req.user._id },
            { $set: { currentNumber: parsed.num, createdBy: req.user._id } },
            { upsert: true, new: true }
        );
    }

    return res.status(201).json(
        new ApiResponse(201, invoice, "Invoice created successfully")
    );
});

const getInvoices = asyncHandler(async (req, res) => {
    const { factoryId, partyId, status, saleType } = req.query;
    let filter = { createdBy: req.user._id };

    if (factoryId) filter.factory = factoryId;
    if (partyId) filter.party = partyId;
    if (status) filter.status = status;
    if (saleType) filter.saleType = saleType;

    const invoices = await Invoice.find(filter)
        .populate("factory", "name state")
        .populate("party", "name gstin state category")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, invoices, "Invoices retrieved successfully")
    );
});

const getInvoiceById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const invoice = await Invoice.findOne({ _id: id, createdBy: req.user._id })
        .populate("factory")
        .populate("party");

    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }

    return res.status(200).json(
        new ApiResponse(200, invoice, "Invoice retrieved successfully")
    );
});

const updateInvoice = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const invoice = await Invoice.findOne({ _id: id, createdBy: req.user._id });
    if (!invoice) throw new ApiError(404, "Invoice not found");

    if (invoice.status === "cancelled") {
        throw new ApiError(400, "Cannot update a cancelled invoice");
    }

    if (req.body.items && Array.isArray(req.body.items)) {
        for (const r of req.body.items) {
            if (r.qty !== undefined && Number(r.qty) <= 0) {
                throw new ApiError(400, `Quantity for "${r.name || 'item'}" must be greater than 0`);
            }
            if (r.rate !== undefined && Number(r.rate) <= 0) {
                throw new ApiError(400, `Rate for "${r.name || 'item'}" must be greater than 0`);
            }
        }
    }

    const updated = await Invoice.findOneAndUpdate(
        { _id: id, createdBy: req.user._id },
        req.body,
        { new: true, runValidators: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updated, "Invoice updated successfully")
    );
});

const getInvoiceHtml = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format } = req.query;
    const invoice = await Invoice.findOne({ _id: id, createdBy: req.user._id }).populate("factory").populate("party");

    if (!invoice) throw new ApiError(404, "Invoice not found");

    const profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });

    const html = compileInvoiceHtml(invoice, profile, format || profile?.defaultPrintFormat || "a4");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
});

const generatePdf = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { format } = req.query;
    const invoice = await Invoice.findOne({ _id: id, createdBy: req.user._id }).populate("factory").populate("party");

    if (!invoice) throw new ApiError(404, "Invoice not found");

    const profile = await BusinessProfile.findOne({ $or: [{ user: req.user._id }, { updatedBy: req.user._id }] });

    const result = await generateInvoicePdf(invoice, profile, format || profile?.defaultPrintFormat || "a4");

    if (result.isBuffer) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Invoice_${invoice.invoiceNo.replace(/\//g, '_')}.pdf"`);
        return res.send(result.data);
    } else {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="Invoice_${invoice.invoiceNo.replace(/\//g, '_')}.html"`);
        return res.send(result.data);
    }
});

export {
    getNextNumber,
    checkRateAnomaly,
    createInvoice,
    getInvoices,
    getInvoiceById,
    updateInvoice,
    getInvoiceHtml,
    generatePdf
};
