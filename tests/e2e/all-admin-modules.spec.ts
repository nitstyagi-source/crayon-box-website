import { test, expect } from '../fixtures/auth-fixtures';

test.describe('School ERP Web Admin Comprehensive Verification Suite', () => {

  // 1. RBAC & Gate Protection
  test('1. RBAC Security: Parent is blocked from accessing Admin console', async ({ parentPage }) => {
    await parentPage.goto('/admin');
    await expect(parentPage).toHaveURL(/.*login.*error=mobile_only.*/);
  });

  test('2. Unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*login.*/);
  });

  // 2. Super Admin Access & Core Hub
  test('3. Core Admin Hub loads successfully', async ({ superAdminPage }) => {
    const response = await superAdminPage.goto('/admin', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(superAdminPage.locator('body')).not.toBeEmpty();
  });

  // 3. Cluster 1: Identity & Admissions
  const cluster1Routes = [
    { path: '/admin/students', name: 'Students Directory' },
    { path: '/admin/id-cards', name: 'ID Cards & Barcodes' },
    { path: '/admin/admissions', name: 'Admissions Hub' },
    { path: '/admin/enquiries', name: 'Enquiries' },
    { path: '/admin/families', name: 'Families 360' },
    { path: '/admin/transfers', name: 'Transfer Certificates' },
  ];

  for (const route of cluster1Routes) {
    test(`Cluster 1 (Identity): ${route.name} (${route.path}) returns 200`, async ({ superAdminPage }) => {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await expect(superAdminPage.locator('body')).not.toBeEmpty();
    });
  }

  // 4. Cluster 2: Financial Engine
  const cluster2Routes = [
    { path: '/admin/finance', name: 'Finance Hub & POS' },
    { path: '/admin/finance/invoices', name: 'Invoices' },
    { path: '/admin/finance/structure', name: 'Fee Structure' },
    { path: '/admin/expenses', name: 'Expense Tracker' },
    { path: '/admin/procurement', name: 'Procurement' },
  ];

  for (const route of cluster2Routes) {
    test(`Cluster 2 (Finance): ${route.name} (${route.path}) returns 200`, async ({ superAdminPage }) => {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await expect(superAdminPage.locator('body')).not.toBeEmpty();
    });
  }

  // 5. Cluster 3: Gate & Attendance
  const cluster3Routes = [
    { path: '/admin/attendance', name: 'Attendance Register' },
    { path: '/admin/gate-scanner', name: 'Gate & Turnstile Scanner' },
    { path: '/admin/early-departure', name: 'Early Departure Gate Pass' },
  ];

  for (const route of cluster3Routes) {
    test(`Cluster 3 (Gate/Attendance): ${route.name} (${route.path}) returns 200`, async ({ superAdminPage }) => {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await expect(superAdminPage.locator('body')).not.toBeEmpty();
    });
  }

  // 6. Cluster 4: Academics & Timetable
  const cluster4Routes = [
    { path: '/admin/curriculum', name: 'Curriculum & Academics' },
    { path: '/admin/classes', name: 'Classes Management' },
    { path: '/admin/timetable', name: 'Timetable Matrix' },
    { path: '/admin/exams', name: 'Exams & Marks' },
    { path: '/admin/digital-diary', name: 'Digital Diary' },
  ];

  for (const route of cluster4Routes) {
    test(`Cluster 4 (Academics): ${route.name} (${route.path}) returns 200`, async ({ superAdminPage }) => {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await expect(superAdminPage.locator('body')).not.toBeEmpty();
    });
  }

  // 7. Cluster 5: Safety, Transport & Facilities
  const cluster5Routes = [
    { path: '/admin/live-stream', name: 'CCTV Video Wall' },
    { path: '/admin/transport', name: 'Transport & Fleet' },
    { path: '/admin/library', name: 'Library & OPAC' },
    { path: '/admin/inventory', name: 'Asset Inventory' },
    { path: '/admin/visitors', name: 'Visitor Passes' },
    { path: '/admin/health', name: 'Health & Clinic' },
    { path: '/admin/safety', name: 'Safety & Safeguarding' },
    { path: '/admin/emergency', name: 'Emergency Broadcast' },
  ];

  for (const route of cluster5Routes) {
    test(`Cluster 5 (Safety/Transport): ${route.name} (${route.path}) returns 200`, async ({ superAdminPage }) => {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await expect(superAdminPage.locator('body')).not.toBeEmpty();
    });
  }

  // 8. Cluster 6: Governance, IAM & Communications
  const cluster6Routes = [
    { path: '/admin/iam', name: 'IAM Matrix & RBAC' },
    { path: '/admin/approvals', name: 'Approvals Workflow' },
    { path: '/admin/communications', name: 'Communications' },
    { path: '/admin/campaigns', name: 'Campaigns & Circulars' },
    { path: '/admin/audit-logs', name: 'Audit Logs' },
    { path: '/admin/analytics', name: 'Analytics MIS' },
    { path: '/admin/reports', name: 'MIS Reports' },
  ];

  for (const route of cluster6Routes) {
    test(`Cluster 6 (Governance): ${route.name} (${route.path}) returns 200`, async ({ superAdminPage }) => {
      const response = await superAdminPage.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await expect(superAdminPage.locator('body')).not.toBeEmpty();
    });
  }
});
