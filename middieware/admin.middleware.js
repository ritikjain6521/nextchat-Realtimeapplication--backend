import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const adminMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: "Forbidden - Admin access required" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in admin middleware: ", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const requireCredits = (cost) => {
    return async (req, res, next) => {
        try {
            // Assumes secureRoute has already run and populated req.user
            const user = await User.findById(req.user._id);
            
            if (user.plan === 'Enterprise') {
                return next(); // Enterprise has unlimited
            }
            
            if (user.credits < cost) {
                return res.status(402).json({ 
                    message: "Insufficient credits", 
                    required: cost, 
                    available: user.credits 
                });
            }

            // Deduct credits
            user.credits -= cost;
            await user.save();
            
            // Attach updated user to request
            req.user = user;
            next();
        } catch (error) {
            console.log("Error in credit middleware: ", error.message);
            res.status(500).json({ message: "Internal server error" });
        }
    }
};
