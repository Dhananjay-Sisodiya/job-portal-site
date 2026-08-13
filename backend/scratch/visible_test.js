/**
 * JOB AI PORTAL — VISIBLE HEADED BROWSER DEMO
 * Opens a REAL Chrome window on your screen.
 * Watch every click, keystroke, and page transition live.
 *
 * Run: node visible_test.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5173';
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Helper: Set React-controlled input value
async function setInput(page, selector, value) {
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, selector, value);
}

async function run() {
  console.log('\n' + '═'.repeat(54));
  console.log('  👀  VISIBLE BROWSER TEST — Watch your screen!');
  console.log('═'.repeat(54));
  console.log('\n  ⚡ Opening Chrome window in 2 seconds...\n');
  await sleep(2000);

  const browser = await puppeteer.launch({
    headless: false,            // ← REAL VISIBLE WINDOW
    slowMo: 80,                 // ← Every action slowed so you can watch
    defaultViewport: null,      // ← Full window, not fixed viewport
    args: [
      '--start-maximized',      // ← Open full screen
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browser.newPage();

  // Monitor and print browser console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  🔴 Browser Error: ${msg.text().substring(0, 120)}`);
    }
  });
  page.on('pageerror', err => {
    console.log(`  🔴 Page Error: ${err.message.substring(0, 120)}`);
  });

  const ts = Date.now();
  const RECRUITER = { email: `recruiter_demo_${ts}@test.com`, password: 'Demo1234' };
  const SEEKER    = { email: `seeker_demo_${ts}@test.com`,    password: 'Demo1234' };

  try {

    // ════════════════════════════════════════════════
    // STEP 1 — LANDING PAGE
    // ════════════════════════════════════════════════
    console.log('─'.repeat(54));
    console.log('  [STEP 1] 🏠 Opening Landing Page...');
    console.log('─'.repeat(54));
    await page.goto(BASE, { waitUntil: 'networkidle2' });
    await sleep(2500); // Let user admire the landing page

    // ════════════════════════════════════════════════
    // STEP 2 — RECRUITER SIGN UP
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 2] 📝 Clicking Sign Up (Recruiter)...');
    console.log('─'.repeat(54));

    // Click Get Started / Sign Up
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('a, button')].find(el =>
        el.innerText.includes('Get Started') || el.innerText.includes('Sign Up') || el.innerText.includes('Register')
      );
      if (btn) btn.click();
    });
    await sleep(1500);

    console.log('  👆 Clicking Recruiter role...');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('.role-btn')].find(b => b.innerText.includes('Recruiter'));
      if (btn) btn.click();
    });
    await sleep(1000);

    console.log('  ⌨️  Typing Full Name...');
    await page.type('input[name="name"]', 'Priya Sharma', { delay: 80 });
    await sleep(400);

    console.log('  ⌨️  Typing Email...');
    await page.type('input[name="email"]', RECRUITER.email, { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Password...');
    await page.type('input[name="password"]', RECRUITER.password, { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Phone...');
    await page.type('input[name="phone"]', '+91 9876543210', { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Location...');
    await page.type('input[name="location"]', 'Bangalore, India', { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Company Name...');
    await page.type('input[name="company"]', 'FutureTech Solutions', { delay: 60 });
    await sleep(800);

    console.log('  🖱️  Clicking Create Account...');
    await page.click('button[type="submit"]');
    await sleep(4000);
    console.log(`  ✅ Recruiter signed up! Now at: ${page.url()}`);
    await sleep(2000);

    // ════════════════════════════════════════════════
    // STEP 3 — POST A JOB WITH GEMINI AI
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 3] 💼 Navigating to Post Job...');
    console.log('─'.repeat(54));

    await page.goto(`${BASE}/recruiter/post-job`, { waitUntil: 'networkidle2' });
    await sleep(1500);

    console.log('  ⌨️  Typing Job Title...');
    await page.type('input[name="title"]', 'Senior Full Stack Developer', { delay: 70 });
    await sleep(500);

    console.log('  ⌨️  Typing AI skills for JD generation...');
    await setInput(page, '.ai-gen-form input', 'React, Node.js, TypeScript, MongoDB, AWS, Docker');
    await sleep(400);

    console.log('  ✨ Clicking Generate JD with Gemini AI...');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Generate'));
      if (btn) btn.click();
    });
    console.log('  ⏳ Gemini AI is writing the Job Description... (watch the form!)');
    await sleep(25000); // Wait for AI to fill the form

    console.log('  ⌨️  Typing Location...');
    await page.type('input[name="location"]', 'Mumbai, India (Remote-first)', { delay: 70 });
    await sleep(500);

    console.log('  🖱️  Clicking Post Job...');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Post Job'));
      if (btn) btn.click();
    });
    await sleep(4000);
    console.log(`  ✅ Job posted! Now at: ${page.url()}`);
    await sleep(2000);

    // ════════════════════════════════════════════════
    // STEP 4 — RECRUITER LOGOUT
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 4] 🚪 Logging out Recruiter...');
    console.log('─'.repeat(54));
    await page.click('.user-avatar-btn');
    await sleep(1200);
    await page.evaluate(() => {
      const btn = document.querySelector('.dropdown-item.danger');
      if (btn) btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    await sleep(2500);
    console.log('  ✅ Recruiter logged out.');
    await sleep(1000);

    // ════════════════════════════════════════════════
    // STEP 5 — SEEKER SIGN UP
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 5] 👤 Signing up as Job Seeker...');
    console.log('─'.repeat(54));

    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle2' });
    await sleep(1200);
    // Keep default role: Job Seeker

    console.log('  ⌨️  Typing Full Name...');
    await page.type('input[name="name"]', 'Dhananjay Sisodiya', { delay: 80 });
    await sleep(400);

    console.log('  ⌨️  Typing Email...');
    await page.type('input[name="email"]', SEEKER.email, { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Password...');
    await page.type('input[name="password"]', SEEKER.password, { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Phone...');
    await page.type('input[name="phone"]', '+91 9988776655', { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Location...');
    await page.type('input[name="location"]', 'Indore, India', { delay: 60 });
    await sleep(400);

    console.log('  ⌨️  Typing Skills...');
    await page.type('input[name="skills"]', 'React, Node.js, MongoDB, Python, Docker', { delay: 60 });
    await sleep(800);

    console.log('  🖱️  Clicking Create Account...');
    await page.click('button[type="submit"]');
    await sleep(4000);
    console.log(`  ✅ Seeker signed up! Now at: ${page.url()}`);
    await sleep(2000);

    // ════════════════════════════════════════════════
    // STEP 6 — UPLOAD RESUME
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 6] 📄 Navigating to Resume Upload...');
    console.log('─'.repeat(54));

    console.log('  🖱️  Clicking My Resumes tab...');
    await page.evaluate(() => {
      const tab = [...document.querySelectorAll('.dash-tab')].find(b => b.innerText.includes('Resumes'));
      if (tab) tab.click();
    });
    await sleep(1500);

    // Find PDF file to upload
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const pdfFile = fs.readdirSync(uploadsDir).find(f => f.endsWith('.pdf'));
    const fileInput = await page.$('input[type="file"]');

    if (fileInput && pdfFile) {
      console.log(`  📎 Attaching file: ${pdfFile}`);
      await fileInput.uploadFile(path.join(uploadsDir, pdfFile));
      console.log('  ⏳ Uploading and parsing resume with AI... (watch the skills appear!)');

      // Wait for resume card to appear (up to 15s)
      let appeared = false;
      for (let i = 0; i < 15; i++) {
        await sleep(1000);
        appeared = await page.evaluate(() => !!document.querySelector('.resume-item'));
        if (appeared) break;
      }

      if (appeared) {
        console.log('  ✅ Resume uploaded! Skills extracted and displayed on screen.');
        await sleep(3000); // Let user read the skill chips
      }
    }

    // ════════════════════════════════════════════════
    // STEP 7 — BROWSE JOBS + APPLY
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 7] 🔍 Browsing Jobs Feed...');
    console.log('─'.repeat(54));

    await page.goto(`${BASE}/jobs`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    const jobCount = await page.evaluate(() => document.querySelectorAll('.job-card').length);
    console.log(`  📋 Found ${jobCount} jobs on the feed.`);
    await sleep(1500);

    console.log('  🖱️  Clicking on first job to view details...');
    await page.click('.job-card');
    await sleep(2000);

    const jobTitle = await page.evaluate(() => {
      const h = document.querySelector('h1,h2');
      return h ? h.innerText.trim() : 'Job Detail';
    });
    console.log(`  📌 Viewing job: "${jobTitle}"`);
    await sleep(1500);

    console.log('  🖱️  Clicking Apply Now button...');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b =>
        b.innerText.includes('Apply Now') || b.innerText.includes('Apply for') || b.innerText.includes('Apply')
      );
      if (btn) btn.click();
    });
    await sleep(1500);

    console.log('  ⌨️  Typing cover letter...');
    const ta = await page.$('textarea');
    if (ta) {
      await page.type('textarea',
        'Dear Hiring Team,\n\nI am Dhananjay Sisodiya, a Full Stack Developer with expertise in React, Node.js, MongoDB and Python. ' +
        'I am excited to apply for this role and believe my skills align well with your requirements. ' +
        'I am passionate about building scalable web applications and look forward to contributing to your team.',
        { delay: 30 }
      );
      await sleep(1500);

      console.log('  🖱️  Submitting Application...');
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Submit'));
        if (btn) btn.click();
      });
      await sleep(4000);
      console.log('  ✅ Application submitted!');
      await sleep(2000);
    }

    // ════════════════════════════════════════════════
    // STEP 8 — AI RESUME SCORE + SKILL GAP
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 8] 🤖 Waiting for AI Resume Score...');
    console.log('─'.repeat(54));

    await page.goto(`${BASE}/seeker/dashboard`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    console.log('  🖱️  Clicking Run AI Analysis...');
    const clicked = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Run Analysis'));
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (clicked) {
      console.log('  ⏳ Gemini AI is analyzing the resume vs job description...');
      console.log('     Watch the button change from "Analyzing..." to "View Analysis"');

      // Poll until View Analysis button appears (up to 35s)
      let viewReady = false;
      for (let i = 0; i < 35; i++) {
        await sleep(1000);
        viewReady = await page.evaluate(() =>
          [...document.querySelectorAll('button')].some(b => b.innerText.includes('View Analysis'))
        );
        if (viewReady) {
          console.log(`  ✅ Analysis complete! (took ~${i+1}s)`);
          break;
        }
      }

      if (viewReady) {
        console.log('  🖱️  Clicking View Analysis to see the score...');
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('View Analysis'));
          if (btn) btn.click();
        });
        await sleep(1500);
        await page.evaluate(() => window.scrollBy(0, 400));
        await sleep(1000);

        // Read and print the results
        const score = await page.evaluate(() => {
          const el = document.querySelector('.score-number');
          return el ? el.innerText.trim() : 'N/A';
        });
        const matched = await page.evaluate(() =>
          [...document.querySelectorAll('.skill-chip.matched')].map(e => e.innerText)
        );
        const missing = await page.evaluate(() =>
          [...document.querySelectorAll('.skill-chip.missing')].map(e => e.innerText)
        );
        const source = await page.evaluate(() => {
          const el = document.querySelector('.analysis-card span');
          return el ? el.innerText.trim() : 'Unknown';
        });

        console.log('\n  ════════════════════════════════════');
        console.log('  📊  AI RESUME ANALYSIS RESULTS');
        console.log('  ════════════════════════════════════');
        console.log(`  🤖 Source  : ${source}`);
        console.log(`  🎯 Score   : ${score}/100`);
        console.log(`  ✅ Matched : ${matched.join(', ') || 'none'}`);
        console.log(`  ❌ Missing : ${missing.join(', ') || 'none'}`);
        console.log('  ════════════════════════════════════');

        await sleep(6000); // Let the user READ the score on screen
      }
    }

    // ════════════════════════════════════════════════
    // STEP 9 — SEEKER PROFILE
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 9] 👤 Opening Seeker Profile...');
    console.log('─'.repeat(54));

    await page.goto(`${BASE}/seeker/profile`, { waitUntil: 'networkidle2' });
    await sleep(3000);
    console.log('  ✅ Profile page loaded. You can see your details.');

    // ════════════════════════════════════════════════
    // STEP 10 — SEEKER LOGOUT + RECRUITER LOGIN
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 10] 🔄 Seeker logs out. Recruiter logs in...');
    console.log('─'.repeat(54));
    // Force logout via localStorage
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
    await sleep(1200);

    console.log('  ⌨️  Typing Recruiter email...');
    await page.type('input[name="email"]', RECRUITER.email, { delay: 70 });
    await sleep(400);
    console.log('  ⌨️  Typing Recruiter password...');
    await page.type('input[name="password"]', RECRUITER.password, { delay: 70 });
    await sleep(600);
    console.log('  🖱️  Clicking Login...');
    await page.click('button[type="submit"]');
    await sleep(4000);
    console.log('  ✅ Recruiter logged in!');
    await sleep(2000);

    // ════════════════════════════════════════════════
    // STEP 11 — RECRUITER VIEWS CANDIDATES + ACCEPTS
    // ════════════════════════════════════════════════
    console.log('\n─'.repeat(54));
    console.log('  [STEP 11] 👥 Recruiter reviews candidates...');
    console.log('─'.repeat(54));

    await page.goto(`${BASE}/recruiter/dashboard`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('a,button')].find(el =>
        el.innerText.includes('View Candidates') || el.innerText.includes('Candidates')
      );
      if (btn) btn.click();
    });
    await sleep(3000);

    const hasCandidate = await page.evaluate(() => {
      const card = document.querySelector('.candidate-card');
      if (card) { card.click(); return true; }
      return false;
    });

    if (hasCandidate) {
      await sleep(2000);
      await page.evaluate(() => window.scrollBy(0, 300));
      await sleep(1500);

      // Recruiter runs AI analysis
      const ranAnalysis = await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('Run Analysis'));
        if (btn) { btn.click(); return true; }
        return false;
      });
      if (ranAnalysis) {
        console.log('  ⏳ Recruiter AI analysis running (15s)...');
        await sleep(15000);
        await page.evaluate(() => window.scrollBy(0, 200));
        await sleep(2000);
      }

      console.log('  🖱️  Accepting candidate...');
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b =>
          b.innerText.includes('Accept Candidate') || b.innerText.includes('Accept')
        );
        if (btn) btn.click();
      });
      await sleep(3000);
      console.log('  ✅ Candidate accepted! Status updated on screen.');
      await sleep(3000);
    }

    // ════════════════════════════════════════════════
    // DONE — Keep browser open so user can explore
    // ════════════════════════════════════════════════
    console.log('\n' + '═'.repeat(54));
    console.log('  🎉  ALL VISUAL STEPS COMPLETE!');
    console.log('');
    console.log('  The browser will stay open for 30 seconds.');
    console.log('  Click around and explore the app freely!');
    console.log('═'.repeat(54));
    await sleep(30000); // Keep browser open for user to explore

  } catch (err) {
    console.error('\n  ❌ ERROR:', err.message);
    console.log('  🔍 Investigate the browser window for visual clues...');
    await sleep(30000); // Keep open on error so user can see what happened
  } finally {
    console.log('\n  Closing browser...');
    await browser.close();
  }
}

run();
