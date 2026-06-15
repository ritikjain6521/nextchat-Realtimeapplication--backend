import Conversion from "../models/conversion.model.js";

// Create a new Channel
export const createChannel = async (req, res) => {
    try {
        const { channelName, participants } = req.body;
        const adminId = req.user._id;

        if (!channelName || !participants || participants.length === 0) {
            return res.status(400).json({ message: "Channel name and at least one participant required." });
        }

        const allMembers = [...new Set([adminId.toString(), ...participants])];

        const newChannel = await Conversion.create({
            members: allMembers,
            isGroup: false,
            isChannel: true,
            groupName: channelName,
            groupAdmin: adminId,
        });

        res.status(201).json(newChannel);
    } catch (error) {
        console.error("Error creating channel:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// Get all channels the current user is a member of
export const getChannels = async (req, res) => {
    try {
        const userId = req.user._id;
        const channels = await Conversion.find({
            isChannel: true,
            members: { $in: [userId] }
        }).populate("groupAdmin", "fullname profilePhoto");

        res.status(200).json(channels);
    } catch (error) {
        console.error("Error fetching channels:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
