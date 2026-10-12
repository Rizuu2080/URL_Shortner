const {v4:uuidv4} = require('uuid')
const user = require('../models/user');
const { setUser } = require('../services/auth');

async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const newUser = new user({ name, email, password });
    await newUser.save();
    res.status(201).redirect('/login');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ email, password });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = setUser(existingUser);
    res.cookie('sessionId', token, { httpOnly: true });
    res.status(200).redirect('/test');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
module.exports = { createUser, loginUser };