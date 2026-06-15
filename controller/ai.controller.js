import Message from "../models/message.model.js";
import { GoogleGenAI } from '@google/genai';

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        let aiResponseText = "";

        if (!apiKey) {
            // Fallback mock if key is missing
            await new Promise(resolve => setTimeout(resolve, 1500));
            aiResponseText = "Hello! I am running in mock mode. Please add your GEMINI_API_KEY to the backend .env file to unlock my full capabilities!";
        } else {
            const ai = new GoogleGenAI({ apiKey });
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: message,
                });
                aiResponseText = response.text;
            } catch (apiError) {
                console.error("Gemini API Error:", apiError);
                aiResponseText = "Sorry, I encountered an error connecting to my brain. Please check the server logs.";
            }
        }
        
        // Return a mock message object formatted like a real database message
        const mockMessageData = {
            _id: "ai_" + Date.now(),
            senderId: "ai_assistant",
            receiverId: req.user._id,
            message: aiResponseText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        res.status(200).json({ message: "AI response generated", messageData: mockMessageData });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "AI Assistant failed to respond." });
    }
};
