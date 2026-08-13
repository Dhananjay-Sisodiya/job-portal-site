const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function testUploadOnly() {
  console.log('🤖 Testing resume tab switching and upload selectors...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Login
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'seeker_ui_1786616501109@test.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('1. On Dashboard. Active tab buttons:');
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.dash-tab')).map(b => b.innerText);
    });
    console.log(buttons);

    // Click tab
    console.log('2. Clicking My Resumes tab...');
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('.dash-tab')).find(b => b.innerText.includes('Resumes'));
      if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 1500));

    // Check if input is present
    const hasInput = await page.evaluate(() => {
      const input = document.querySelector('input[type="file"]');
      return input ? {
        id: input.id,
        accept: input.accept,
        display: window.getComputedStyle(input).display,
        opacity: window.getComputedStyle(input).opacity
      } : null;
    });
    
    console.log('3. File input check after tab click:', hasInput);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testUploadOnly();
