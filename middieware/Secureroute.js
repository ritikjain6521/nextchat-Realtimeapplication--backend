import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const secureRoute=async (req, res, next)=> {

try {
    let token = req.cookies.jwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token){
    return res.status(401).json({error: "No token, authorization denied"});
    }
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_TOKEN);
    } catch (err) {
        return res.status(401).json({error: "invalid or expired token"});
    }
    
    if(!decoded){
     return res.status(401).json({error: "invalid token"});
    }
    const user = await User.findById(decoded.userId).select("-password");
    if(!user){
    return res.status(401).json({error:"no user found"});
    }
    req.user=user;
    next();


} catch (error) {
   console.log("error in secureRoute:",error) 
   res.status(500).json({error: "Internal server error"})
}

}
export default secureRoute;