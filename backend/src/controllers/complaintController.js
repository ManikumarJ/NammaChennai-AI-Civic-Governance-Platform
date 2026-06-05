const Complaint = require('../models/Complaint');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { analyzeComplaint, fallbackAnalysis } = require('../services/geminiService');
const { sendStatusChangeEmail } = require('../services/mailService');

// Create complaint (incorporating Gemini analysis)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, images, location, anonymous, force } = req.body;

    if (!title || !description || !location || !location.lat || !location.lng || !location.address) {
      return res.status(400).json({ message: 'Title, description and location coordinates are required.' });
    }

    // Run quick local heuristics analysis for instant initial routing and duplicate checks
    const initialAnalysis = fallbackAnalysis(title, description);
    const targetCategory = initialAnalysis.category || category || 'Other';

    // Check for similar unresolved duplicate complaints nearby (within ~150 meters)
    if (!force) {
      const duplicateWindow = 0.0015; // roughly 150 meters
      
      const duplicate = await Complaint.findOne({
        category: targetCategory,
        status: { $in: ['Submitted', 'Assigned', 'In Progress', 'Escalated'] },
        'location.lat': { $gte: parseFloat(location.lat) - duplicateWindow, $lte: parseFloat(location.lat) + duplicateWindow },
        'location.lng': { $gte: parseFloat(location.lng) - duplicateWindow, $lte: parseFloat(location.lng) + duplicateWindow }
      });

      if (duplicate) {
        return res.status(409).json({
          message: `A similar unresolved ${targetCategory.toLowerCase()} grievance has already been reported nearby (${duplicate.complaintId}).`,
          duplicate
        });
      }
    }

    // Initial audit trail
    const auditTrail = [{
      status: 'Submitted',
      note: 'Complaint has been successfully submitted and is being analyzed by the Namma Chennai AI engine in the background.',
      timestamp: new Date()
    }];

    // Create complaint immediately with initial metadata
    const complaint = await Complaint.create({
      title,
      description,
      category: targetCategory,
      images: images || [],
      location,
      anonymous: anonymous || false,
      status: 'Submitted',
      priority: initialAnalysis.priority || 'Medium',
      department: initialAnalysis.department || 'Greater Chennai Corporation',
      responsibleAuthority: initialAnalysis.authority || 'Ward Councillor',
      escalationPath: initialAnalysis.escalationPath || ['Ward Councillor', 'Zonal Officer', 'Mayor', 'Corporation Commissioner'],
      aiAnalysis: initialAnalysis,
      citizen: req.user.id,
      auditTrail,
    });

    // Notify Ward Councillor for this ward (if any exists in DB)
    const wardNumber = req.user.ward;
    const io = req.app.get('io');
    if (wardNumber) {
      const councillor = await User.findOne({ role: 'Ward Councillor', ward: wardNumber });
      if (councillor) {
        const notification = await Notification.create({
          user: councillor._id,
          message: `New complaint ${complaint.complaintId} submitted in your ward: "${title}"`,
          type: 'general',
          complaint: complaint._id
        });
        if (io) {
          io.to(councillor._id.toString()).emit('new_notification', notification);
        }
      }
    }

    // Respond immediately to citizen client (Virtual zero loading time!)
    res.status(201).json(complaint);

    // Run remote Gemini AI analysis asynchronously in the background
    analyzeComplaint(title, description).then(async (aiAnalysisRefined) => {
      try {
        const updated = await Complaint.findById(complaint._id);
        if (updated) {
          updated.category = aiAnalysisRefined.category || updated.category;
          updated.priority = aiAnalysisRefined.priority || updated.priority;
          updated.department = aiAnalysisRefined.department || updated.department;
          updated.responsibleAuthority = aiAnalysisRefined.authority || updated.responsibleAuthority;
          updated.escalationPath = aiAnalysisRefined.escalationPath || updated.escalationPath;
          updated.aiAnalysis = aiAnalysisRefined;
          if (updated.auditTrail && updated.auditTrail[0]) {
            updated.auditTrail[0].note = 'Complaint has been successfully submitted and analyzed by the Namma Chennai AI engine.';
          }
          await updated.save();
          
          if (io) {
            // Broadcast the update to refresh dashboards/feeds in real-time
            io.emit('complaint_updated', updated);
          }
        }
      } catch (bgErr) {
        console.error('Background Gemini update error:', bgErr.message);
      }
    }).catch(bgErr => {
      console.error('Background Gemini analysis process error:', bgErr.message);
    });

  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({ message: 'Server error creating complaint' });
  }
};

