import Conversion from "../models/conversion.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Check for block if not a group message
        let newMessage = await Conversion.findById(receiverId);
        if (!newMessage || !newMessage.isGroup) {
            const senderUser = await User.findById(senderId);
            const receiverUser = await User.findById(receiverId);
            
            if (senderUser?.blockedUsers?.some(id => id.toString() === receiverId.toString())) {
                return res.status(403).json({ message: "You have blocked this user" });
            }
            if (receiverUser?.blockedUsers?.some(id => id.toString() === senderId.toString())) {
                return res.status(403).json({ message: "You are blocked by this user" });
            }
        }

        // Handle file upload
        let mediaUrl = null;
        let mediaType = null;
        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            const mimeType = req.file.mimetype;
            if (mimeType.startsWith('image/')) mediaType = 'image';
            else if (mimeType.startsWith('audio/')) mediaType = 'audio';
            else if (mimeType.startsWith('video/')) mediaType = 'video';
            else mediaType = 'document';
        }

        // Check if receiverId is actually a group Conversion ID
        // (newMessage is already initialized above)

        // If not a group, try to find a 1-on-1 conversation
        if (!newMessage || !newMessage.isGroup) {
            newMessage = await Conversion.findOne({
                members: { $all: [senderId, receiverId] },
                isGroup: false
            });

            if (!newMessage) {
                newMessage = await Conversion.create({
                    members: [senderId, receiverId],
                    isGroup: false
                });
            }
        }

        const messageData = new Message({
            senderId,
            receiverId: newMessage.isGroup ? newMessage._id : receiverId,
            message: message || "",
            mediaUrl,
            mediaType
        }); 

        if (messageData) {
            newMessage.messageText.push(messageData._id);
        }
           
        await Promise.all([newMessage.save(), messageData.save()]);

        // Socket.io functionality for real-time messaging
        if (newMessage.isGroup) {
            // Emit to all group members except sender
            newMessage.members.forEach((memberId) => {
                if (memberId.toString() !== senderId.toString()) {
                    const socketId = getReceiverSocketId(memberId);
                    if (socketId) io.to(socketId).emit("newMessage", messageData);
                }
            });
        } else {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", messageData);
            }
        }

        res.status(200).json({ message: "Message sent successfully", messageData });
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong"});
    }
}

export const getMessage = async (req, res) => {
  try {
    const { id: targetId } = req.params;
    const senderId = req.user._id;

    // Check if targetId is a group
    let conversion = await Conversion.findById(targetId).populate("messageText");

    // If not a group, find 1-on-1 conversation
    if (!conversion || !conversion.isGroup) {
        conversion = await Conversion.findOne({
            members: { $all: [senderId, targetId] },
            isGroup: false
        }).populate("messageText");
    }

    if (!conversion) {
      return res.status(201).json({ message: "No messageText found", messageText: [] });
    }

    // Filter messages based on clearedAt timestamp
    let filteredMessages = conversion.messageText;
    if (conversion.clearedAt && conversion.clearedAt.has(senderId.toString())) {
        const clearTime = new Date(conversion.clearedAt.get(senderId.toString()));
        filteredMessages = filteredMessages.filter(msg => {
            return new Date(msg.createdAt) > clearTime;
        });
    }

    res.status(201).json({ messageText: filteredMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Star a message
export const starMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;
    const User = (await import('../models/user.model.js')).default;
    await User.findByIdAndUpdate(userId, { $addToSet: { starredMessages: messageId } });
    res.status(200).json({ message: "Message starred" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Unstar a message
export const unstarMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;
    const User = (await import('../models/user.model.js')).default;
    await User.findByIdAndUpdate(userId, { $pull: { starredMessages: messageId } });
    res.status(200).json({ message: "Message unstarred" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all starred messages for current user
export const getStarredMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId).populate({
      path: 'starredMessages',
      model: 'message'
    });
    res.status(200).json(user?.starredMessages || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
