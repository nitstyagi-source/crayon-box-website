import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  superAdminPage: Page;
  teacherPage: Page;
  parentPage: Page;
};

export const test = base.extend<AuthFixtures>({
  superAdminPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const url = new URL(baseURL || 'http://localhost:3000');
    await context.addCookies([
      { name: 'cb_auth_token', value: 'playwright-super-admin-token', domain: url.hostname, path: '/' },
      { name: 'cb_user_role', value: 'SUPER_ADMIN', domain: url.hostname, path: '/' },
      { name: 'cb_user_email', value: 'nits.tyagi@gmail.com', domain: url.hostname, path: '/' },
      { name: 'cb_user_name', value: 'Nitin Tyagi (Chairman)', domain: url.hostname, path: '/' },
    ]);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  teacherPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const url = new URL(baseURL || 'http://localhost:3000');
    await context.addCookies([
      { name: 'cb_auth_token', value: 'playwright-teacher-token', domain: url.hostname, path: '/' },
      { name: 'cb_user_role', value: 'TEACHER', domain: url.hostname, path: '/' },
      { name: 'cb_user_email', value: 'teacher.anita@crayonboxschool.edu.in', domain: url.hostname, path: '/' },
      { name: 'cb_user_name', value: 'Anita Sharma', domain: url.hostname, path: '/' },
    ]);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  parentPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext();
    const url = new URL(baseURL || 'http://localhost:3000');
    await context.addCookies([
      { name: 'cb_auth_token', value: 'playwright-parent-token', domain: url.hostname, path: '/' },
      { name: 'cb_user_role', value: 'PARENT', domain: url.hostname, path: '/' },
      { name: 'cb_user_email', value: 'parent.test@crayonboxschool.edu.in', domain: url.hostname, path: '/' },
      { name: 'cb_user_name', value: 'Test Parent', domain: url.hostname, path: '/' },
    ]);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

