import { Item } from "../models/item.models.js";
import { Invoice } from "../models/invoice.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const DEFAULT_UNITS = [
    "meter", "MT", "pieces", "NOS", "BUNDLE", "kg", "litre",
    "dozen", "half dozen", "sq.ft", "box", "set", "roll", "pkt"
];

const createItem = asyncHandler(async (req, res) => {
    const { name, category, hsn, unit, rate, gst, rateDecimalPlaces } = req.body;
    if (!name || rate === undefined || rate === null || Number(rate) <= 0) {
        throw new ApiError(400, "Item name is required and rate must be greater than 0");
    }

    const item = await Item.create({
        name,
        category: category || "General",
        hsn: hsn || "",
        unit: unit || "NOS",
        rate: Number(rate),
        gst: gst !== undefined ? Number(gst) : 18,
        rateDecimalPlaces: rateDecimalPlaces !== undefined ? (rateDecimalPlaces === null ? null : Number(rateDecimalPlaces)) : null,
        createdBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, item, "Item created successfully")
    );
});

const getItems = asyncHandler(async (req, res) => {
    const items = await Item.find({ createdBy: req.user._id }).sort({ name: 1 });

    return res.status(200).json(
        new ApiResponse(200, items, "Items retrieved successfully")
    );
});

const searchItems = asyncHandler(async (req, res) => {
    const { q = "" } = req.query;
    const query = q.trim();

    if (!query) {
        const topItems = await Item.find({ createdBy: req.user._id }).limit(10);
        return res.status(200).json(new ApiResponse(200, topItems, "Top items"));
    }

    const items = await Item.find({
        createdBy: req.user._id,
        $or: [
            { name: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
            { hsn: { $regex: query, $options: "i" } }
        ]
    }).limit(10);

    return res.status(200).json(
        new ApiResponse(200, items, "Items autocomplete suggestions")
    );
});

const getDistinctUnits = asyncHandler(async (req, res) => {
    const dbUnits = await Item.distinct("unit", { createdBy: req.user._id });

    // Extract units from past invoices as well
    const invoices = await Invoice.aggregate([
        { $match: { createdBy: req.user._id } },
        { $unwind: "$items" },
        { $group: { _id: "$items.unit" } }
    ]);
    const invoiceUnits = invoices.map(i => i._id).filter(Boolean);

    // Merge and deduplicate (case-preserving)
    const allUnits = Array.from(new Set([...DEFAULT_UNITS, ...dbUnits, ...invoiceUnits]));

    return res.status(200).json(
        new ApiResponse(200, allUnits, "Units list retrieved successfully")
    );
});

const updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, category, hsn, unit, rate, gst, rateDecimalPlaces } = req.body;

    if (rate !== undefined && (rate === null || Number(rate) <= 0)) {
        throw new ApiError(400, "Item rate must be greater than 0");
    }

    const item = await Item.findOneAndUpdate(
        { _id: id, createdBy: req.user._id },
        {
            name,
            category,
            hsn,
            unit,
            rate: rate !== undefined ? Number(rate) : undefined,
            gst: gst !== undefined ? Number(gst) : undefined,
            rateDecimalPlaces: rateDecimalPlaces !== undefined ? rateDecimalPlaces : undefined
        },
        { new: true, runValidators: true }
    );

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, item, "Item updated successfully")
    );
});

const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await Item.findOneAndDelete({ _id: id, createdBy: req.user._id });

    if (!item) {
        throw new ApiError(404, "Item not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Item deleted successfully")
    );
});

export {
    createItem,
    getItems,
    searchItems,
    getDistinctUnits,
    updateItem,
    deleteItem
};
