const nodemailer = require('nodemailer');

// Email configuration (use environment variables in production)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Send application confirmation email
const sendApplicationConfirmation = async (userEmail, application, ipo) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `IPO Application Confirmation - ${ipo.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">IPO Application Confirmed! ✅</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px; color: #333;">Dear Investor,</p>
            <p style="font-size: 16px; color: #333;">
              Your application for <strong>${ipo.name}</strong> has been successfully submitted.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #667eea; margin-top: 0;">Application Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #6b7280;">Application Number:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${application.applicationNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #6b7280;">IPO Name:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${ipo.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #6b7280;">Category:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${application.category}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #6b7280;">Bid Price:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">₹${application.bidPrice}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 0; color: #6b7280;">Quantity:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">${application.quantity} shares</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Total Amount:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #667eea; font-size: 18px;">₹${application.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> Please ensure sufficient funds are available in your bank account/UPI for payment.</p>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 10px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af;"><strong>📅 Next Steps:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af;">
                <li>Wait for allotment results (usually 5-7 days after IPO closes)</li>
                <li>Check allotment status on our platform</li>
                <li>Shares will be credited to your Demat account if allotted</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              You can track your application status anytime on our dashboard.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5000/dashboard.html" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 IPO Tracker. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

// Send IPO opening notification
const sendIPOOpeningNotification = async (userEmail, ipo) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: `🔔 IPO Alert: ${ipo.name} is Now Open!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔔 IPO Now Open!</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 18px; color: #333; font-weight: bold;">
              ${ipo.name} IPO is now open for subscription!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">IPO Details</h3>
              <p><strong>Price Band:</strong> ${ipo.priceBand}</p>
              <p><strong>Lot Size:</strong> ${ipo.lotSize} shares</p>
              <p><strong>Issue Size:</strong> ${ipo.issueSize}</p>
              <p><strong>Closes On:</strong> ${new Date(ipo.closeDate).toLocaleDateString('en-IN')}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5000/ipo-detail.html?id=${ipo.id}" 
                 style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Apply Now
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 IPO Tracker. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ IPO opening notification sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

// Send allotment notification
const sendAllotmentNotification = async (userEmail, application, ipo) => {
  try {
    const isAllotted = application.sharesAllotted > 0;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: isAllotted 
        ? `🎉 Congratulations! ${ipo.name} IPO Allotment`
        : `${ipo.name} IPO Allotment Status`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${isAllotted ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">
              ${isAllotted ? '🎉 Congratulations!' : '📋 Allotment Status'}
            </h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p style="font-size: 16px; color: #333;">
              ${isAllotted 
                ? `Great news! You have been allotted shares in ${ipo.name} IPO.`
                : `Unfortunately, you were not allotted shares in ${ipo.name} IPO this time.`
              }
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: ${isAllotted ? '#10b981' : '#ef4444'}; margin-top: 0;">Allotment Details</h3>
              <p><strong>Application Number:</strong> ${application.applicationNumber}</p>
              <p><strong>Applied Shares:</strong> ${application.quantity}</p>
              <p><strong>Allotted Shares:</strong> ${application.sharesAllotted}</p>
              <p><strong>Status:</strong> ${application.allotmentStatus.toUpperCase()}</p>
            </div>
            
            ${isAllotted ? `
              <div style="background: #d1fae5; padding: 15px; border-radius: 10px; border-left: 4px solid #10b981; margin: 20px 0;">
                <p style="margin: 0; color: #065f46;">
                  <strong>✓ Next Steps:</strong><br>
                  Shares will be credited to your Demat account within 2-3 working days.
                </p>
              </div>
            ` : `
              <div style="background: #fee2e2; padding: 15px; border-radius: 10px; border-left: 4px solid #ef4444; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b;">
                  Your refund will be processed within 5-7 working days.
                </p>
              </div>
            `}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5000/dashboard.html" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                View Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 14px;">
              © 2024 IPO Tracker. All rights reserved.
            </p>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Allotment notification sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
};

module.exports = {
  sendApplicationConfirmation,
  sendIPOOpeningNotification,
  sendAllotmentNotification
};