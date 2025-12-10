const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');
const applicationsFilePath = path.join(__dirname, '../data/applications.json');
const ipoFilePath = path.join(__dirname, '../data/ipoData.json');

// Helper: Read users
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

// Helper: Write users
const writeUsers = (data) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
};

// Helper: Read applications
const readApplications = () => {
  try {
    if (!fs.existsSync(applicationsFilePath)) {
      return { applications: [] };
    }
    const data = fs.readFileSync(applicationsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { applications: [] };
  }
};

// Helper: Read IPOs
const readIPOs = () => {
  try {
    const data = fs.readFileSync(ipoFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { ipos: [] };
  }
};

// Get user dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const usersData = readUsers();
    const user = usersData.users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const applicationsData = readApplications();
    const userApplications = applicationsData.applications.filter(
      app => app.userId === userId
    );
    
    // Get IPO details for each application
    const ipoData = readIPOs();
    const applicationsWithDetails = userApplications.map(app => {
      const ipo = ipoData.ipos.find(i => i.id === app.ipoId);
      return {
        ...app,
        ipoDetails: ipo ? {
          name: ipo.name,
          openDate: ipo.openDate,
          closeDate: ipo.closeDate,
          listingDate: ipo.listingDate,
          type: ipo.type
        } : null
      };
    });
    
    // Calculate statistics
    const stats = {
      totalApplications: userApplications.length,
      pendingApplications: userApplications.filter(app => app.status === 'pending').length,
      approvedApplications: userApplications.filter(app => app.status === 'approved').length,
      allottedApplications: userApplications.filter(app => app.allotmentStatus === 'full' || app.allotmentStatus === 'partial').length,
      totalInvested: userApplications.reduce((sum, app) => sum + (app.totalAmount || 0), 0),
      totalSharesAllotted: userApplications.reduce((sum, app) => sum + (app.sharesAllotted || 0), 0)
    };
    
    // Remove password from user object
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      user: userResponse,
      applications: applicationsWithDetails,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard',
      message: error.message
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applicationsData = readApplications();
    const userApplications = applicationsData.applications.filter(
      app => app.userId === userId
    );
    
    const stats = {
      totalApplications: userApplications.length,
      pendingApplications: userApplications.filter(app => app.status === 'pending').length,
      approvedApplications: userApplications.filter(app => app.status === 'approved').length,
      rejectedApplications: userApplications.filter(app => app.status === 'rejected').length,
      allottedFull: userApplications.filter(app => app.allotmentStatus === 'full').length,
      allottedPartial: userApplications.filter(app => app.allotmentStatus === 'partial').length,
      notAllotted: userApplications.filter(app => app.allotmentStatus === 'not_allotted').length,
      totalInvested: userApplications.reduce((sum, app) => sum + (app.totalAmount || 0), 0),
      totalSharesApplied: userApplications.reduce((sum, app) => sum + (app.quantity || 0), 0),
      totalSharesAllotted: userApplications.reduce((sum, app) => sum + (app.sharesAllotted || 0), 0),
      successRate: userApplications.length > 0 
        ? ((userApplications.filter(app => app.sharesAllotted > 0).length / userApplications.length) * 100).toFixed(2)
        : 0
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
};

// Get user's applied IPOs list
const getAppliedIPOs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const applicationsData = readApplications();
    const userApplications = applicationsData.applications.filter(
      app => app.userId === userId
    );
    
    const ipoData = readIPOs();
    
    // Get unique IPOs user has applied to
    const appliedIPOs = userApplications.map(app => {
      const ipo = ipoData.ipos.find(i => i.id === app.ipoId);
      return {
        applicationId: app.id,
        applicationNumber: app.applicationNumber,
        ipoId: app.ipoId,
        ipoName: app.ipoName,
        category: app.category,
        quantity: app.quantity,
        bidPrice: app.bidPrice,
        totalAmount: app.totalAmount,
        status: app.status,
        allotmentStatus: app.allotmentStatus,
        sharesAllotted: app.sharesAllotted,
        appliedAt: app.appliedAt,
        ipoDetails: ipo
      };
    });
    
    res.status(200).json({
      success: true,
      count: appliedIPOs.length,
      appliedIPOs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applied IPOs',
      message: error.message
    });
  }
};

