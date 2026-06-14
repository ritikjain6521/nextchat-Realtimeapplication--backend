import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    mediaUrl: {
        type: String, // URL to the uploaded image/video or just empty if text only
        required: false
    },
    text: {
        type: String, // Optional text or text-only status
        required: false
    },
    type: {
        type: String,
        enum: ["image", "video", "text"],
        default: "text"
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, { timestamps: true });

// Index for automatic deletion after expiry
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Status = mongoose.model("Status", statusSchema);

export default Status;
