const jsonwebtoken = require('jsonwebtoken');
const secretKey = 'Rizwan@123';

function setUser(user ) {
    return jsonwebtoken.sign({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }, secretKey);
}
function getUserBySessionId(token) {
    if (!token) {
        return null;
    }
    try {
        return jsonwebtoken.verify(token, secretKey);
    } catch (error) {
        return null;
    }
}

module.exports = { setUser, getUserBySessionId }; 