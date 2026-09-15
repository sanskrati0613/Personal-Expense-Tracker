const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const accountRoutes = require("./routes/accountRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/accounts", accountRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker API is running",
    });
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });