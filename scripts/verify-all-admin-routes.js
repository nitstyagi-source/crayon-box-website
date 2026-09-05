const fs = require('fs');
const http = require('http');

async function testRoute(path, cookie = '') {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Cookie': cookie,
        'User-Agent': 'ERP-Verification-Crawler/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const isError = data.includes('Unhandled Runtime Error') || 
                        data.includes('Application error: a server-side exception has occurred') ||
                        res.statusCode >= 500;
        resolve({
          path,
          status: res.statusCode,
          location: res.headers.location || null,
          size: data.length,
          duration,
          hasError: isError
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        path,
        status: 0,
        error: err.message,
        duration: Date.now() - startTime,
        hasError: true
      });
    });

    req.end();
  });
}

async function main() {
  console.log('================================================================');
  console.log(' 🛡️  SCHOOL ERP AUTOMATED WEB MODULE VERIFICATION SUITE');
  console.log('================================================================\n');

  // 1. RBAC & Gate Security Checks
  console.log('STEP 1: Testing RBAC & Security Perimeter...');
  
  // Unauthenticated
  const unauth = await testRoute('/admin');
  console.log(` • Unauthenticated -> ${unauth.status} (Redirect to: ${unauth.location}) [${unauth.status === 307 && unauth.location.includes('/login') ? '✓ PASS' : '✗ FAIL'}]`);

  // Parent Role
  const parentAuth = await testRoute('/admin', 'cb_auth_token=parent-test; cb_user_role=PARENT; cb_user_email=parent@test.com');
  console.log(` • Parent blocked from Admin -> ${parentAuth.status} (Redirect to: ${parentAuth.location}) [${parentAuth.status === 307 && parentAuth.location.includes('mobile_only') ? '✓ PASS' : '✗ FAIL'}]`);

  // Super Admin Role
  const adminCookie = 'cb_auth_token=super-admin-test; cb_user_role=SUPER_ADMIN; cb_user_email=nits.tyagi@gmail.com; cb_user_name=Nitin+Tyagi';
  const superAdmin = await testRoute('/admin', adminCookie);
  console.log(` • Super Admin Hub Access -> ${superAdmin.status} (${superAdmin.size} bytes, ${superAdmin.duration}ms) [${superAdmin.status === 200 ? '✓ PASS' : '✗ FAIL'}]\n`);

  // 2. Comprehensive Route Crawl
  const manifest = JSON.parse(fs.readFileSync('.next/app-path-routes-manifest.json', 'utf8'));
  const routes = Object.values(manifest)
    .filter(r => r.startsWith('/admin') && !r.includes('[') && r !== '/admin')
    .sort();

  console.log(`STEP 2: Crawling all ${routes.length} static Admin Modules...\n`);

  let passed = 0;
  let failed = 0;
  let redirects = 0;
  const failureDetails = [];

  for (const route of routes) {
    const result = await testRoute(route, adminCookie);
    if (result.hasError) {
      failed++;
      failureDetails.push(result);
      console.log(` ✗ [${result.status}] ${route} (${result.duration}ms) - ERROR`);
    } else if (result.status === 200) {
      passed++;
      // Print progress periodically or for critical modules
      if (passed % 15 === 0 || route.includes('id-cards') || route.includes('finance') || route.includes('gate') || route.includes('students')) {
        console.log(` ✓ [200 OK] ${route} (${result.size} B, ${result.duration}ms)`);
      }
    } else if (result.status === 307 || result.status === 308) {
      redirects++;
      console.log(` ↳ [${result.status} REDIRECT] ${route} -> ${result.location}`);
    } else {
      console.log(` ? [${result.status}] ${route} (${result.duration}ms)`);
    }
  }

  console.log('\n================================================================');
  console.log(` RESULTS SUMMARY:`);
  console.log(` • Total Admin Routes Crawled: ${routes.length}`);
  console.log(` • Healthy (200 OK):          ${passed}`);
  console.log(` • Redirects:                 ${redirects}`);
  console.log(` • Failed / Broken (5xx):     ${failed}`);
  console.log(` • Success Rate:              ${((passed / (routes.length - redirects)) * 100).toFixed(1)}%`);
  console.log('================================================================');

  if (failed > 0) {
    console.log('\nFailed Routes:');
    failureDetails.forEach(f => console.log(` - ${f.path}: HTTP ${f.status} (${f.error || 'Server Exception'})`));
  }
}

main().catch(console.error);
