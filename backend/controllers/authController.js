const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper: Read users from file
const readUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, JSON.stringify({ users: [] }, null, 2));
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return { users: [] };
  }
};

// Helper: Write users to file
const writeUsers = (data) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
};

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, phone, panCard } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }
    
    const data = readUsers();
    
    // Check if user already exists
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      panCard: panCard || '',
      bankAccount: null,
      upiId: null,
      appliedIPOs: [],
      createdAt: new Date().toISOString()
    };
    
    data.users.push(newUser);
    
    if (writeUsers(data)) {
      // Generate token
      const token = generateToken(newUser);
      
      // Remove password from response
      const userResponse = { ...newUser };
      delete userResponse.password;
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userResponse
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to register user'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    const data = readUsers();
    
    // Find user
    const user = data.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const data = readUsers();
    const user = data.users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Remove password
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, panCard, bankAccount, upiId } = req.body;
    
    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user data
    if (name) data.users[userIndex].name = name;
    if (phone) data.users[userIndex].phone = phone;
    if (panCard) data.users[userIndex].panCard = panCard;
    if (bankAccount) data.users[userIndex].bankAccount = bankAccount;
    if (upiId) data.users[userIndex].upiId = upiId;
    
    if (writeUsers(data)) {
      const userResponse = { ...data.users[userIndex] };
      delete userResponse.password;
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: userResponse
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Update failed',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};