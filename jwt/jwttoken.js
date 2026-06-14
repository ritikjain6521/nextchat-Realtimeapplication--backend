import jsonwebtoken from "jsonwebtoken";

const generateToken = (userId,res) => {
    const token = jsonwebtoken.sign({userId}, process.env.JWT_TOKEN, {

  expiresIn: '30d',

 });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // MUST be true for cross-domain cookies
        sameSite: 'none' // MUST be 'none' when frontend and backend are on different domains
    });
};
export default generateToken;