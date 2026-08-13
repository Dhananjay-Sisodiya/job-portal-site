const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Lazy init so missing key doesn't crash at startup ─────────────────────
let _genAI = null;
const getGenAI = () => {
  if (!_genAI) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return null;
    }
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return _genAI;
};

// Model priority list — lightest/fastest first to minimise quota burn
const MODELS = [
  'gemini-2.5-flash',        // confirmed working ✅
  'gemini-2.0-flash-lite',   // low quota fallback
  'gemini-2.0-flash',        // standard flash
  'gemini-2.0-flash-001',    // pinned stable
];

// ─── Sleep helper ────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Try to get a working Gemini model, cycling through fallbacks.
 * Returns null if all are quota-exhausted / unavailable.
 */
const getWorkingModel = async (prompt) => {
  const genAI = getGenAI();
  if (!genAI) return null;

  for (let i = 0; i < MODELS.length; i++) {
    const modelName = MODELS[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return { model, result, modelName };
    } catch (err) {
      const isQuota = err.status === 429 || String(err.message).includes('429') || String(err.message).toLowerCase().includes('quota');
      const isNotFound = err.status === 404 || String(err.message).includes('404') || String(err.message).toLowerCase().includes('not found');

      if (isQuota) {
        console.warn(`⚠️  ${modelName} rate-limited (429). ${i < MODELS.length - 1 ? 'Trying next in 2s...' : 'All models exhausted.'}`);
        if (i < MODELS.length - 1) await sleep(2000);
        continue;
      }
      if (isNotFound) {
        console.warn(`⚠️  ${modelName} not found, skipping.`);
        continue;
      }
      throw err;
    }
  }
  return null;
};


// ─── JSON Extractor — handles markdown fences + raw JSON ────────────────────
const extractJSON = (text) => {
  // Remove markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  // Try to extract JSON object if there's extra text
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) cleaned = match[0];
  return JSON.parse(cleaned);
};

// ─── NLP-based fallback analysis (no API needed) ───────────────────────────
const nlpFallbackAnalysis = (resumeText, jobDescription, requiredSkills) => {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  const matched = [];
  const missing = [];

  requiredSkills.forEach((skill) => {
    if (resumeLower.includes(skill.toLowerCase())) matched.push(skill);
    else missing.push(skill);
  });

  const skillScore = requiredSkills.length > 0
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 50;

  // Keyword overlap
  const jdWords = new Set(jdLower.match(/\b\w{4,}\b/g) || []);
  const resumeWords = new Set(resumeLower.match(/\b\w{4,}\b/g) || []);
  const overlap = [...jdWords].filter((w) => resumeWords.has(w)).length;
  const keywordScore = jdWords.size > 0 ? Math.round((overlap / jdWords.size) * 100) : 50;

  const matchScore = Math.round(skillScore * 0.6 + keywordScore * 0.4);

  return {
    matchScore: Math.min(matchScore, 100),
    matchedSkills: matched,
    missingSkills: missing,
    strengths: matched.length > 0 ? [`Proficient in ${matched.slice(0, 3).join(', ')}`] : [],
    suggestions: missing.length > 0
      ? missing.slice(0, 5).map((s) => `Add experience with ${s} to your resume`)
      : ['Resume matches the job well!'],
    experienceMatch: matchScore >= 70 ? 'good' : matchScore >= 40 ? 'fair' : 'poor',
    overallFeedback: `NLP-based analysis: ${matchScore}% keyword match. ${
      missing.length > 0 ? `Missing skills: ${missing.slice(0, 3).join(', ')}.` : 'All required skills present.'
    } (AI analysis unavailable — Gemini quota exceeded)`,
    keywordDensity: keywordScore,
    atsCompatibility: matchScore,
    _source: 'nlp-fallback',
  };
};

/**
 * Analyze resume against job description using Gemini AI (with NLP fallback)
 */
