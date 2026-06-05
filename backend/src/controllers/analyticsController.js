const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Helper to compute stats from a list of complaints
const computeBasicStats = (complaints) => {
  let total = complaints.length;
  let pending = 0;
  let inProgress = 0;
  let resolved = 0;
  let escalated = 0;
  let closed = 0;
  let resolutionTimeSum = 0;
  let resolvedCountForTime = 0;

  complaints.forEach(c => {
    if (c.status === 'Submitted') pending++;
    else if (c.status === 'Assigned' || c.status === 'In Progress') inProgress++;
    else if (c.status === 'Resolved') resolved++;
    else if (c.status === 'Escalated') escalated++;
    else if (c.status === 'Closed') closed++;

    if (c.status === 'Resolved' || c.status === 'Closed') {
      const resolvedAt = c.auditTrail.find(a => ['Resolved', 'Closed'].includes(a.status))?.timestamp || c.updatedAt;
      const duration = (new Date(resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24); // in days
      resolutionTimeSum += duration;
      resolvedCountForTime++;
    }
  });

  const avgResolutionTime = resolvedCountForTime > 0 ? (resolutionTimeSum / resolvedCountForTime).toFixed(1) : 'N/A';
  const resolutionRate = total > 0 ? (((resolved + closed) / total) * 100).toFixed(0) : '0';

  return {
    total,
    pending: pending + escalated, // pending includes escalated in overview summaries
    inProgress,
    resolved: resolved + closed,
    avgResolutionTime,
    resolutionRate
  };
};

// Citizen Area Analytics
exports.getCitizenAnalytics = async (req, res) => {
  try {
    const area = req.user.area || 'KK Nagar';
    const ward = req.user.ward || 121;

    // Fetch complaints in this ward/area
    const areaComplaints = await Complaint.find({
      $or: [
        { 'location.address': { $regex: area, $options: 'i' } },
        { citizen: { $in: await User.find({ area }).select('_id') } }
      ]
    }).populate('citizen');

    const stats = computeBasicStats(areaComplaints);
    const recent = await Complaint.find({
      $or: [
        { 'location.address': { $regex: area, $options: 'i' } },
        { citizen: { $in: await User.find({ area }).select('_id') } }
      ]
    })
      .populate('citizen', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Distribution by category in citizen's area
    const categoryMap = {};
    areaComplaints.forEach(c => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });

    const categoryData = Object.keys(categoryMap).map(cat => ({
      name: cat,
      value: categoryMap[cat]
    }));

    res.json({
      areaName: area,
      wardNumber: ward,
      zoneNumber: req.user.zone || 10,
      stats,
      recent,
      categoryData
    });
  } catch (error) {
    console.error('Citizen analytics error:', error.message);
    res.status(500).json({ message: 'Server error retrieving citizen analytics' });
  }
};

// Ward Councillor Analytics
exports.getCouncillorAnalytics = async (req, res) => {
  try {
    const ward = req.user.ward;
    if (!ward) {
      return res.status(400).json({ message: 'User does not belong to a valid ward.' });
    }

    // Complaints in this ward
    const citizenIds = await User.find({ ward }).select('_id');
    const complaints = await Complaint.find({ citizen: { $in: citizenIds } });

    const stats = computeBasicStats(complaints);

    // Group by status for charts
    const statusData = [
      { name: 'Pending', value: complaints.filter(c => c.status === 'Submitted' || c.status === 'Escalated').length },
      { name: 'In Progress', value: complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length },
      { name: 'Resolved', value: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length },
    ];

    res.json({
      wardNumber: ward,
      stats,
      statusData
    });
  } catch (error) {
    console.error('Councillor analytics error:', error.message);
    res.status(500).json({ message: 'Server error retrieving councillor analytics' });
  }
};

// MLA Analytics (constituency wide)
exports.getMlaAnalytics = async (req, res) => {
  try {
    const constituency = req.user.assemblyConstituency;
    if (!constituency) {
      return res.status(400).json({ message: 'User does not belong to a constituency.' });
    }

    // Find all wards within this constituency by looking at citizens registered there
    const citizens = await User.find({ assemblyConstituency: constituency });
    const citizenIds = citizens.map(c => c._id);
    const complaints = await Complaint.find({ citizen: { $in: citizenIds } }).populate('citizen');

    // Group complaints by ward
    const wardMap = {};
    complaints.forEach(c => {
      if (c.citizen && c.citizen.ward) {
        const w = c.citizen.ward;
        if (!wardMap[w]) wardMap[w] = [];
        wardMap[w].push(c);
      }
    });

    const wardStats = Object.keys(wardMap).map(w => {
      const wComplaints = wardMap[w];
      const stats = computeBasicStats(wComplaints);
      return {
        ward: parseInt(w),
        total: stats.total,
        pending: stats.pending,
        resolved: stats.resolved,
        resolutionRate: stats.resolutionRate
      };
    }).sort((a, b) => a.ward - b.ward);

    res.json({
      constituency,
      wardStats,
      totalComplaints: complaints.length
    });
  } catch (error) {
    console.error('MLA analytics error:', error.message);
    res.status(500).json({ message: 'Server error retrieving MLA analytics' });
  }
};

// Zonal Officer Analytics
exports.getZonalAnalytics = async (req, res) => {
  try {
    const zone = req.user.zone;
    if (!zone) {
      return res.status(400).json({ message: 'User does not belong to a zone.' });
    }

    const citizensInZone = await User.find({ zone }).select('_id');
    const complaints = await Complaint.find({ citizen: { $in: citizensInZone } });

    const stats = computeBasicStats(complaints);
    const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;

    // Issue Trends (Complaints by Category)
    const categoryMap = {};
    complaints.forEach(c => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });
    const categoryTrends = Object.keys(categoryMap).map(cat => ({
      category: cat,
      count: categoryMap[cat]
    }));

    res.json({
      zoneNumber: zone,
      stats,
      escalatedCount,
      categoryTrends
    });
  } catch (error) {
    console.error('Zonal analytics error:', error.message);
    res.status(500).json({ message: 'Server error retrieving Zonal analytics' });
  }
};

