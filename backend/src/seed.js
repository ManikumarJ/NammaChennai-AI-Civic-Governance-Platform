require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');

const connectDB = async () => {
  const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/namma-chennai';
  await mongoose.connect(connString);
  console.log('MongoDB Connected for Seeding...');
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});

    console.log('Database cleared.');

    // 1. Create Officials & Citizens
    // We will use standard passwords that we hash in save middleware
    const usersData = [
      {
        name: 'Dr. G. S. Sameeran, IAS',
        email: 'commissioner@chennai.gov.in',
        phone: '044-25384510',
        password: 'password123',
        role: 'Corporation Commissioner',
        emailVerified: true,
      },
      {
        name: 'Tmt. R. Priya',
        email: 'mayor@chennai.gov.in',
        phone: '044-25381130',
        password: 'password123',
        role: 'Mayor',
        emailVerified: true,
      },
      {
        name: 'R. Sabarinathan',
        email: 'mla.virugambakkam@tn.gov.in',
        phone: '9840012345',
        password: 'password123',
        role: 'MLA',
        assemblyConstituency: 'Virugambakkam',
        emailVerified: true,
      },
      {
        name: 'R. Kumar',
        email: 'zonal10@chennai.gov.in',
        phone: '9840054321',
        password: 'password123',
        role: 'Zonal Officer',
        zone: 10,
        emailVerified: true,
      },
      {
        name: 'K. Kannan',
        email: 'councillor138@chennai.gov.in',
        phone: '9840099887',
        password: 'password123',
        role: 'Ward Councillor',
        ward: 138,
        zone: 10,
        emailVerified: true,
      },
      {
        name: 'Manikumar J',
        email: 'manikumar@gmail.com',
        phone: '9876543210',
        password: 'password123',
        role: 'Citizen',
        area: 'KK Nagar',
        ward: 138,
        zone: 10,
        assemblyConstituency: 'Virugambakkam',
        emailVerified: true,
      },
      {
        name: 'Priya Narayanan',
        email: 'priya.n@gmail.com',
        phone: '9876543211',
        password: 'password123',
        role: 'Citizen',
        area: 'T. Nagar',
        ward: 130,
        zone: 10,
        assemblyConstituency: 'T. Nagar',
        emailVerified: true,
      },
      {
        name: 'Suresh Kumar',
        email: 'suresh@gmail.com',
        phone: '9876543212',
        password: 'password123',
        role: 'Citizen',
        area: 'Adyar',
        ward: 175,
        zone: 13,
        assemblyConstituency: 'Velachery',
        emailVerified: true,
      }
    ];

    const users = [];
    for (const u of usersData) {
      const newUser = new User(u);
      await newUser.save();
      users.push(newUser);
    }
    console.log(`${users.length} Users seeded.`);

    console.log('Database Seeding Successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

connectDB().then(seedData);
