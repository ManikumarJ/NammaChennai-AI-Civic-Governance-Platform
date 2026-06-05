import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    appName: "Namma Chennai",
    tagline: "AI-Powered Grievance & Transparency Portal",
    tnGov: "Government of Tamil Nadu",
    login: "Login",
    register: "Register",
    logout: "Logout",
    dashboard: "Dashboard",
    publicFeed: "Public Complaint Feed",
    citizenPortal: "Citizen Portal",
    officialPortal: "Official Portal",
    home: "Home",
    map: "Interactive Complaint Map",
    language: "தமிழ்",
    submitComplaint: "File a Grievance",
    affectedBtn: "I Am Also Affected",
    searchPlaceholder: "Search areas, wards, complaints, departments...",
    ward: "Ward",
    zone: "Zone",
    constituency: "Assembly Constituency",
    totalComplaints: "Total Complaints",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    escalated: "Escalated",
    closed: "Closed",
    recentComplaints: "Recent Grievances",
    areaAnalytics: "Area Analytics",
    scorecards: "Public Ward Scorecards",
    performanceScore: "Performance Score",
    transparencyScore: "Transparency Score",
    satisfactionScore: "Satisfaction Score",
    resolutionRate: "Resolution Rate",
    avgResTime: "Avg. Resolution Time",
    assignedOfficer: "Assigned Officer",
    anonymous: "Anonymous",
    reportedBy: "Reported By",
    affectedCountText: "Affected Citizens",
    timeline: "Audit Trail & Timeline",
    category: "Category",
    priority: "Priority",
    department: "Department",
    authority: "Responsible Authority",
    escalationPath: "AI Escalation Path",
    summary: "AI Summary",
    comments: "Official Discussion & Remarks",
    postComment: "Post Comment",
    noComplaints: "No complaints found.",
    councillor: "Ward Councillor",
    mla: "MLA",
    zonalOfficer: "Zonal Officer",
    mayor: "Mayor",
    commissioner: "Corporation Commissioner",
    details: "View Details",
    email: "Email",
    password: "Password",
    phone: "Phone Number",
    name: "Full Name",
    areaName: "Area Name",
    confirmPass: "Confirm Password",
    forgotPass: "Forgot Password?",
    verifyEmailAlert: "Account not verified. Check email link.",
  },
  ta: {
    appName: "நம்ம சென்னை",
    tagline: "செயற்கை நுண்ணறிவு குறைதீர்ப்பு மற்றும் வெளிப்படைத்தன்மை போர்டல்",
    tnGov: "தமிழ்நாடு அரசு",
    login: "உள்நுழை",
    register: "பதிவு செய்",
    logout: "வெளியேறு",
    dashboard: "டாஷ்போர்டு",
    publicFeed: "பொது புகார்கள்",
    citizenPortal: "குடிமகன் போர்டல்",
    officialPortal: "அதிகாரப்பூர்வ போர்டல்",
    home: "முகப்பு",
    map: "ஊடாடும் புகார் வரைபடம்",
    language: "English",
    submitComplaint: "புகார் பதிவு செய்",
    affectedBtn: "நானும் பாதிக்கப்பட்டுள்ளேன்",
    searchPlaceholder: "பகுதிகள், வார்டுகள், புகார்கள், துறைகளைத் தேடுங்கள்...",
    ward: "வார்டு",
    zone: "மண்டலம்",
    constituency: "சட்டமன்றத் தொகுதி",
    totalComplaints: "மொத்த புகார்கள்",
    pending: "நிலுவையில்",
    inProgress: "செயல்பாட்டில்",
    resolved: "தீர்வு செய்யப்பட்டது",
    escalated: "மேலதிகாரிக்கு அனுப்பப்பட்டது",
    closed: "மூடப்பட்டது",
    recentComplaints: "சமீபத்திய புகார்கள்",
    areaAnalytics: "வட்டார பகுப்பாய்வு",
    scorecards: "பொது வார்டு மதிப்பெண் அட்டை",
    performanceScore: "செயல்திறன் மதிப்பெண்",
    transparencyScore: "வெளிப்படைத்தன்மை மதிப்பெண்",
    satisfactionScore: "குடிமக்கள் திருப்தி",
    resolutionRate: "தீர்வு விகிதம்",
    avgResTime: "சராசரி தீர்வு நேரம்",
    assignedOfficer: "நியமிக்கப்பட்ட அதிகாரி",
    anonymous: "அநாமதேய",
    reportedBy: "புகாரளித்தவர்",
    affectedCountText: "பாதிக்கப்பட்ட குடிமக்கள்",
    timeline: "தணிக்கை பாதை & காலவரிசை",
    category: "வகை",
    priority: "முன்னுரிமை",
    department: "துறை",
    authority: "பொறுப்பு அதிகாரி",
    escalationPath: "AI மேலதிகாரி பாதை",
    summary: "AI சுருக்கம்",
    comments: "அதிகாரப்பூர்வ கருத்துக்கள்",
    postComment: "கருத்து இடுகையிடவும்",
    noComplaints: "புகார்கள் எதுவும் இல்லை.",
    councillor: "வார்டு கவுன்சிலர்",
    mla: "சட்டமன்ற உறுப்பினர் (MLA)",
    zonalOfficer: "மண்டல அதிகாரி",
    mayor: "மேயர்",
    commissioner: "மாநகராட்சி ஆணையர்",
    details: "விவரங்களை காண்க",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    phone: "தொலைபேசி எண்",
    name: "முழு பெயர்",
    areaName: "பகுதி பெயர்",
    confirmPass: "கடவுச்சொல்லை உறுதிப்படுத்து",
    forgotPass: "கடவுச்சொல் மறந்ததா?",
    verifyEmailAlert: "கணக்கு சரிபார்க்கப்படவில்லை. மின்னஞ்சல் இணைப்பைச் சரிபார்க்கவும்.",
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('nc_lang') || 'en';
  });

  const toggleLanguage = () => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'ta' : 'en';
      localStorage.setItem('nc_lang', next);
      return next;
    });
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
