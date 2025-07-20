const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'defaultSecret';

function generateAccessToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, secret);
}

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateToken,
  verifyToken
};
