import { connectDB } from "../config/db.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

async function verify() {
    console.log("Starting verification...");
    try {
        await connectDB();
    } catch (e) {
        console.error("DB Connection Failed:", e);
        process.exit(1);
    }

    const dummyId = new mongoose.Types.ObjectId();
    const clerkId = "test_clerk_" + Date.now();

    // 1. Create Dummy User
    let dummyUser;
    try {
        dummyUser = await User.create({
            _id: dummyId,
            clerkId: clerkId,
            email: "test_" + Date.now() + "@example.com",
            firstName: "Test",
            lastName: "User",
            role: "user"
        });
        console.log("User created:", dummyUser._id);
    } catch (e) {
        console.error("User creation failed:", e);
        process.exit(1);
    }

    let product, cart, order;

    try {
        // 2. Create Product with Variants
        product = await Product.create({
            name: "Test Perfume " + Date.now(),
            brand: new mongoose.Types.ObjectId(), // Fake brand ID
            description: "Test Desc",
            price: 100, // Root price (fallback)
            volume: 50, // Root volume
            stock: 10, // Root stock
            category: "Test",
            gender: "Унисекс",
            scentFamily: "Floral",
            concentration: "Духи",
            images: ["http://example.com/img.jpg"],
            article: "ART" + Date.now(),
            variants: [
                { volume: 30, price: 3000, stock: 20 },
                { volume: 50, price: 5000, stock: 15 },
                { volume: 100, price: 9000, stock: 10 }
            ]
        });
        console.log("Product created:", product._id);

        // 3. Add to Cart (simulate Logic from Cart Controller)
        const selectedVolume = 50; // Price 5000
        const quantity = 2; // Total 10000

        cart = await Cart.create({
            user: dummyUser._id,
            clerkId: dummyUser.clerkId,
            items: [{
                product: product._id,
                quantity: quantity,
                volume: selectedVolume
            }]
        });

        // Populate to check subtotal
        await cart.populate({
            path: "items.product",
            select: "name price images category brand volume variants"
        });

        console.log("Cart Subtotal (Expected 10000):", cart.subtotal);
        if (cart.subtotal !== 10000) throw new Error(`Cart subtotal incorrect! Got ${cart.subtotal}`);

        // 4. Create Order (Simulate Order Controller core logic)
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Verify Stock
            const p = await Product.findById(product._id).session(session);
            const v = p.variants.find(v => v.volume === selectedVolume);
            if (v.stock < quantity) throw new Error("Stock insufficient");

            const finalPrice = v.price * quantity; // 10000

            // Create Order
            const createdOrders = await Order.create([{
                user: dummyUser._id,
                clerkId: dummyUser.clerkId,
                orderItems: [{
                    product: p._id,
                    name: p.name,
                    quantity: quantity,
                    price: v.price,
                    image: p.images[0],
                    volume: selectedVolume
                }],
                shippingAddress: {
                    fullName: "Test", phone: "123", streetAddress: "St", city: "C", region: "R", zipCode: "000"
                },
                totalPrice: finalPrice,
                paymentResult: { id: "test", status: "paid", email: "test@test.com" }
            }], { session });

            order = createdOrders[0];

            // Deduct Stock
            v.stock -= quantity;
            await p.save({ session });

            await session.commitTransaction();
            console.log("Order created:", order._id);
        } catch (e) {
            await session.abortTransaction();
            throw e;
        }

        session.endSession();

        // 5. Verify final stock
        const finalProduct = await Product.findById(product._id);
        const finalVariant = finalProduct.variants.find(v => v.volume === selectedVolume);
        console.log("Final Stock (Expected 13):", finalVariant.stock);

        if (finalVariant.stock !== 13) throw new Error(`Stock deduction failed! Got ${finalVariant.stock}`);

        console.log("VERIFICATION SUCCESSFUL");

    } catch (err) {
        console.error("Verification Failed:", err);
    } finally {
        // Cleanup
        console.log("Cleaning up...");
        if (dummyUser) await User.findByIdAndDelete(dummyUser._id);
        if (product) await Product.findByIdAndDelete(product._id);
        if (cart) await Cart.findByIdAndDelete(cart._id);
        if (order) await Order.findByIdAndDelete(order._id);

        console.log("Done");
        process.exit(0);
    }
}

verify();
