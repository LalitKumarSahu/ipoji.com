const fs = require('fs');
const path = require('path');
const { sendApplicationConfirmation } = require('../utils/email');

const applicationsFilePath = path.join(__dirname, '../data/applications.json');
const usersFilePath = path.join(__dirname, '../data/users.json');
const ipoFilePath = path.join(__dirname, '../data/ipoData.json');

// Helper: Read applications
const readApplications = () => {
  try {
    if (!fs.existsSync(applicationsFilePath)) {
      fs.writeFileSync(applicationsFilePath, JSON.stringify({ applications: [] }, null, 2));
    }
    const data = fs.readFileSync(applicationsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { applications: [] };
  }
};

// Helper: Write applications
const writeApplications = (data) => {
  try {
    fs.writeFileSync(applicationsFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
  }
};

// Helper: Read users
const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

// Helper: Write users
const writeUsers = (data) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    return false;
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

// Apply for IPO
const applyForIPO = async (req, res) => {
  try {
    const { 
      ipoId, 
      category, 
      bidPrice, 
      quantity, 
      panCard, 
      dpId, 
      clientId,
      upiId,
      bankAccount
    } = req.body;
    
    // Validation
    if (!ipoId || !category || !bidPrice || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    const ipoData = readIPOs();
    const ipo = ipoData.ipos.find(i => i.id === parseInt(ipoId));
    
    if (!ipo) {
      return res.status(404).json({
        success: false,
        error: 'IPO not found'
      });
    }
    
    const applicationsData = readApplications();
    
    // Check if user already applied
    const existingApplication = applicationsData.applications.find(
      app => app.userId === req.user.id && app.ipoId === parseInt(ipoId)
    );
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this IPO'
      });
    }
    
    // Generate application number
    const applicationNumber = `IPO${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Calculate total amount
    const totalAmount = bidPrice * quantity;
    
    // Create application
    const newApplication = {
      id: applicationsData.applications.length > 0 
        ? Math.max(...applicationsData.applications.map(a => a.id)) + 1 
        : 1,
      applicationNumber,
      userId: req.user.id,
      ipoId: parseInt(ipoId),
      ipoName: ipo.name,
      category, // Retail / HNI / QIB
      bidPrice,
      quantity,
      totalAmount,
      panCard,
      dpId,
      clientId,
      upiId,
      bankAccount,
      status: 'pending', // pending / approved / rejected / allotted
      allotmentStatus: null, // null / full / partial / not_allotted
      sharesAllotted: 0,
      appliedAt: new Date().toISOString(),
      paymentStatus: 'pending' // pending / completed / failed
    };
    
    applicationsData.applications.push(newApplication);
    
    if (writeApplications(applicationsData)) {
      // Update user's applied IPOs
      const usersData = readUsers();
      const userIndex = usersData.users.findIndex(u => u.id === req.user.id);
      
      if (userIndex !== -1) {
        if (!usersData.users[userIndex].appliedIPOs) {
          usersData.users[userIndex].appliedIPOs = [];
        }
        usersData.users[userIndex].appliedIPOs.push({
          ipoId: parseInt(ipoId),
          applicationNumber,
          appliedAt: new Date().toISOString()
        });
        writeUsers(usersData);
      }
      
      // Send email confirmation (async)
      sendApplicationConfirmation(req.user.email, newApplication, ipo).catch(err => {
        console.error('Email send error:', err);
      });
      
      res.status(201).json({
        success: true,
        message: 'IPO application submitted successfully',
        application: newApplication
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to submit application'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Application failed',
      message: error.message
    });
  }
};

// Get user's applications
const getUserApplications = async (req, res) => {
  try {
    const applicationsData = readApplications();
    const userApplications = applicationsData.applications.filter(
      app => app.userId === req.user.id
    );
    
    res.status(200).json({
      success: true,
      count: userApplications.length,
      applications: userApplications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
      message: error.message
    });
  }
};

// Get specific application details
const getApplicationById = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const applicationsData = readApplications();
    
    const application = applicationsData.applications.find(
      app => app.id === applicationId && app.userId === req.user.id
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application',
      message: error.message
    });
  }
};

// Check allotment status
const checkAllotmentStatus = async (req, res) => {
  try {
    const { panCard, applicationNumber } = req.body;
    
    if (!panCard || !applicationNumber) {
      return res.status(400).json({
        success: false,
        error: 'PAN Card and Application Number are required'
      });
    }
    
    const applicationsData = readApplications();
    const application = applicationsData.applications.find(
      app => app.applicationNumber === applicationNumber && 
             app.panCard.toUpperCase() === panCard.toUpperCase()
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found. Please check your details.'
      });
    }
    
    res.status(200).json({
      success: true,
      application: {
        applicationNumber: application.applicationNumber,
        ipoName: application.ipoName,
        category: application.category,
        quantity: application.quantity,
        bidPrice: application.bidPrice,
        status: application.status,
        allotmentStatus: application.allotmentStatus,
        sharesAllotted: application.sharesAllotted,
        appliedAt: application.appliedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check allotment status',
      message: error.message
    });
  }
};

// Update payment status (for demo - in production integrate payment gateway)
const updatePaymentStatus = async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { paymentStatus } = req.body;
    
    const applicationsData = readApplications();
    const appIndex = applicationsData.applications.findIndex(
      app => app.id === applicationId && app.userId === req.user.id
    );
    
    if (appIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }
    
    applicationsData.applications[appIndex].paymentStatus = paymentStatus;
    
    if (writeApplications(applicationsData)) {
      res.status(200).json({
        success: true,
        message: 'Payment status updated',
        application: applicationsData.applications[appIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update payment status'
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
  applyForIPO,
  getUserApplications,
  getApplicationById,
  checkAllotmentStatus,
  updatePaymentStatus
};