// Mayor Analytics (City-wide)
exports.getMayorAnalytics = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('citizen');
    const stats = computeBasicStats(complaints);

    // Complaint Heatmap (coordinates only)
    const heatmap = complaints.map(c => ({
      lat: c.location.lat,
      lng: c.location.lng,
      status: c.status,
      title: c.title,
      id: c._id
    }));

    // Complaints by Area
    const areaMap = {};
    complaints.forEach(c => {
      if (c.citizen && c.citizen.area) {
        areaMap[c.citizen.area] = (areaMap[c.citizen.area] || 0) + 1;
      }
    });
    const areaData = Object.keys(areaMap).map(a => ({
      area: a,
      count: areaMap[a]
    })).sort((a,b) => b.count - a.count).slice(0, 8);

    // Department Performance
    const deptMap = {};
    complaints.forEach(c => {
      const dept = c.department || 'Greater Chennai Corporation';
      if (!deptMap[dept]) deptMap[dept] = { total: 0, resolved: 0 };
      deptMap[dept].total++;
      if (c.status === 'Resolved' || c.status === 'Closed') {
        deptMap[dept].resolved++;
      }
    });

    const departmentPerformance = Object.keys(deptMap).map(d => ({
      department: d,
      total: deptMap[d].total,
      resolved: deptMap[d].resolved,
      resolutionRate: ((deptMap[d].resolved / deptMap[d].total) * 100).toFixed(0)
    }));

    res.json({
      stats,
      heatmap,
      areaData,
      departmentPerformance
    });
  } catch (error) {
    console.error('Mayor analytics error:', error.message);
    res.status(500).json({ message: 'Server error retrieving Mayor analytics' });
  }
};

