const mongoose = require('mongoose');

const auditEventSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Garbage Collection',
      'Road Damage',
      'Street Light',
      'Water Leakage',
      'Drainage Issue',
      'Public Health',
      'Government School Issue',
      'Government Hospital Issue',
      'Encroachment',
      'Other'
    ],
    required: true,
  },
  images: [{
    type: String, // Cloudinary URLs or base64 data
  }],
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
    default: 'Submitted',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  department: {
    type: String,
    default: 'Greater Chennai Corporation',
  },
  responsibleAuthority: {
    type: String,
    default: 'Ward Councillor',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  affectedCount: {
    type: Number,
    default: 1,
  },
  affectedCitizens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  escalationPath: [{
    type: String, // e.g., ["Ward Councillor", "Zonal Officer", "Mayor", "Commissioner"]
  }],
  aiAnalysis: {
    category: String,
    priority: String,
    department: String,
    authority: String,
    escalationPath: [String],
    summary: String,
    translations: {
      titleTa: String,
      descTa: String,
      titleEn: String,
      descEn: String,
    }
  },
  auditTrail: [auditEventSchema],
}, {
  timestamps: true,
});

complaintSchema.index({ citizen: 1 });
complaintSchema.index({ status: 1 });

// Auto-generate Complaint ID on save (NC-YYYY-100XX)
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintId = `NC-${year}-${10000 + count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
