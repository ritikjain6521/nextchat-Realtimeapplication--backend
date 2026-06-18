import jsonwebtoken from "jsonwebtoken";

const generateToken = (userId, res) => {
    const token = jsonwebtoken.sign({ userId }, process.env.JWT_TOKEN, {
        expiresIn: '30d',
    });
    if (res) {
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,       // MUST be true for cross-domain cookies
            sameSite: 'none',   // MUST be 'none' when frontend and backend are on different domains
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days — matches JWT expiry
        });
    }
    return token;
};
export default generateToken;