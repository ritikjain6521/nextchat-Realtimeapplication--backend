import User from "../models/user.model.js";
import Conversion from "../models/conversion.model.js";

export const toggleBlockUser = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const targetUserId = req.params.id;

        const user = await User.findById(currentUserId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isBlocked = user.blockedUsers.some(id => id.toString() === targetUserId.toString());
        
        if (isBlocked) {
            user.blockedUsers.pull(targetUserId);
        } else {
            user.blockedUsers.push(targetUserId);
        }
        await user.save();

        res.status(200).json({ message: isBlocked ? "User unblocked" : "User blocked", blockedUsers: user.blockedUsers });
    } catch (error) {
        console.log("Error in toggleBlockUser:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const toggleMuteConversation = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const conversationId = req.params.id;

        const user = await User.findById(currentUserId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMuted = user.mutedConversations.some(id => id.toString() === conversationId.toString());
        
        if (isMuted) {
            user.mutedConversations.pull(conversationId);
        } else {
            user.mutedConversations.push(conversationId);
        }
        await user.save();

        res.status(200).json({ message: isMuted ? "Conversation unmuted" : "Conversation muted", mutedConversations: user.mutedConversations });
    } catch (error) {
        console.log("Error in toggleMuteConversation:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const clearChat = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const conversationId = req.params.id;

        const conversion = await Conversion.findById(conversationId);
        if (!conversion) return res.status(404).json({ message: "Conversation not found" });

        if (!conversion.clearedAt) {
            conversion.clearedAt = new Map();
        }
        
        // Record the time this user cleared the chat
        conversion.clearedAt.set(currentUserId.toString(), new Date());
        await conversion.save();

        res.status(200).json({ message: "Chat cleared locally" });
    } catch (error) {
        console.log("Error in clearChat:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const leaveGroupOrChannel = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const conversationId = req.params.id;

        const conversion = await Conversion.findById(conversationId);
        if (!conversion) return res.status(404).json({ message: "Conversation not found" });

        conversion.members.pull(currentUserId);
        
        // If no members left, delete it entirely? We'll just save it.
        if (conversion.members.length === 0) {
            await Conversion.findByIdAndDelete(conversationId);
            return res.status(200).json({ message: "Left and deleted empty group/channel" });
        } else {
            await conversion.save();
            return res.status(200).json({ message: "Left group/channel successfully" });
        }
    } catch (error) {
        console.log("Error in leaveGroupOrChannel:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
