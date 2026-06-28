const Notification = require('../models/Notification');
const User = require('../models/User');

const notify = async ({ recipientUserId, title, message, type, link }) => {
  try {
    await Notification.create({
      recipient: recipientUserId,
      title,
      message,
      type: type || 'general',
      link: link || ''
    });
  } catch (err) {
    console.log('Notification error:', err.message);
  }
};

const notifyByEmployeeId = async ({ employeeId, title, message, type, link }) => {
  try {
    const user = await User.findOne({ employeeId });
    if (!user) return;
    await notify({ recipientUserId: user._id, title, message, type, link });
  } catch (err) {
    console.log('Notify by employee error:', err.message);
  }
};

const notifyAdmins = async ({ title, message, type, link }) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'hr', 'manager'] } });
    for (const admin of admins) {
      await notify({ recipientUserId: admin._id, title, message, type, link });
    }
  } catch (err) {
    console.log('Notify admins error:', err.message);
  }
};

module.exports = { notify, notifyByEmployeeId, notifyAdmins };