// Add bank account details
const addBankAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountNumber, ifscCode, bankName, accountHolderName } = req.body;
    
    if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
      return res.status(400).json({
        success: false,
        error: 'All bank details are required'
      });
    }
    
    const usersData = readUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    usersData.users[userIndex].bankAccount = {
      accountNumber,
      ifscCode,
      bankName,
      accountHolderName,
      addedAt: new Date().toISOString()
    };
    
    if (writeUsers(usersData)) {
      const userResponse = { ...usersData.users[userIndex] };
      delete userResponse.password;
      
      res.status(200).json({
        success: true,
        message: 'Bank account added successfully',
        user: userResponse
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add bank account'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add bank account',
      message: error.message
    });
  }
};

// Add UPI ID
const addUPIId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { upiId } = req.body;
    
    if (!upiId) {
      return res.status(400).json({
        success: false,
        error: 'UPI ID is required'
      });
    }
    
    // Basic UPI ID validation
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid UPI ID format'
      });
    }
    
    const usersData = readUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    usersData.users[userIndex].upiId = upiId;
    
    if (writeUsers(usersData)) {
      const userResponse = { ...usersData.users[userIndex] };
      delete userResponse.password;
      
      res.status(200).json({
        success: true,
        message: 'UPI ID added successfully',
        user: userResponse
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add UPI ID'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add UPI ID',
      message: error.message
    });
  }
};

// Add Demat account details
const addDematAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dpId, clientId, depositoryName } = req.body;
    
    if (!dpId || !clientId || !depositoryName) {
      return res.status(400).json({
        success: false,
        error: 'All Demat details are required'
      });
    }
    
    const usersData = readUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    usersData.users[userIndex].dematAccount = {
      dpId,
      clientId,
      depositoryName, // NSDL / CDSL
      addedAt: new Date().toISOString()
    };
    
    if (writeUsers(usersData)) {
      const userResponse = { ...usersData.users[userIndex] };
      delete userResponse.password;
      
      res.status(200).json({
        success: true,
        message: 'Demat account added successfully',
        user: userResponse
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add Demat account'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add Demat account',
      message: error.message
    });
  }
};

// Get user notifications/alerts
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real application, you'd store notifications in database
    // For now, we'll generate based on user's applications
    const applicationsData = readApplications();
    const userApplications = applicationsData.applications.filter(
      app => app.userId === userId
    );
    
    const ipoData = readIPOs();
    const notifications = [];
    
    // Check for pending applications
    const pendingApps = userApplications.filter(app => app.status === 'pending');
    if (pendingApps.length > 0) {
      notifications.push({
        id: 1,
        type: 'info',
        title: 'Pending Applications',
        message: `You have ${pendingApps.length} pending IPO application(s)`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }
    
    // Check for recently allotted
    const recentlyAllotted = userApplications.filter(
      app => app.allotmentStatus && app.sharesAllotted > 0
    );
    recentlyAllotted.forEach((app, index) => {
      notifications.push({
        id: index + 2,
        type: 'success',
        title: 'IPO Allotment',
        message: `Congratulations! You've been allotted ${app.sharesAllotted} shares in ${app.ipoName}`,
        timestamp: new Date().toISOString(),
        read: false
      });
    });
    
    // Check for upcoming IPO closing dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const closingSoon = ipoData.ipos.filter(ipo => {
      const closeDate = new Date(ipo.closeDate);
      closeDate.setHours(0, 0, 0, 0);
      const daysUntilClose = Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilClose >= 0 && daysUntilClose <= 2;
    });
    
    closingSoon.forEach((ipo, index) => {
      notifications.push({
        id: index + 100,
        type: 'warning',
        title: 'IPO Closing Soon',
        message: `${ipo.name} IPO is closing soon on ${new Date(ipo.closeDate).toLocaleDateString('en-IN')}`,
        timestamp: new Date().toISOString(),
        read: false
      });
    });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      message: error.message
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const usersData = readUsers();
    const userIndex = usersData.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Remove user
    usersData.users.splice(userIndex, 1);
    
    if (writeUsers(usersData)) {
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete account'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      message: error.message
    });
  }
};

module.exports = {
  getDashboard,
  getUserStats,
  getAppliedIPOs,
  addBankAccount,
  addUPIId,
  addDematAccount,
  getNotifications,
  deleteAccount
};