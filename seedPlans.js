import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import SubscriptionPlan from "./models/subscriptionPlan.model.js";
import CreditPack from "./models/creditPack.model.js";

const plans = [
    { name: 'Free', price: 0, color: 'from-gray-500 to-gray-600', features: ['Basic Chat', '10 AI Credits', 'Community Support'] },
    { name: 'Pro', price: 299, color: 'from-purple-600 to-brand-primary', features: ['Unlimited Chat', '500 AI Credits', 'Priority Support'] },
    { name: 'Team', price: 999, color: 'from-blue-600 to-cyan-500', features: ['Team Workspace', '2000 AI Credits', '24/7 Support'] },
    { name: 'Enterprise', price: 2999, color: 'from-amber-500 to-orange-500', features: ['Custom Setup', 'Unlimited AI Credits', 'Dedicated Manager'] }
];

const packs = [
    { name: 'Starter Pack', credits: 100, price: 49, color: 'from-gray-500 to-gray-600' },
    { name: 'Pro Pack', credits: 500, price: 199, color: 'from-purple-600 to-brand-primary' },
    { name: 'Business Pack', credits: 2000, price: 699, color: 'from-blue-600 to-cyan-500' },
    { name: 'Enterprise Pack', credits: 10000, price: 2999, color: 'from-amber-500 to-orange-500' }
];

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        await SubscriptionPlan.deleteMany({});
        await SubscriptionPlan.insertMany(plans);
        console.log("✅ Plans seeded!");

        await CreditPack.deleteMany({});
        await CreditPack.insertMany(packs);
        console.log("✅ Packs seeded!");

    } catch (error) {
        console.error("❌ Seed error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
};

seedPlans();