const analyzeResume = async (resumeText, jobDescription, requiredSkills = []) => {
  const prompt = `
You are an expert ATS (Applicant Tracking System) and HR consultant. Analyze the following resume against the job description and provide a detailed assessment.

**RESUME TEXT:**
${resumeText.substring(0, 6000)}

**JOB DESCRIPTION:**
${jobDescription.substring(0, 3000)}

**REQUIRED SKILLS:**
${requiredSkills.join(', ')}

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "matchScore": <integer 0-100>,
  "matchedSkills": [<skills present in both resume and JD>],
  "missingSkills": [<required skills NOT in resume>],
  "strengths": [<3-5 candidate strengths>],
  "suggestions": [<5-7 specific improvement suggestions>],
  "experienceMatch": "<poor|fair|good|excellent>",
  "overallFeedback": "<2-3 sentence assessment>",
  "keywordDensity": <integer 0-100>,
  "atsCompatibility": <integer 0-100>
}`;

  try {
    const attempt = await getWorkingModel(prompt);

    if (!attempt) {
      // All Gemini models quota-exhausted — fall back to pure NLP
      console.warn('⚠️  All Gemini models unavailable. Using NLP fallback for resume analysis.');
      const fallback = nlpFallbackAnalysis(resumeText, jobDescription, requiredSkills);
      return { success: true, data: fallback, source: 'nlp-fallback' };
    }

    const responseText = attempt.result.response.text();
    const analysis = extractJSON(responseText);

    return { success: true, data: { ...analysis, _source: 'gemini' }, source: 'gemini', modelUsed: attempt.modelName };
  } catch (error) {
    console.error('Gemini AI Resume Analysis Error:', error.message);
    // Return NLP fallback instead of empty result
    const fallback = nlpFallbackAnalysis(resumeText, jobDescription, requiredSkills);
    return { success: true, data: fallback, source: 'nlp-fallback', error: error.message };
  }
};

/**
 * Generate a professional Job Description using Gemini AI
 */
const generateJobDescription = async (jobTitle, skills, experience, jobType, company) => {
  const prompt = `
You are an expert HR professional and technical recruiter. Generate a comprehensive, professional job description.

Job Title: ${jobTitle}
Company: ${company || 'Our Company'}
Required Skills: ${skills.join(', ')}
Experience: ${experience}
Job Type: ${jobType || 'Full-time'}

Return ONLY valid JSON (no markdown):
{
  "title": "${jobTitle}",
  "overview": "<2-3 paragraph compelling overview>",
  "responsibilities": [<8-10 key responsibilities>],
  "requirements": [<6-8 must-have requirements>],
  "niceToHave": [<4-5 nice-to-have qualifications>],
  "benefits": [<5-6 benefits>],
  "skills": [<required technical skills>],
  "experienceLevel": "${experience}",
  "aboutRole": "<one-sentence elevator pitch>"
}`;

  try {
    const attempt = await getWorkingModel(prompt);

    if (!attempt) {
      // Gemini unavailable — generate a template JD from the inputs
      console.warn('⚠️  Gemini unavailable. Generating template JD.');
      return {
        success: true,
        data: generateTemplatJD(jobTitle, skills, experience, jobType, company),
        source: 'template',
      };
    }

    const jd = extractJSON(attempt.result.response.text());
    return { success: true, data: jd, source: 'gemini', modelUsed: attempt.modelName };
  } catch (error) {
    console.error('Gemini AI JD Generation Error:', error.message);
    return {
      success: true,
      data: generateTemplatJD(jobTitle, skills, experience, jobType, company),
      source: 'template',
      error: error.message,
    };
  }
};

