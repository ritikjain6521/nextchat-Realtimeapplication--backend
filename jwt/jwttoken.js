import jsonwebtoken from "jsonwebtoken";

const generateToken = (userId,res) => {
    const token = jsonwebtoken.sign({userId}, process.env.JWT_TOKEN, {

  expiresIn: '30d',

 });
 res.cookie('jwt', token, {
    httpOnly: true,
    secure:true,
    sameSite:'strict'
 });
};
export default generateToken;