// Get complaints (public feed with filtering)
exports.getComplaints = async (req, res) => {
  try {
    const { category, status, ward, zone, constituency, search, myComplaints } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    // Filter by location
    if (ward) query['location.ward'] = parseInt(ward); // or via user filter
    if (zone) query['location.zone'] = parseInt(zone);

    // If matching my complaints
    if (myComplaints === 'true' && req.user) {
      query.citizen = req.user.id;
    }

    // Keyword search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
        { 'aiAnalysis.summary': { $regex: search, $options: 'i' } }
      ];
    }

    // Let's support Ward, Zone, and Assembly constituencies based on reporting user locations
    if (ward || zone || constituency) {
      // Find users matching ward/zone/constituency to filter complaints if location object doesn't have them nested
      // To make it simple, we can filter using a helper or match the citizen's ward/zone/constituency
      const matchUsers = {};
      if (ward) matchUsers.ward = parseInt(ward);
      if (zone) matchUsers.zone = parseInt(zone);
      if (constituency) matchUsers.assemblyConstituency = constituency;

      const users = await User.find(matchUsers).select('_id');
      const userIds = users.map(u => u._id);
      
      // If we filtered by citizen location:
      query.citizen = { $in: userIds };
      // Note: If myComplaints was also specified, it will intersect correctly
      if (myComplaints === 'true' && req.user) {
        query.citizen = req.user.id;
      }
    }

    const complaints = await Complaint.find(query)
      .populate('citizen', 'name ward zone area role')
      .populate('assignedTo', 'name role')
      .sort({ createdAt: -1 });

    // Sanitize anonymous complaints
    const sanitized = complaints.map(c => {
      const plain = c.toObject();
      if (plain.anonymous && plain.citizen) {
        plain.citizen = { 
          name: 'Anonymous Citizen', 
          role: 'Citizen',
          ward: plain.citizen.ward,
          zone: plain.citizen.zone,
          area: plain.citizen.area,
          assemblyConstituency: plain.citizen.assemblyConstituency
        };
      }
      return plain;
    });

    res.json(sanitized);
  } catch (error) {
    console.error('Get complaints error:', error.message);
    res.status(500).json({ message: 'Server error retrieving complaints' });
  }
};

// Get single complaint details
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizen', 'name email phone ward zone area assemblyConstituency role')
      .populate('assignedTo', 'name role phone')
      .populate({
        path: 'auditTrail.updatedBy',
        select: 'name role'
      });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Fetch comments
    const comments = await Comment.find({ complaint: complaint._id })
      .populate('user', 'name role')
      .sort({ createdAt: 1 });

    const plain = complaint.toObject();
    if (plain.anonymous && plain.citizen) {
      plain.citizen = { 
        name: 'Anonymous Citizen', 
        role: 'Citizen',
        ward: plain.citizen.ward,
        zone: plain.citizen.zone,
        area: plain.citizen.area,
        assemblyConstituency: plain.citizen.assemblyConstituency
      };
    }

    res.json({ complaint: plain, comments });
  } catch (error) {
    console.error('Get complaint detail error:', error.message);
    res.status(500).json({ message: 'Server error retrieving complaint details' });
  }
};

// Update status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, note, image } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('citizen');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Save status change
    complaint.status = status;
    
    // If status is Resolved and a completion image is uploaded
    if (status === 'Resolved' && image) {
      complaint.images.push(image);
    }

    // Append to audit trail
    complaint.auditTrail.push({
      status,
      note: note || `Complaint status updated to ${status} by ${req.user.role} ${req.user.name}.`,
      updatedBy: req.user._id,
      timestamp: new Date()
    });

    // Assigning to the official who is updating if currently unassigned
    if (!complaint.assignedTo && ['Assigned', 'In Progress'].includes(status)) {
      complaint.assignedTo = req.user._id;
    }

    await complaint.save();

    // Notify reporting Citizen (even if anonymous, we send an email in background)
    if (complaint.citizen && complaint.citizen.email) {
      sendStatusChangeEmail(
        complaint.citizen.email,
        complaint.citizen.name,
        complaint.complaintId,
        complaint.title,
        status,
        note
      ).catch(console.error);

      // Create in-app notification for Citizen
      const notification = await Notification.create({
        user: complaint.citizen._id,
        message: `Your complaint ${complaint.complaintId} status is updated to "${status}".`,
        type: 'status_change',
        complaint: complaint._id
      });

      const io = req.app.get('io');
      if (io) {
        io.to(complaint.citizen._id.toString()).emit('new_notification', notification);
      }
    }

    res.json(complaint);
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ message: 'Server error updating status' });
  }
};

// Add Support Count: "I Am Also Affected"
exports.affectedIncrement = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user already added
    if (complaint.affectedCitizens.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already reported being affected by this issue.' });
    }

    complaint.affectedCitizens.push(req.user.id);
    complaint.affectedCount = complaint.affectedCitizens.length + 1;
    await complaint.save();

    res.json({
      affectedCount: complaint.affectedCount,
      message: 'Thank you. Your support has been added to this complaint to prioritize resolution.'
    });
  } catch (error) {
    console.error('Affected vote error:', error.message);
    res.status(500).json({ message: 'Server error register support' });
  }
};

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const complaint = await Complaint.findById(req.params.id).populate('citizen');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isOfficial = req.user.role !== 'Citizen';

    const comment = await Comment.create({
      complaint: complaint._id,
      user: req.user._id,
      text,
      isOfficial
    });

    // Notify citizens or higher officials if comments are made by other roles
    const io = req.app.get('io');
    if (isOfficial) {
      // Add official comment note to audit trail if needed, or simply record notification
      const notification = await Notification.create({
        user: complaint.citizen._id,
        message: `Official ${req.user.name} (${req.user.role}) commented on your complaint: "${text.substring(0, 30)}..."`,
        type: 'comment',
        complaint: complaint._id
      });
      
      if (io) {
        io.to(complaint.citizen._id.toString()).emit('new_notification', notification);
      }
    } else {
      // Citizen commented, notify assigned official if any
      if (complaint.assignedTo) {
        const notification = await Notification.create({
          user: complaint.assignedTo,
          message: `Citizen commented on complaint ${complaint.complaintId}: "${text.substring(0, 30)}..."`,
          type: 'comment',
          complaint: complaint._id
        });
        if (io) {
          io.to(complaint.assignedTo.toString()).emit('new_notification', notification);
        }
      }
    }

    // Populate user info for frontend response
    const populated = await comment.populate('user', 'name role');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Add comment error:', error.message);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};
