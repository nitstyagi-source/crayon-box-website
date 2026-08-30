import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  superAdminPage: Page;
  teacherPage: Page;
  parentPage: Page;
};

export const test = base.extend<AuthFixtures>({
  superAdminPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Authenticate as Super Administrator
    await page.goto('/login');
    if (await page.locator('input[name="email"], input[type="email"]').count() > 0) {
      await page.fill('input[name="email"], input[type="email"]', 'admin@crayonboxschool.edu.in');
      await page.fill('input[name="password"], input[type="password"]', 'AdminSecret2026!');
      await page.click('button[type="submit"], button:has-text("Sign In")');
      await page.waitForLoadState('networkidle');
    }
    
    await use(page);
    await context.close();
  },

  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Authenticate as Teacher / Faculty
    await page.goto('/login');
    if (await page.locator('input[name="email"], input[type="email"]').count() > 0) {
      await page.fill('input[name="email"], input[type="email"]', 'teacher.anita@crayonboxschool.edu.in');
      await page.fill('input[name="password"], input[type="password"]', 'TeacherPass2026!');
      await page.click('button[type="submit"], button:has-text("Sign In")');
      await page.waitForLoadState('networkidle');
    }
    
    await use(page);
    await context.close();
  },

  parentPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Authenticate as Parent
    await page.goto('/login');
    if (await page.locator('input[name="email"], input[type="email"]').count() > 0) {
      await page.fill('input[name="email"], input[type="email"]', 'parent.test@crayonboxschool.edu.in');
      await page.fill('input[name="password"], input[type="password"]', 'SecurePass2026!');
      await page.click('button[type="submit"], button:has-text("Sign In")');
      await page.waitForLoadState('networkidle');
    }
    
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
