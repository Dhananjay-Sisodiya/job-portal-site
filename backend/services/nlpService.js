const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');
const fs = require('fs');
const path = require('path');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Comprehensive tech skills dictionary for NLP keyword extraction
const TECH_SKILLS = [
  // Programming Languages
  'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
  'kotlin', 'typescript', 'php', 'scala', 'r', 'matlab', 'perl', 'dart',
  // Frontend
  'react', 'reactjs', 'angular', 'vue', 'vuejs', 'nextjs', 'gatsby', 'html',
  'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'redux',
  'webpack', 'vite', 'jquery', 'svelte',
  // Backend
  'nodejs', 'node.js', 'express', 'expressjs', 'django', 'flask', 'fastapi',
  'spring', 'springboot', 'laravel', 'rails', 'ruby on rails', 'nestjs',
  'graphql', 'rest', 'restful', 'microservices', 'grpc',
  // Databases
  'mongodb', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis', 'cassandra',
  'dynamodb', 'elasticsearch', 'neo4j', 'oracle', 'mssql', 'firebase',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins',
  'gitlab', 'github actions', 'terraform', 'ansible', 'ci/cd', 'devops',
  'linux', 'nginx', 'apache',
  // AI/ML
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp', 'computer vision',
  'neural network', 'llm', 'langchain', 'huggingface',
  // Mobile
  'react native', 'flutter', 'android', 'ios', 'xamarin',
  // Tools
  'git', 'jira', 'confluence', 'figma', 'postman', 'swagger', 'agile',
  'scrum', 'kanban', 'vs code', 'intellij',
];

const SOFT_SKILLS = [
  'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
  'creative', 'adaptable', 'organized', 'management', 'collaboration',
  'critical thinking', 'time management', 'mentoring', 'presentation',
];

/**
 * Extract text from PDF file
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return { success: true, text: data.text };
  } catch (error) {
    console.error('PDF Parse Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Extract text from Word document (doc/docx)
 */
const extractTextFromWord = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return { success: true, text: result.value };
  } catch (error) {
    console.error('Word Parse Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Extract text from resume file based on type
 */
const extractResumeText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    return await extractTextFromPDF(filePath);
  } else if (ext === '.doc' || ext === '.docx') {
    return await extractTextFromWord(filePath);
  } else {
    return { success: false, error: 'Unsupported file type' };
  }
};

/**
 * Extract skills from text using NLP keyword matching
 */
const extractSkillsNLP = (text) => {
  const lowerText = text.toLowerCase();
  const extractedSkills = new Set();

  // Check for tech skills
  TECH_SKILLS.forEach((skill) => {
    if (lowerText.includes(skill)) {
      extractedSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  // Check for soft skills
  SOFT_SKILLS.forEach((skill) => {
    if (lowerText.includes(skill)) {
      extractedSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  return Array.from(extractedSkills);
};

/**
 * Calculate TF-IDF similarity between resume and JD
 */
const calculateTfIdfSimilarity = (resumeText, jdText) => {
  const tfidf = new TfIdf();
  tfidf.addDocument(resumeText.toLowerCase());
  tfidf.addDocument(jdText.toLowerCase());

  // Get top terms from JD
  const jdTerms = [];
  tfidf.listTerms(1).forEach((item) => {
    if (item.tfidf > 0.1) jdTerms.push(item.term);
  });

  // Check how many JD terms are in resume
  const resumeLower = resumeText.toLowerCase();
  const matchCount = jdTerms.filter((term) => resumeLower.includes(term)).length;
  const similarity = jdTerms.length > 0 ? (matchCount / jdTerms.length) * 100 : 0;

  return Math.min(Math.round(similarity), 100);
};

/**
 * Calculate skill match percentage using NLP
 */
const calculateSkillMatch = (resumeSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return { score: 50, matched: [], missing: [] };

  const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());
  const matched = [];
  const missing = [];

  requiredSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    const isMatch = resumeSkillsLower.some(
      (rs) => rs.includes(skillLower) || skillLower.includes(rs) ||
        natural.JaroWinklerDistance(rs, skillLower) > 0.88
    );
    if (isMatch) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });

  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
};

/**
 * Full NLP analysis pipeline
 */
const analyzeWithNLP = async (resumeText, jobDescription, requiredSkills) => {
  // Extract skills from resume using NLP
  const resumeSkills = extractSkillsNLP(resumeText);
  const jdSkills = extractSkillsNLP(jobDescription);

  // Calculate similarity scores
  const tfidfScore = calculateTfIdfSimilarity(resumeText, jobDescription);
  const skillMatch = calculateSkillMatch(resumeSkills, requiredSkills.length > 0 ? requiredSkills : jdSkills);

  // Combine scores: 60% skill match + 40% TF-IDF
  const nlpScore = Math.round(skillMatch.score * 0.6 + tfidfScore * 0.4);

  return {
    nlpScore,
    tfidfScore,
    skillMatchScore: skillMatch.score,
    resumeExtractedSkills: resumeSkills,
    matchedSkills: skillMatch.matched,
    missingSkills: skillMatch.missing,
  };
};

module.exports = {
  extractResumeText,
  extractSkillsNLP,
  calculateTfIdfSimilarity,
  calculateSkillMatch,
  analyzeWithNLP,
};
