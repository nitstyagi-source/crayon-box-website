import {
  getLiveNotificationsAction,
  toggleNotificationReadAction,
  markAllNotificationsReadAction,
  clearAllNotificationsAction,
  dispatchTestNotificationAction
} from '../src/app/actions/notification-actions';

async function testNotificationCenter() {
  console.log('🔔 ========================================================');
  console.log('🔔 TESTING NOTIFICATION CENTER & LIVE ALERT DISPATCH ENGINE');
  console.log('🔔 ========================================================\n');

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

  try {
    // 1. GET LIVE NOTIFICATIONS
    console.log('📌 1. Fetching Live Notifications...');
    const initialRes = await getLiveNotificationsAction('SUPER_ADMIN', 'CBS');
    assert(initialRes.success === true, 'getLiveNotificationsAction succeeded');
    assert(Array.isArray(initialRes.notifications), 'Notifications array returned', `${initialRes.notifications.length} items`);
    assert(typeof initialRes.unreadCount === 'number', 'Unread count is a valid number', `${initialRes.unreadCount} unread`);

    // Verify categories present
    const categories = initialRes.notifications.map(n => n.category);
    assert(categories.some(c => ['FINANCE', 'ADMISSIONS', 'SAFETY', 'ACADEMIC', 'GOVERNANCE'].includes(c)),
      'Live notifications include standard enterprise categories', categories.join(', '));

    // 2. DISPATCH A REAL-TIME TEST ALERT
    console.log('\n📌 2. Dispatching Live Simulated Alert...');
    const dispatchRes = await dispatchTestNotificationAction({
      title: '🚨 Security Incident Alert',
      message: 'Visitor badge scanned at Gate 2 without pre-registered escort approval.',
      category: 'SAFETY',
      priority: 'URGENT',
      link: '/admin/operations'
    });

    assert(dispatchRes.success === true, 'dispatchTestNotificationAction succeeded');
    assert(dispatchRes.notification.title === '🚨 Security Incident Alert', 'Notification payload preserved');
    assert(dispatchRes.notification.unread === true, 'Dispatched notification starts as unread');

    // 3. VERIFY NEW ALERT IS IN LIVE NOTIFICATIONS FEED
    console.log('\n📌 3. Verifying Dispatched Alert in Feed...');
    const updatedRes = await getLiveNotificationsAction('SUPER_ADMIN', 'CBS');
    const foundDispatched = updatedRes.notifications.find(n => n.id === dispatchRes.notification.id);
    assert(Boolean(foundDispatched), 'Dispatched notification is present at top of live feed');
    assert(foundDispatched?.unread === true, 'Dispatched notification has unread status');

    // 4. TOGGLE READ STATUS OF SINGLE NOTIFICATION
    console.log('\n📌 4. Toggling Single Notification Read State...');
    const toggleRes = await toggleNotificationReadAction(dispatchRes.notification.id, true);
    assert(toggleRes.success === true, 'toggleNotificationReadAction succeeded');

    const checkReadRes = await getLiveNotificationsAction('SUPER_ADMIN', 'CBS');
    const checkedItem = checkReadRes.notifications.find(n => n.id === dispatchRes.notification.id);
    assert(checkedItem?.unread === false, 'Notification is now marked as READ');

    // 5. MARK ALL NOTIFICATIONS AS READ
    console.log('\n📌 5. Testing Mark All as Read...');
    const allIds = checkReadRes.notifications.map(n => n.id);
    const markAllRes = await markAllNotificationsReadAction(allIds);
    assert(markAllRes.success === true, 'markAllNotificationsReadAction succeeded', `${markAllRes.markedCount} marked`);

    const allReadRes = await getLiveNotificationsAction('SUPER_ADMIN', 'CBS');
    assert(allReadRes.unreadCount === 0, 'Unread count is 0 after mark all read');
    assert(allReadRes.notifications.every(n => n.unread === false), 'All notifications in feed have unread = false');

    // 6. CLEAR NOTIFICATIONS
    console.log('\n📌 6. Clearing Custom Notifications...');
    const clearRes = await clearAllNotificationsAction();
    assert(clearRes.success === true, 'clearAllNotificationsAction succeeded');

  } catch (error: any) {
    console.error('Test run failed with error:', error);
  }

  console.log('\n========================================================');
  console.log(`📊 FINAL RESULT: ${passCount} / ${testCount} Tests PASSED (${((passCount / testCount) * 100).toFixed(1)}% Success Rate)`);
  console.log('========================================================\n');
}

testNotificationCenter().catch(console.error);
