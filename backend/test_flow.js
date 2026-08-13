const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5001;
const HOST = '127.0.0.1';

// Helper to make HTTP requests using native http module
function request(method, pathUrl, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const isMultipart = headers['Content-Type']?.startsWith('multipart/form-data');
    let bodyData = null;
    let finalHeaders = {
      ...headers
    };

    if (data && !isMultipart) {
      bodyData = JSON.stringify(data);
      finalHeaders['Content-Type'] = 'application/json';
      finalHeaders['Content-Length'] = Buffer.byteLength(bodyData);
    }

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api' + pathUrl,
      method,
      headers: finalHeaders
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, data: parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject({ status: res.statusCode, raw: responseBody });
          } else {
            resolve(responseBody);
          }
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (isMultipart && data) {
      // Data is already a buffer for multipart
      req.write(data);
    } else if (bodyData) {
      req.write(bodyData);
    }
    
    req.end();
  });
}

// Custom multipart form generator for file uploads
function buildMultipartBody(filePath, fieldName) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const filename = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);
  
  const header = 
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`;
    
  const footer = `\r\n--${boundary}--\r\n`;
  
  const body = Buffer.concat([
    Buffer.from(header, 'utf-8'),
    fileContent,
    Buffer.from(footer, 'utf-8')
  ]);
  
  return {
    body,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length
    }
  };
}

async function testAll() {
  console.log('🚀 STARTING JOB PORTAL FLOW TEST (Zero Dependencies)...\n');
  const timestamp = Date.now();
  
  const recruiterEmail = `recruiter_${timestamp}@test.com`;
  const seekerEmail = `seeker_${timestamp}@test.com`;
  const password = 'Password123!';

  // 1. Recruiter Signup
  console.log('➡️ 1. Signing up Recruiter...');
  const recruiterReg = await request('POST', '/auth/register', {
    name: 'Priya Sharma',
    email: recruiterEmail,
    password,
    role: 'recruiter',
    company: 'NextGen AI',
    location: 'Bangalore, India'
  });
  const recruiterToken = recruiterReg.token;
  console.log('✅ Recruiter signed up successfully!\n');

  // 2. Seeker Signup
  console.log('➡️ 2. Signing up Job Seeker...');
  const seekerReg = await request('POST', '/auth/register', {
    name: 'Dhananjay Sisodiya',
    email: seekerEmail,
    password,
    role: 'jobseeker',
    location: 'Indore, India'
  });
  const seekerToken = seekerReg.token;
  console.log('✅ Job Seeker signed up successfully!\n');

  // 3. Recruiter Posts a Job
  console.log('➡️ 3. Recruiter posting a job (Senior React Developer)...');
  const jobPost = await request('POST', '/jobs', {
    title: 'Senior React Developer',
    company: 'NextGen AI',
    location: 'Bangalore, India (Hybrid)',
    jobType: 'full-time',
    experienceLevel: 'senior',
    description: 'We are seeking a Senior React Developer to build dynamic front-end applications. You will collaborate with designers and implement robust state management.',
    responsibilities: [
      'Develop clean and modular React components',
      'Optimize web application performance',
      'Lead junior developers and do code reviews'
    ],
    requirements: [
      '4+ years of React.js experience',
      'Strong knowledge of TypeScript, Redux, and TailwindCSS',
      'Experience with REST APIs and modern web tooling'
    ],
    requiredSkills: ['React', 'Redux', 'TypeScript', 'TailwindCSS', 'JavaScript', 'Git'],
    salaryMin: 1800000,
    salaryMax: 2500000,
    openings: 2
  }, { Authorization: `Bearer ${recruiterToken}` });
  
  const job = jobPost.job;
  console.log(`✅ Job posted: "${job.title}" (ID: ${job._id})\n`);

  // 4. Job Seeker uploads a resume
  console.log('➡️ 4. Job Seeker uploading resume...');
  const uploadsDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadsDir);
  const pdfFile = files.find(f => f.endsWith('.pdf'));
  
  if (!pdfFile) {
    throw new Error('No PDF resume found in backend/uploads/ folder to test with.');
  }
  
  const resumeFilePath = path.join(uploadsDir, pdfFile);
  console.log(`📄 Using resume file: ${pdfFile}`);

  const { body, headers } = buildMultipartBody(resumeFilePath, 'resume');
  headers['Authorization'] = `Bearer ${seekerToken}`;

  const resumeUpload = await request('POST', '/resume/upload', body, headers);
  const resume = resumeUpload.resume;
  console.log(`✅ Resume uploaded successfully! (ID: ${resume._id})`);
  console.log(`💡 Extracted Skills: ${resumeUpload.parsedSkills?.join(', ') || 'None'}\n`);

  // 5. Job Seeker Applies to the Job
  console.log('➡️ 5. Job Seeker applying to the job...');
  const applicationPost = await request('POST', `/applications/${job._id}/apply`, {
    resumeId: resume._id,
    coverLetter: 'I am highly experienced with React, TypeScript, and Redux. I would love to join your team.'
  }, { Authorization: `Bearer ${seekerToken}` });
  
  const application = applicationPost.application;
  console.log(`✅ Applied successfully! (ID: ${application._id})\n`);

  // 6. Running AI analysis
  console.log('➡️ 6. Running Gemini AI Resume Analysis (this might take 10-15 seconds)...');
  const data = await request('POST', `/applications/${application._id}/analyze`, {}, { 
    Authorization: `Bearer ${seekerToken}` 
  });
  
  console.log('✅ Analysis completed!');
  console.log(`🤖 Analysis Source: ${data.analysisSource || 'Unknown'}\n`);

  // Output results
  console.log('==================================================');
  console.log('📊 AI RESUME ANALYSIS RESULTS');
  console.log('==================================================');
  console.log(`🎯 Match Score: ${data.aiAnalysis?.matchScore || 0}/100`);
  console.log('\n✅ Matched Skills:');
  console.log(data.aiAnalysis?.matchedSkills?.map(s => `  • ${s}`).join('\n') || '  None');
  console.log('\n❌ Missing Skills (Skill Gap):');
  console.log(data.aiAnalysis?.missingSkills?.map(s => `  • ${s}`).join('\n') || '  None');
  console.log('\n💪 Strengths:');
  console.log(data.aiAnalysis?.strengths?.map(s => `  • ${s}`).join('\n') || '  None');
  console.log('\n💡 Suggestions for Improvement:');
  console.log(data.aiAnalysis?.suggestions?.map(s => `  • ${s}`).join('\n') || '  None');
  console.log('\n📝 Feedback Summary:');
  console.log(data.aiAnalysis?.analysisText || 'No feedback text.');
  console.log('==================================================\n');

  console.log('🎉 Flow test finished successfully!');
}

testAll().catch(err => {
  console.error('❌ Test failed with error:', err.data || err.message || err);
});
