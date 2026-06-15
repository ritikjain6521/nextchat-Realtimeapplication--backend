import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import generateToken from "../jwt/jwttoken.js";
export const Signup= async (req,res)=>{
 const{fullname,email,password,confirmPassword}=req.body;
  try {
     if(password!==confirmPassword){
   return res.status(400).json({message:"Password not match"});

 }
  const user=  await User.findOne({email});
    if(user){
        return res.status(400).json({message:"User already exists"});
    }
   const hashedPassword= await bcrypt.hash(password,10);
    const newUser= await new User({fullname, 
        email,
        password:hashedPassword,
   
    });
    await newUser.save();
    if(newUser){
          generateToken(newUser._id,res);
         res.status(200).json({message:"User registered successfully", User:{
            _id:newUser._id,
            fullname:newUser.fullname,
            email:newUser.email,
            profilePhoto:newUser.profilePhoto,
            customStatus:newUser.customStatus,
            bio:newUser.bio,
            website:newUser.website,
            socialLink:newUser.socialLink,
         }});
    }
 
    
  } catch (error) {
     console.log(error);
        res.status(500).json({message:"Something went wrong"});
  }
}
export const login = async (req,res)=>{

    const{email,password}=req.body;
    try {
        const user= await User.findOne({email});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }
        generateToken(user._id,res);
        res.status(200).json({message:"Login successful",user:{
            _id:user._id,
            fullname:user.fullname,
            email:user.email,
            profilePhoto:user.profilePhoto,
            customStatus:user.customStatus,
            bio:user.bio,
            website:user.website,
            socialLink:user.socialLink,
        } });
    } catch (error) {
       console.log(error);
            res.status(500).json({message:"Something went wrong"});
    }





}
export const logout = (req,res)=>{
try {
    res.clearCookie('jwt');
    res.status(200).json({message:"Logout successful"});
  
} catch (error) {
   console.log(error);
            res.status(500).json({message:"Something went wrong"});
  
}

}
export const allUser = async (req, res)=>{

    try {
     const loggedInUser=req.user._id;
     const filteredUser= await User.find({_id: {$ne: loggedInUser},}).select("-password");
     res.status(201).json(filteredUser);
    
    } catch (error) {
        console.log("Error in alluser Controller:" +error );
        res.status(500).json({ message: "Internal server error" });
    }
    
    
}    

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { customStatus, bio, website, socialLink } = req.body;
        
        let updateData = { customStatus, bio, website, socialLink };

        // If an image was uploaded, add it to the update data
        if (req.file) {
            // Provide the public URL to access the image
            const port = process.env.PORT || 3001;
            const baseUrl = process.env.NODE_ENV === "production" 
                ? "https://nextchat-realtimeapplication-backend-3.onrender.com" 
                : `http://localhost:${port}`;
            updateData.profilePhoto = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};