// Template JD when Gemini is unavailable
const generateTemplatJD = (title, skills, experience, jobType, company) => ({
  title,
  overview: `We are looking for a talented ${title} to join ${company || 'our team'}. This is an exciting ${jobType || 'full-time'} opportunity for a ${experience || 'mid-level'} professional to make a real impact. You will work with a passionate team on innovative products that serve millions of users.`,
  responsibilities: [
    `Design, develop, and maintain ${title.toLowerCase()} solutions`,
    `Collaborate with cross-functional teams to define and implement features`,
    `Write clean, maintainable, and well-documented code`,
    `Participate in code reviews and technical discussions`,
    `Troubleshoot, debug, and optimize application performance`,
    `Stay updated with the latest industry trends and technologies`,
    `Contribute to technical documentation and best practices`,
    `Mentor junior team members`,
  ],
  requirements: [
    `${experience || 'Mid-level'} experience as a ${title}`,
    `Strong proficiency in ${skills.slice(0, 3).join(', ')}`,
    `Experience with ${skills.slice(3, 6).join(', ') || 'modern development tools'}`,
    `Strong problem-solving and analytical skills`,
    `Excellent communication and teamwork abilities`,
    `Bachelor's degree in Computer Science or equivalent experience`,
  ],
  niceToHave: [
    `Experience with cloud platforms (AWS / Azure / GCP)`,
    `Knowledge of CI/CD pipelines`,
    `Open source contributions`,
    `Experience in an Agile environment`,
  ],
  benefits: [
    `Competitive salary and equity`,
    `Flexible working hours and remote options`,
    `Health insurance coverage`,
    `Learning and development budget`,
    `Annual performance bonus`,
  ],
  skills,
  experienceLevel: experience || 'mid',
  aboutRole: `Join us as a ${title} and help shape the future of our products.`,
});

/**
 * Extract structured data from resume text using Gemini AI
 */
const extractResumeData = async (resumeText) => {
  const prompt = `
Extract structured information from this resume. Return ONLY valid JSON:

${resumeText.substring(0, 6000)}

JSON structure:
{
  "name": "<full name or null>",
  "email": "<email or null>",
  "phone": "<phone or null>",
  "skills": [<all technical and soft skills>],
  "totalYearsExperience": <number>,
  "education": [<education entries as strings>],
  "workExperience": [{ "company": "", "role": "", "duration": "", "description": "" }],
  "certifications": [<certifications>],
  "summary": "<2 sentence professional summary>"
}`;

  try {
    const attempt = await getWorkingModel(prompt);

    if (!attempt) {
      console.warn('⚠️  Gemini unavailable. Using NLP for resume data extraction.');
      return { success: true, data: extractResumeDataNLP(resumeText), source: 'nlp-fallback' };
    }

    const data = extractJSON(attempt.result.response.text());
    return { success: true, data, source: 'gemini', modelUsed: attempt.modelName };
  } catch (error) {
    console.error('Gemini Resume Extraction Error:', error.message);
    return { success: true, data: extractResumeDataNLP(resumeText), source: 'nlp-fallback' };
  }
};

// NLP-based resume data extraction fallback
const extractResumeDataNLP = (text) => {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{8,}\d)/);

  // Extract skills using keyword list
  const TECH_SKILLS = [
    'javascript', 'python', 'java', 'react', 'node.js', 'nodejs', 'express', 'mongodb',
    'mysql', 'postgresql', 'html', 'css', 'typescript', 'angular', 'vue', 'next.js',
    'aws', 'docker', 'kubernetes', 'git', 'linux', 'c++', 'c#', 'go', 'rust', 'php',
    'django', 'flask', 'spring', 'redux', 'graphql', 'rest', 'sql', 'nosql', 'redis',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'react native', 'flutter',
  ];
  const lower = text.toLowerCase();
  const skills = TECH_SKILLS.filter((s) => lower.includes(s)).map(
    (s) => s.charAt(0).toUpperCase() + s.slice(1)
  );

  return {
    name: null,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    skills: [...new Set(skills)],
    totalYearsExperience: 0,
    education: [],
    workExperience: [],
    certifications: [],
    summary: 'Resume uploaded successfully. Skills extracted via NLP.',
  };
};

module.exports = { analyzeResume, generateJobDescription, extractResumeData };
