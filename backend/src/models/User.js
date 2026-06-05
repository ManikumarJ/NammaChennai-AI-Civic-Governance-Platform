const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [
      'Citizen',
      'Ward Councillor',
      'MLA',
      'Zonal Officer',
      'Mayor',
      'Corporation Commissioner',
      'Super Admin'
    ],
    default: 'Citizen',
  },
  area: {
    type: String,
    required: function() { return this.role === 'Citizen'; } // area is needed for local dashboard
  },
  ward: {
    type: Number,
    required: function() { return this.role === 'Citizen' || this.role === 'Ward Councillor'; }
  },
  zone: {
    type: Number,
    required: function() { return this.role === 'Citizen' || this.role === 'Ward Councillor' || this.role === 'Zonal Officer'; }
  },
  assemblyConstituency: {
    type: String,
    required: function() { return this.role === 'Citizen' || this.role === 'MLA'; }
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

// Pre-save middleware to hash passwords
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
