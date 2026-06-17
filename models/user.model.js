import mongoose from "mongoose"; 


const userSchema= mongoose.Schema({
fullname :{
  type:String,
  required:true,
},
email :{
    type:String,
    required:true,
},
password:{
  type:String,
  required:true,

},
confirmPassword:{
  type:String,
},
profilePhoto: {
  type: String,
  default: "https://img.daisyui.com/images/profile/demo/gordon@192.webp"
},
customStatus: {
  type: String,
  default: "Available"
},
bio: {
  type: String,
  default: ""
},
website: {
  type: String,
  default: ""
},
socialLink: {
  type: String,
  default: ""
},
starredMessages: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "message",
}],
blockedUsers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
}],
mutedConversations: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Conversion",
}],
isAdmin: {
  type: Boolean,
  default: false
},
credits: {
  type: Number,
  default: 100 // Welcome bonus
},
plan: {
  type: String,
  enum: ['Free', 'Pro', 'Team', 'Enterprise'],
  default: 'Free'
}

},{timestamps:true})

const User= mongoose.model("User",userSchema)

export default User
