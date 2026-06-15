import Conversion from "../models/conversion.model.js";

export const createGroup = async (req, res) => {
    try {
        const { groupName, participants } = req.body;
        const senderId = req.user._id;

        if (!groupName || !participants || participants.length === 0) {
            return res.status(400).json({ message: "Group name and participants are required" });
        }

        // Add the creator to participants
        const members = [senderId, ...participants];

        const newGroup = await Conversion.create({
            members: members,
            isGroup: true,
            groupName: groupName,
            groupAdmin: senderId
        });

        res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const groups = await Conversion.find({
            members: userId,
            isGroup: true
        }).populate("members", "-password");

        res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
