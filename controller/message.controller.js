import Conversion from "../models/conversion.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let newMessage = await Conversion.findOne({
            members: { $all: [senderId, receiverId] },
        });

        if (!newMessage) {
            newMessage = await Conversion.create({
                members: [senderId, receiverId],           
            });
        }

        const messageData = new Message({
            senderId,
            receiverId,
            message,
        }); 

        if (messageData) {
            newMessage.messageText.push(messageData._id);
        }
           
        await Promise.all([newMessage.save(), messageData.save()]);

        // Socket.io functionality for real-time messaging
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", messageData);
        }

        res.status(200).json({ message: "Message sent successfully", messageData });
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong"});
    }







}
export const getMessage = async (req, res) => {
  try {
    const { id: chatuser } = req.params;
    const senderId = req.user._id;

    const conversion = await Conversion.findOne({
      members: { $all: [senderId, chatuser] },
    }).populate("messageText");  // <-- FIX HERE

    if (!conversion) {
      return res.status(201).json({ message: "No messageText found", messageText: [] });
    }

    res.status(201).json({ messageText: conversion.messageText });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
