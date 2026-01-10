import mongoose from "mongoose";
import { Coupon } from "../models/coupon.model.js";
import { ENV } from "../config/env.js";

const checkCoupons = async () => {
    try {
        console.log("Connecting to DB:", ENV.DB_URL);
        await mongoose.connect(ENV.DB_URL);

        // Find all coupons
        const coupons = await Coupon.find({});
        console.log(`Found ${coupons.length} coupons.`);

        coupons.forEach(c => {
            console.log(`Code: '${c.code}', Active: ${c.isActive}, ValidUntil: ${c.validUntil}, ValidFrom: ${c.validFrom}`);
        });

        // Check specific coupons mentioned by user
        const welcome = await Coupon.findOne({ code: "WELCOME500" });
        if (welcome) console.log("WELCOME500 found:", welcome);
        else console.log("WELCOME500 NOT FOUND");

        const summer = await Coupon.findOne({ code: "SUMMER2026" });
        if (summer) console.log("SUMMER2026 found:", summer);
        else console.log("SUMMER2026 NOT FOUND");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkCoupons();
