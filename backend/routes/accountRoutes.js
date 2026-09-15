const express = require("express");
const Account = require("../models/Account");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const accounts = await Account.find().sort({ createdAt: 1 });

        res.json(accounts);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch accounts",
            error: error.message,
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const account = new Account(req.body);

        const savedAccount = await account.save();

        res.status(201).json(savedAccount);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create account",
            error: error.message,
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const updatedAccount = await Account.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedAccount) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        res.json(updatedAccount);
    } catch (error) {
        res.status(400).json({
            message: "Failed to update account",
            error: error.message,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedAccount = await Account.findOneAndDelete({
            id: req.params.id,
        });

        if (!deletedAccount) {
            return res.status(404).json({
                message: "Account not found",
            });
        }

        res.json({
            message: "Account deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete account",
            error: error.message,
        });
    }
});

module.exports = router;