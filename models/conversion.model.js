import mongoose from "mongoose";
import User from "./user.model.js";
import Message from "./message.model.js";
const conversionSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    messageText: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
        default: []
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    isChannel: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        default: ""
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    groupIcon: {
        type: String,
        default: ""
    },
    clearedAt: {
        type: Map,
        of: Date,
        default: {}
    }
}, { timestamps: true })
const Conversion = mongoose.model("Conversion", conversionSchema);
export default Conversion;