const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: true,
        },

        type: {
            type: String,
            required: true,
        },

        openingBalance: {
            type: Number,
            default: 0,
        },

        balance: {
            type: Number,
            default: 0,
        },

        includeInTotal: {
            type: Boolean,
            default: true,
        },

        isArchived: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("Account", accountSchema);