const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, '../data/ipoData.json');

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return { ipos: [] };
  }
};

// Helper function to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// GET all IPOs (with subscription & GMP)
const getAllIPOs = (req, res) => {
  try {
    const data = readData();
    
    // Add real-time data (in production, fetch from live sources)
    const iposWithLiveData = data.ipos.map(ipo => ({
      ...ipo,
      subscription: ipo.subscription || {
        retail: Math.random() * 5 + 0.5, // 0.5x - 5.5x
        hni: Math.random() * 10 + 1,
        qib: Math.random() * 3 + 0.8,
        total: Math.random() * 6 + 1
      },
      gmp: ipo.gmp || {
        price: Math.floor(Math.random() * 100) + 10,
        percentage: Math.floor(Math.random() * 50) + 5,
        lastUpdated: new Date().toISOString()
      }
    }));
    
    res.status(200).json({
      success: true,
      count: iposWithLiveData.length,
      data: iposWithLiveData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IPOs',
      message: error.message
    });
  }
};

// GET IPO by ID (with subscription & GMP)
const getIPOById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    const ipo = data.ipos.find(item => item.id === id);
    
    if (!ipo) {
      return res.status(404).json({
        success: false,
        error: 'IPO not found'
      });
    }
    
    // Add live subscription data
    const ipoWithLiveData = {
      ...ipo,
      subscription: ipo.subscription || {
        retail: (Math.random() * 5 + 0.5).toFixed(2),
        hni: (Math.random() * 10 + 1).toFixed(2),
        qib: (Math.random() * 3 + 0.8).toFixed(2),
        total: (Math.random() * 6 + 1).toFixed(2),
        lastUpdated: new Date().toISOString()
      },
      gmp: ipo.gmp || {
        price: Math.floor(Math.random() * 100) + 10,
        percentage: Math.floor(Math.random() * 50) + 5,
        estimatedListing: null,
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.status(200).json({
      success: true,
      data: ipoWithLiveData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch IPO details',
      message: error.message
    });
  }
};

// POST - Add new IPO
const addIPO = (req, res) => {
  try {
    const { 
      name, openDate, closeDate, priceBand, lotSize, faceValue, 
      description, type, category, logoUrl, issueSize, freshIssue, 
      offerForSale, listingDate, exchange, companyInfo 
    } = req.body;
    
    // Validation
    if (!name || !openDate || !closeDate || !priceBand || !lotSize || !faceValue) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }
    
    const data = readData();
    
    // Generate new ID
    const newId = data.ipos.length > 0 
      ? Math.max(...data.ipos.map(ipo => ipo.id)) + 1 
      : 1;
    
    const newIPO = {
      id: newId,
      name,
      type: type || 'mainboard',
      category: category || 'General',
      openDate,
      closeDate,
      priceBand,
      lotSize: parseInt(lotSize),
      faceValue,
      logoUrl: logoUrl || 'assets/img/abc.png',
      description: description || 'No description available',
      issueSize: issueSize || 'N/A',
      freshIssue: freshIssue || 'N/A',
      offerForSale: offerForSale || 'N/A',
      listingDate: listingDate || null,
      exchange: exchange || 'NSE, BSE',
      companyInfo: companyInfo || description || 'No company info available',
      subscription: {
        retail: 0,
        hni: 0,
        qib: 0,
        total: 0
      },
      gmp: {
        price: 0,
        percentage: 0,
        lastUpdated: new Date().toISOString()
      }
    };
    
    data.ipos.push(newIPO);
    
    if (writeData(data)) {
      res.status(201).json({
        success: true,
        message: 'IPO added successfully',
        data: newIPO
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to save IPO'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add IPO',
      message: error.message
    });
  }
};

// PUT - Update IPO
const updateIPO = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const data = readData();
    const ipoIndex = data.ipos.findIndex(item => item.id === id);
    
    if (ipoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'IPO not found'
      });
    }
    
    // Update IPO
    data.ipos[ipoIndex] = {
      ...data.ipos[ipoIndex],
      ...updates,
      id: id // Ensure ID doesn't change
    };
    
    if (writeData(data)) {
      res.status(200).json({
        success: true,
        message: 'IPO updated successfully',
        data: data.ipos[ipoIndex]
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update IPO'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update IPO',
      message: error.message
    });
  }
};

// DELETE - Delete IPO
const deleteIPO = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    const ipoIndex = data.ipos.findIndex(item => item.id === id);
    
    if (ipoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'IPO not found'
      });
    }
    
    const deletedIPO = data.ipos.splice(ipoIndex, 1)[0];
    
    if (writeData(data)) {
      res.status(200).json({
        success: true,
        message: 'IPO deleted successfully',
        data: deletedIPO
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete IPO'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete IPO',
      message: error.message
    });
  }
};

// Get live subscription status
const getSubscriptionStatus = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = readData();
    const ipo = data.ipos.find(item => item.id === id);
    
    if (!ipo) {
      return res.status(404).json({
        success: false,
        error: 'IPO not found'
      });
    }
    
    // Simulate live subscription data
    const subscriptionData = {
      retail: (Math.random() * 5 + 0.5).toFixed(2),
      hni: (Math.random() * 10 + 1).toFixed(2),
      qib: (Math.random() * 3 + 0.8).toFixed(2),
      total: (Math.random() * 6 + 1).toFixed(2),
      lastUpdated: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      ipoName: ipo.name,
      subscription: subscriptionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription status',
      message: error.message
    });
  }
};

module.exports = {
  getAllIPOs,
  getIPOById,
  addIPO,
  updateIPO,
  deleteIPO,
  getSubscriptionStatus
};