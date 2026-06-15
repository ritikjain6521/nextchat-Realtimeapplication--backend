import mongoose from "mongoose";
import User from "./user.model.js";
const messageSchema = new mongoose.Schema({
    senderId: {
         type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }, receiverId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: false // Not required if sending an image/audio
    },
    mediaUrl: {
        type: String,
        default: null
    },
    mediaType: {
        type: String, // 'image', 'audio', 'document', etc.
        default: null
    }
}, { timestamps: true })
const Message = mongoose.model("message", messageSchema);
export default Message;