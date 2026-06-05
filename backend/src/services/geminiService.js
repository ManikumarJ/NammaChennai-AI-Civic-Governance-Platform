const { GoogleGenerativeAI } = require('@google/generative-ai');

// Categories list
const CATEGORIES = [
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
];

// Fallback logic when Gemini key is not present or API fails
const fallbackAnalysis = (title, description) => {
  const t = (title || '').toLowerCase();
  const d = (description || '').toLowerCase();
  const text = `${t} ${d}`;

  let category = 'Other';
  let priority = 'Medium';
  let department = 'Greater Chennai Corporation';

  if (text.includes('garbage') || text.includes('waste') || text.includes('kuppai') || text.includes('trash') || text.includes('குப்பை')) {
    category = 'Garbage Collection';
    department = 'Solid Waste Management Department';
    priority = 'Medium';
  } else if (text.includes('road') || text.includes('pothole') || text.includes('salai') || text.includes('சாலை') || text.includes('பள்ளம்')) {
    category = 'Road Damage';
    department = 'Bus Route Roads / General Roads Department';
    priority = 'High';
  } else if (text.includes('light') || text.includes('bulb') || text.includes('vilakku') || text.includes('விளக்கு') || text.includes('மின்சாரம்')) {
    category = 'Street Light';
    department = 'Electrical Department';
    priority = 'Low';
  } else if (text.includes('leak') || text.includes('water') || text.includes('pipe') || text.includes('tannir') || text.includes('தண்ணீர்') || text.includes('கசிவு')) {
    category = 'Water Leakage';
    department = 'Chennai Metro Water (CMWSSB)';
    priority = 'High';
  } else if (text.includes('drain') || text.includes('sewage') || text.includes('saakadai') || text.includes('சாக்கடை') || text.includes('கழிவுநீர்')) {
    category = 'Drainage Issue';
    department = 'Chennai Metro Water & Sewerage Board';
    priority = 'High';
  } else if (text.includes('health') || text.includes('dengue') || text.includes('mosquito') || text.includes('sugatharam') || text.includes('சுகாதாரம்') || text.includes('கொசு')) {
    category = 'Public Health';
    department = 'Public Health Department';
    priority = 'High';
  } else if (text.includes('school') || text.includes('palli') || text.includes('பள்ளி') || text.includes('மாணவர்')) {
    category = 'Government School Issue';
    department = 'Education Department';
    priority = 'Medium';
  } else if (text.includes('hospital') || text.includes('doctor') || text.includes('maruthuvamanai') || text.includes('மருத்துவமனை')) {
    category = 'Government Hospital Issue';
    department = 'Health Department / GCC Hospitals';
    priority = 'High';
  } else if (text.includes('encroach') || text.includes('occupy') || text.includes('aakiramipu') || text.includes('ஆக்கிரமிப்பு')) {
    category = 'Encroachment';
    department = 'Corporation Revenue / Enforcement';
    priority = 'Medium';
  }

  // Set default translations (in real fallback we copy the input or mock bilingual)
  const isTamil = /[\u0B80-\u0BFF]/.test(text);

  return {
    category,
    priority,
    department,
    authority: 'Ward Councillor',
    escalationPath: ['Ward Councillor', 'Zonal Officer', 'Mayor', 'Corporation Commissioner'],
    summary: `Citizen reported a ${category.toLowerCase()} issue: "${title}"`,
    translations: {
      titleTa: isTamil ? title : `மொழிபெயர்ப்பு: ${title}`,
      descTa: isTamil ? description : `விளக்கம் மொழிபெயர்ப்பு: ${description}`,
      titleEn: isTamil ? `Translated: ${title}` : title,
      descEn: isTamil ? `Translated description: ${description}` : description,
    }
  };
};

const analyzeComplaint = async (title, description) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('Using local heuristics fallback for complaint analysis (no GEMINI_API_KEY).');
    return fallbackAnalysis(title, description);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as the fallback, it supports JSON schema and is highly reliable
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are the AI engine for "Namma Chennai", the official public grievance and transparency platform for the Greater Chennai Corporation.
      Analyze the following citizen complaint and return a JSON object.

      Complaint Title: "${title}"
      Complaint Description: "${description}"

      The JSON response must strictly conform to this schema:
      {
        "category": "One of: Garbage Collection, Road Damage, Street Light, Water Leakage, Drainage Issue, Public Health, Government School Issue, Government Hospital Issue, Encroachment, Other",
        "priority": "One of: Low, Medium, High, Critical",
        "department": "Name of the Greater Chennai Corporation or Metro Water department responsible",
        "authority": "Role name of primary authority responsible, typically 'Ward Councillor'",
        "escalationPath": ["Ward Councillor", "Zonal Officer", "Mayor", "Corporation Commissioner"],
        "summary": "A concise one-sentence English summary of the issue",
        "translations": {
          "titleTa": "Tamil translation of the title. If input is already in Tamil, keep it as is.",
          "descTa": "Tamil translation of the description. If input is already in Tamil, keep it as is.",
          "titleEn": "English translation of the title. If input is already in English, keep it as is.",
          "descEn": "English translation of the description. If input is already in English, keep it as is."
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    // Validate category
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Other';
    }

    return parsed;
  } catch (error) {
    console.error('Gemini API Error, using fallback analysis:', error.message);
    return fallbackAnalysis(title, description);
  }
};

module.exports = {
  analyzeComplaint,
  fallbackAnalysis
};
