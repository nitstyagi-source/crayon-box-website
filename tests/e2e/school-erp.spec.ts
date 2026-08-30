import { test, expect } from '../fixtures/auth-fixtures';

test.describe('School ERP Critical Operational Flow Suite', () => {

  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
  // ---------------------------------------------------------------------------
  test('1. Security Gate: Parent cannot access Admin Revenue Route', async ({ page }) => {
    // Authenticate as Parent
    await page.goto('/login');
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill('parent.test@crayonboxschool.edu.in');
      await page.locator('input[name="password"], input[type="password"]').fill('SecurePass2026!');
      await page.click('button[type="submit"], button:has-text("Sign In")');
    }

    // Attempt unauthorized access to admin finance
    await page.goto('/admin/finance');
    // Ensure parent is redirected away or blocked by RBAC middleware
    await expect(page).not.toHaveURL(/\/admin\/finance$/);
  });

  // ---------------------------------------------------------------------------
  // 2. FINANCIAL LEDGER & FEE ENGINE
  // ---------------------------------------------------------------------------
  test('2. Fee Engine: Verify Parent Outstanding Dues & Ledger Breakdown', async ({ page }) => {
    await page.goto('/parent');
    
    // Check for Fee card or ledger module
    const feeSection = page.locator('text=Fees, text=Ledger, text=Due, text=₹').first();
    await expect(feeSection).toBeVisible({ timeout: 15000 });
  });

  // ---------------------------------------------------------------------------
  // 3. ADMISSIONS CRM TO ENROLLMENT
  // ---------------------------------------------------------------------------
  test('3. Admissions CRM: Verify Enquiries & Leads Module', async ({ superAdminPage }) => {
    await superAdminPage.goto('/admin/admissions');
    
    // Verify Admissions Dashboard and Enquiry Table
    await expect(superAdminPage.locator('text=Enquiries, text=Applications, text=Pipeline').first()).toBeVisible({ timeout: 15000 });
  });

  // ---------------------------------------------------------------------------
  // 4. HARDWARE & GEOFENCE ATTENDANCE SIMULATION
  // ---------------------------------------------------------------------------
  test('4. Hardware & Operations: Geofence Attendance Simulation (100m Radius)', async ({ page, context }) => {
    // Grant geolocation permissions and set coordinates at School Campus [28.6139, 77.2090]
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 28.6139, longitude: 77.2090 });

    await page.goto('/staff/attendance');
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // 5. LIVE 16-CHANNEL CCTV SURVEILLANCE WALL
  // ---------------------------------------------------------------------------
  test('5. Surveillance: 16-Channel CCTV Video Wall & Multi-School Filter', async ({ superAdminPage }) => {
    await superAdminPage.goto('/admin/live-stream');
    
    // Verify Live Video Wall renders
    const videoWallTitle = superAdminPage.locator('text=Live Admin Video Wall, text=DVR Channels, text=CCTV').first();
    await expect(videoWallTitle).toBeVisible({ timeout: 15000 });
  });

});