// Commissioner Analytics (Search & Deep Dive)
exports.getCommissionerSearch = async (req, res) => {
  try {
    const { query } = req.query; // Search word, e.g. "KK Nagar" or Councillor/MLA name or Ward
    if (!query) {
      return res.status(400).json({ message: 'Please provide a search query.' });
    }

    // Try finding ward or area match
    let filter = {};
    let matchedArea = '';
    let matchedWard = null;
    let matchedConstituency = '';

    const isNum = !isNaN(query);
    if (isNum) {
      matchedWard = parseInt(query);
    } else {
      // Find user role matching name or constituency
      const mlaUser = await User.findOne({
        name: { $regex: query, $options: 'i' },
        role: 'MLA'
      });
      if (mlaUser) {
        matchedConstituency = mlaUser.assemblyConstituency;
      } else {
        // Fallback to searching areas
        matchedArea = query;
      }
    }

    // Compute metrics based on target filter
    let searchCriteria = {};
    let mlaName = 'Unassigned';
    let councillorName = 'Unassigned';

    if (matchedWard !== null) {
      const citizenIds = await User.find({ ward: matchedWard }).select('_id');
      searchCriteria.citizen = { $in: citizenIds };
      
      const councillor = await User.findOne({ role: 'Ward Councillor', ward: matchedWard });
      councillorName = councillor ? councillor.name : 'Unassigned';
      
      const citizenExample = await User.findOne({ ward: matchedWard, role: 'Citizen' });
      if (citizenExample) {
        const mla = await User.findOne({ role: 'MLA', assemblyConstituency: citizenExample.assemblyConstituency });
        mlaName = mla ? mla.name : 'Unassigned';
      }
    } else if (matchedConstituency) {
      const citizenIds = await User.find({ assemblyConstituency: matchedConstituency }).select('_id');
      searchCriteria.citizen = { $in: citizenIds };
      
      const mla = await User.findOne({ role: 'MLA', assemblyConstituency: matchedConstituency });
      mlaName = mla ? mla.name : 'Unassigned';
    } else {
      // Area Search
      const citizenIds = await User.find({ area: { $regex: matchedArea, $options: 'i' } }).select('_id');
      searchCriteria.citizen = { $in: citizenIds };

      const sampleUser = await User.findOne({ area: { $regex: matchedArea, $options: 'i' } });
      if (sampleUser) {
        const councillor = await User.findOne({ role: 'Ward Councillor', ward: sampleUser.ward });
        councillorName = councillor ? councillor.name : 'Unassigned';
        
        const mla = await User.findOne({ role: 'MLA', assemblyConstituency: sampleUser.assemblyConstituency });
        mlaName = mla ? mla.name : 'Unassigned';
      }
    }

    const complaints = await Complaint.find(searchCriteria);
    const stats = computeBasicStats(complaints);

    // Performance score calculations
    const resRate = parseFloat(stats.resolutionRate);
    const performanceScore = complaints.length > 0 ? (resRate * 0.7 + (100 - (stats.pending / complaints.length) * 100) * 0.3).toFixed(0) : '100';
    const transparencyScore = complaints.length > 0 ? (100 - (complaints.filter(c => c.anonymous).length / complaints.length) * 20).toFixed(0) : '100'; // high transparency = lower anonymous ratio, or public dashboard engagement

    res.json({
      searchTarget: query,
      wardCouncillor: councillorName,
      mla: mlaName,
      totalComplaints: stats.total,
      pending: stats.pending,
      resolved: stats.resolved,
      resolutionRate: stats.resolutionRate,
      performanceScore,
      transparencyScore
    });
  } catch (error) {
    console.error('Commissioner search error:', error.message);
    res.status(500).json({ message: 'Server error executing search' });
  }
};

// Public scorecard list for all wards
exports.getPublicScorecards = async (req, res) => {
  try {
    const citizens = await User.find({ role: 'Citizen' });
    
    // Group citizens by ward to list all unique wards
    const wardMap = {};
    citizens.forEach(c => {
      if (c.ward) {
        if (!wardMap[c.ward]) wardMap[c.ward] = { area: c.area, citizens: [] };
        wardMap[c.ward].citizens.push(c._id);
      }
    });

    const scorecards = [];

    for (const w of Object.keys(wardMap)) {
      const wardNum = parseInt(w);
      const userIds = wardMap[w].citizens;
      const complaints = await Complaint.find({ citizen: { $in: userIds } });

      const stats = computeBasicStats(complaints);
      
      // Calculate Citizen Satisfaction (mock metrics based on resolution times & comment sentiments)
      const satisfScore = complaints.length > 0 ? Math.min(100, Math.max(40, Math.round(parseFloat(stats.resolutionRate) * 1.1 - (stats.pending / complaints.length) * 10))).toString() : '80';
      const transparencyScore = '95'; // All complaints are public in Namma Chennai!

      scorecards.push({
        wardName: `Ward ${wardNum} (${wardMap[w].area || 'GCC Area'})`,
        wardNumber: wardNum,
        totalComplaints: stats.total,
        resolvedComplaints: stats.resolved,
        pendingComplaints: stats.pending,
        avgResolutionTime: stats.avgResolutionTime === 'N/A' ? '7.0' : stats.avgResolutionTime, // Default to a standard 7-day estimate if no data
        satisfactionScore: satisfScore,
        transparencyScore
      });
    }

    res.json(scorecards.sort((a,b) => b.satisfactionScore - a.satisfactionScore));
  } catch (error) {
    console.error('Public scorecards error:', error.message);
    res.status(500).json({ message: 'Server error retrieving scorecards' });
  }
};
