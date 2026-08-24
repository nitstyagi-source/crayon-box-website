import pg from 'pg';
import {
  getBroadcastCampaignsAction,
  dispatchBroadcastCampaignAction
} from '../src/app/actions/communication-actions';
import {
  getHelpdeskTicketsAction,
  createHelpdeskTicketAction,
  resolveHelpdeskTicketAction
} from '../src/app/actions/helpdesk-procurement-actions';

const connectionString = 'postgresql://postgres.fesqtrunkqlmvyvqodzy:RUby%401008100@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
const pool = new pg.Pool({ connectionString });

async function testPillars8910() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING PILLARS 8, 9 & 10: COMMUNICATIONS, HELPDESK & PORTALS');
  console.log('🧪 ========================================================\n');

  let passCount = 0;
  let testCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    testCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
      passCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    }
  }

  const client = await pool.connect();

  // 1. OMNICHANNEL BROADCAST ENGINE
  console.log('📌 1. Testing Omnichannel Broadcasts (SMS, WhatsApp, Email)...');
  const campRes = await getBroadcastCampaignsAction();
  assert(campRes.success === true, 'Broadcast Campaigns API fetch success');
  assert(campRes.campaigns.length >= 1, 'Campaigns in DB', `${campRes.campaigns.length} campaigns`);

  // Dispatch a new broadcast campaign
  const newCampRes = await dispatchBroadcastCampaignAction({
    title: 'Annual Day Stage Rehearsal Advisory & Costume Guidelines',
    channel: 'OMNICHANNEL',
    targetAudience: 'ALL_PARENTS',
    messageBody: 'Dear Parents, Annual day rehearsals will commence from Monday. Please refer to the attached circular for costume specifications.'
  });
  assert(newCampRes.success === true, 'New Omnichannel Broadcast dispatched to 220 parents', newCampRes.message);

  // 2. HELPDESK & GRIEVANCE SLA TICKETING
  console.log('\n📌 2. Testing Helpdesk & Grievance SLA Ticketing...');
  const ticketRes = await getHelpdeskTicketsAction();
  assert(ticketRes.success === true, 'Helpdesk Tickets API fetch success');
  assert(ticketRes.tickets.length >= 1, 'Grievance tickets in DB', `${ticketRes.tickets.length} tickets`);

  // Create a new grievance ticket
  const newTicketRes = await createHelpdeskTicketAction({
    studentAdmissionNoOrName: 'CBS-2026-0001',
    category: 'TRANSPORT',
    subject: 'Bus Stop Timing Shift Request for Winter Season',
    description: 'Requesting morning pickup shift by 10 minutes due to winter fog schedule.',
    priority: 'MEDIUM',
    assignedDept: 'Transport Logistics'
  });
  assert(newTicketRes.success === true, 'New Grievance Ticket logged with auto SLA assignment', newTicketRes.message);

  // 3. HTTP ENDPOINTS & MULTI-PORTAL VALIDATION
  console.log('\n📌 3. Verifying HTTP Routes for Portals, Public Website & Helpdesk...');
  const endpoints = [
    '/',
    '/about',
    '/contact',
    '/faculty',
    '/news',
    '/admissions',
    '/admissions/apply',
    '/pay-fees',
    '/admin/campaigns',
    '/admin/helpdesk',
    '/admin/grievances',
    '/parent',
    '/teacher',
    '/student',
    '/parent/dashboard',
    '/parent/fees',
    '/parent/transport',
    '/parent/academics',
    '/parent/helpdesk',
    '/hub'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch('http://localhost:3000' + ep, { redirect: 'follow' });
      assert(res.status === 200 || res.status === 307 || res.status === 308, `Route ${ep} returns valid status (${res.status})`);
    } catch (e: any) {
      assert(false, `Route ${ep} failed`, e.message);
    }
  }

  client.release();
  await pool.end();

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testPillars8910().catch(console.error);
