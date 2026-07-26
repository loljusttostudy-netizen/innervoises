import { Factory } from "../models/factory.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createFactory = asyncHandler(async (req, res) => {
    const { name, state, address } = req.body;
    if (!name || !state || !address) {
        throw new ApiError(400, "Factory name, state, and address are required");
    }

    const factory = await Factory.create({
        name,
        state,
        address,
        createdBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, factory, "Factory created successfully")
    );
});

const getFactories = asyncHandler(async (req, res) => {
    const factories = await Factory.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, factories, "Factories retrieved successfully")
    );
});

const updateFactory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, state, address } = req.body;

    const factory = await Factory.findByIdAndUpdate(
        id,
        { name, state, address },
        { new: true, runValidators: true }
    );

    if (!factory) {
        throw new ApiError(404, "Factory not found");
    }

    return res.status(200).json(
        new ApiResponse(200, factory, "Factory updated successfully")
    );
});

const deleteFactory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const factory = await Factory.findByIdAndDelete(id);

    if (!factory) {
        throw new ApiError(404, "Factory not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Factory deleted successfully")
    );
});

export {
    createFactory,
    getFactories,
    updateFactory,
    deleteFactory
};
