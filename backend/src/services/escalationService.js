const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEscalationEmail } = require('./mailService');

const runEscalationCheck = async (io) => {
  console.log('Running scheduled AI Auto-Escalation check...');

  try {
    // Find complaints that are not resolved or closed
    const activeComplaints = await Complaint.find({
      status: { $nin: ['Resolved', 'Closed'] }
    }).populate('citizen');

    const now = new Date();

    for (const complaint of activeComplaints) {
      // Find the last action timestamp
      const lastAction = complaint.auditTrail.length > 0 
        ? complaint.auditTrail[complaint.auditTrail.length - 1].timestamp 
        : complaint.createdAt;

      const diffTime = Math.abs(now - new Date(lastAction));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let shouldEscalate = false;
      let newAuthority = '';
      let remainingDays = 0;

      // Escalation rules:
      // No action for 30 days -> Commissioner
      // No action for 15 days -> Mayor
      // No action for 7 days -> Zonal Officer
      if (diffDays >= 30 && complaint.responsibleAuthority !== 'Corporation Commissioner') {
        shouldEscalate = true;
        newAuthority = 'Corporation Commissioner';
      } else if (diffDays >= 15 && !['Mayor', 'Corporation Commissioner'].includes(complaint.responsibleAuthority)) {
        shouldEscalate = true;
        newAuthority = 'Mayor';
      } else if (diffDays >= 7 && !['Zonal Officer', 'Mayor', 'Corporation Commissioner'].includes(complaint.responsibleAuthority)) {
        shouldEscalate = true;
        newAuthority = 'Zonal Officer';
      }

      if (shouldEscalate) {
        console.log(`Auto-escalating Complaint ${complaint.complaintId} (unresolved for ${diffDays} days) to ${newAuthority}`);
        
        complaint.status = 'Escalated';
        complaint.responsibleAuthority = newAuthority;
        complaint.auditTrail.push({
          status: 'Escalated',
          note: `AI Auto-Escalation: Complaint unresolved for ${diffDays} days. Escalated authority to ${newAuthority}.`,
          timestamp: new Date()
        });

        await complaint.save();

        // Create Notifications
        // 1. Notify reporting citizen
        if (complaint.citizen) {
          const cNotify = await Notification.create({
            user: complaint.citizen._id,
            message: `Your complaint ${complaint.complaintId} has been escalated to the ${newAuthority} due to inactivity.`,
            type: 'escalation',
            complaint: complaint._id
          });
          if (io) {
            io.to(complaint.citizen._id.toString()).emit('new_notification', cNotify);
          }
        }

        // 2. Notify the newly escalated authority in DB
        let authorityUserQuery = { role: newAuthority };
        if (newAuthority === 'Zonal Officer' && complaint.citizen) {
          authorityUserQuery.zone = complaint.citizen.zone;
        }

        const authUsers = await User.find(authorityUserQuery);
        for (const user of authUsers) {
          const authNotify = await Notification.create({
            user: user._id,
            message: `URGENT escalation alert: Complaint ${complaint.complaintId} is now under your jurisdiction.`,
            type: 'escalation',
            complaint: complaint._id
          });

          if (io) {
            io.to(user._id.toString()).emit('new_notification', authNotify);
          }

          // Send escalation email
          sendEscalationEmail(user.email, user.name, complaint.complaintId, complaint.title, newAuthority, diffDays)
            .catch(console.error);
        }
      }
    }
  } catch (error) {
    console.error('Error during escalation scan:', error.message);
  }
};

// Scheduler setup (runs checking process on server start and sets 1-hour intervals)
const startEscalator = (io) => {
  // Check on boot
  setTimeout(() => runEscalationCheck(io), 5000);

  // Periodic interval (every 1 hour)
  setInterval(() => runEscalationCheck(io), 3600000);
};

module.exports = {
  startEscalator,
  runEscalationCheck
};
