const { chromium } = require('playwright');
const path = require('path');

async function verifyUiWithTestData() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  // Set Super Admin authentication cookies
  await context.addCookies([
    { name: 'cb_auth_token', value: 'cb_token_super_admin_test', domain: 'localhost', path: '/' },
    { name: 'cb_user_role', value: 'SUPER_ADMIN', domain: 'localhost', path: '/' },
    { name: 'cb_user_email', value: 'admin@crayonboxschool.com', domain: 'localhost', path: '/' },
    { name: 'cb_user_name', value: 'Nitin Tyagi (Chairman)', domain: 'localhost', path: '/' }
  ]);

  const page = await context.newPage();
  const artifactsDir = '/Users/vaani/.gemini/antigravity/brain/207c2250-55c0-4268-91f8-877558915943';

  console.log('1. Verifying Admissions CRM Pipeline with 25 Test Enquiries...');
  await page.goto('http://localhost:3000/admin/admissions?tab=pipeline', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'testdata_admissions_pipeline.png'), fullPage: true });

  console.log('2. Verifying Attendance Command Center with 150 student-days...');
  await page.goto('http://localhost:3000/admin/attendance', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'testdata_attendance_command.png'), fullPage: true });

  console.log('3. Verifying Finance Hub with Reconciled Transactions...');
  await page.goto('http://localhost:3000/admin/finance', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactsDir, 'testdata_finance_ledger.png'), fullPage: true });

  await browser.close();
  console.log('UI verification with test dataset complete!');
}

verifyUiWithTestData().catch(err => {
  console.error('UI Verification Error:', err);
  process.exit(1);
});
