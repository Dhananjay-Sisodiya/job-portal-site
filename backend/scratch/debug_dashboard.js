const puppeteer = require('puppeteer');

async function debugDashboard() {
  console.log('🤖 Debugging Seeker Dashboard...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // Navigate to login
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    
    // Fill credentials
    await page.type('input[type="email"]', 'seeker_ui_1786616501109@test.com');
    await page.type('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('✅ Logged in. Current URL:', page.url());

    // Print text on the dashboard
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\n--- BODY TEXT ON DASHBOARD ---');
    console.log(bodyText);
    console.log('-------------------------------\n');

    // Print all buttons on dashboard
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText,
        visible: b.offsetWidth > 0 && b.offsetHeight > 0
      }));
    });
    console.log('Buttons found:', buttons);

    await page.screenshot({ path: 'screenshots/debug_dashboard_view.png' });
    console.log('✅ Screenshot saved to screenshots/debug_dashboard_view.png');

  } catch (err) {
    console.error('❌ Error during debug:', err.message);
  } finally {
    await browser.close();
  }
}

debugDashboard();
