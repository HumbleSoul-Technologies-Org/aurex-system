const API_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE || 'http://localhost:5454/api').replace(/\/+$/, '');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.AUTH_TOKEN || '';
const PROPERTY_MANAGER_TOKEN = process.env.PROPERTY_MANAGER_TOKEN || '';
const TENANT_TOKEN = process.env.TENANT_TOKEN || '';
const ADMIN_ID = process.env.ADMIN_ID || process.env.OWNER_ID || '';
const PROPERTY_ID = process.env.PROPERTY_ID || '';
const TENANT_ID = process.env.TENANT_ID || '';
const SETTINGS_ID = process.env.SETTINGS_ID || '';
const DEFAULT_TOKEN = ADMIN_TOKEN || PROPERTY_MANAGER_TOKEN || TENANT_TOKEN || '';

function getHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function request(path, token) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method: 'GET',
    headers: getHeaders(token),
  };

  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = text;
  }

  return { status: res.status, data, ok: res.ok, url };
}

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

const tests = [
  {
    name: 'Auth current user',
    path: '/auth/me',
    token: DEFAULT_TOKEN,
    expected: [200],
    requires: [DEFAULT_TOKEN],
    skipIfMissing: 'ADMIN_TOKEN or PROPERTY_MANAGER_TOKEN or TENANT_TOKEN',
  },
  {
    name: 'Property list /property/all',
    path: '/property/all',
    token: '',
    expected: [200],
  },
  {
    name: 'Property list /property/:adminId/all',
    path: () => `/property/${ADMIN_ID}/all`,
    token: ADMIN_TOKEN,
    expected: [200],
    requires: [ADMIN_ID, ADMIN_TOKEN],
    skipIfMissing: 'ADMIN_ID and ADMIN_TOKEN',
  },
  {
    name: 'Property self /property/:propertyId/self',
    path: () => `/property/${PROPERTY_ID}/self`,
    token: TENANT_TOKEN,
    expected: [200, 403, 404],
    requires: [PROPERTY_ID, TENANT_TOKEN],
    skipIfMissing: 'PROPERTY_ID and TENANT_TOKEN',
  },
  {
    name: 'Tenant list /tenant/:tenantId/all',
    path: () => `/tenant/${TENANT_ID}/all`,
    token: ADMIN_TOKEN,
    expected: [200, 404],
    requires: [TENANT_ID, ADMIN_TOKEN],
    skipIfMissing: 'TENANT_ID and ADMIN_TOKEN',
  },
  {
    name: 'Tenant self /tenant/:tenantId/self',
    path: () => `/tenant/${TENANT_ID}/self`,
    token: TENANT_TOKEN,
    expected: [200, 403, 404],
    requires: [TENANT_ID, TENANT_TOKEN],
    skipIfMissing: 'TENANT_ID and TENANT_TOKEN',
  },
  {
    name: 'Payments list /payments/all',
    path: '/payments/all',
    token: ADMIN_TOKEN,
    expected: [200, 401, 403],
    requires: [ADMIN_TOKEN],
    skipIfMissing: 'ADMIN_TOKEN',
  },
  {
    name: 'Payments for tenant /payments/tenant/:tenantId/all',
    path: () => `/payments/tenant/${TENANT_ID}/all`,
    token: TENANT_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [TENANT_ID, TENANT_TOKEN],
    skipIfMissing: 'TENANT_ID and TENANT_TOKEN',
  },
  {
    name: 'Payments for property /payments/property/:propertyId/all (admin)',
    path: () => `/payments/property/${PROPERTY_ID}/all`,
    token: ADMIN_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [PROPERTY_ID, ADMIN_TOKEN],
    skipIfMissing: 'PROPERTY_ID and ADMIN_TOKEN',
  },
  {
    name: 'Payments for property /payments/property/:propertyId/all (property manager)',
    path: () => `/payments/property/${PROPERTY_ID}/all`,
    token: PROPERTY_MANAGER_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [PROPERTY_ID, PROPERTY_MANAGER_TOKEN],
    skipIfMissing: 'PROPERTY_ID and PROPERTY_MANAGER_TOKEN',
  },
  {
    name: 'Settings current user /settings',
    path: '/settings',
    token: DEFAULT_TOKEN,
    expected: [200, 401, 403],
    requires: [DEFAULT_TOKEN],
    skipIfMissing: 'ADMIN_TOKEN or PROPERTY_MANAGER_TOKEN or TENANT_TOKEN',
  },
  {
    name: 'Settings by ID /settings/:settingsId',
    path: () => `/settings/${SETTINGS_ID}`,
    token: DEFAULT_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [SETTINGS_ID, DEFAULT_TOKEN],
    skipIfMissing: 'SETTINGS_ID and ADMIN_TOKEN/PROPERTY_MANAGER_TOKEN/TENANT_TOKEN',
  },
  {
    name: 'Settings by tenant /settings/tenant/:tenantId',
    path: () => `/settings/tenant/${TENANT_ID}`,
    token: ADMIN_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [TENANT_ID, ADMIN_TOKEN],
    skipIfMissing: 'TENANT_ID and ADMIN_TOKEN',
  },
  {
    name: 'Messages owner /messages/owner/:ownerId/all',
    path: () => `/messages/owner/${ADMIN_ID}/all`,
    token: ADMIN_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [ADMIN_ID, ADMIN_TOKEN],
    skipIfMissing: 'ADMIN_ID and ADMIN_TOKEN',
  },
  {
    name: 'Messages tenant /messages/tenant/:tenantId/all',
    path: () => `/messages/tenant/${TENANT_ID}/all`,
    token: TENANT_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [TENANT_ID, TENANT_TOKEN],
    skipIfMissing: 'TENANT_ID and TENANT_TOKEN',
  },
  {
    name: 'Maintenance list /maintenance/all',
    path: '/maintenance/all',
    token: ADMIN_TOKEN,
    expected: [200, 401, 403],
    requires: [ADMIN_TOKEN],
    skipIfMissing: 'ADMIN_TOKEN',
  },
  {
    name: 'Maintenance by property /maintenance/property/:propertyId/all',
    path: () => `/maintenance/property/${PROPERTY_ID}/all`,
    token: ADMIN_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [PROPERTY_ID, ADMIN_TOKEN],
    skipIfMissing: 'PROPERTY_ID and ADMIN_TOKEN',
  },
  {
    name: 'Maintenance by tenant /maintenance/tenant/:tenantId/all',
    path: () => `/maintenance/tenant/${TENANT_ID}/all`,
    token: TENANT_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [TENANT_ID, TENANT_TOKEN],
    skipIfMissing: 'TENANT_ID and TENANT_TOKEN',
  },
  {
    name: 'Notifications /notifications',
    path: '/notifications',
    token: DEFAULT_TOKEN,
    expected: [200, 401, 403],
    requires: [DEFAULT_TOKEN],
    skipIfMissing: 'ADMIN_TOKEN or PROPERTY_MANAGER_TOKEN or TENANT_TOKEN',
  },
  {
    name: 'Expenses list /expenses/all',
    path: '/expenses/all',
    token: ADMIN_TOKEN,
    expected: [200, 401, 403],
    requires: [ADMIN_TOKEN],
    skipIfMissing: 'ADMIN_TOKEN',
  },
  {
    name: 'Expenses by property /expenses/property/:propertyId/all',
    path: () => `/expenses/property/${PROPERTY_ID}/all`,
    token: ADMIN_TOKEN,
    expected: [200, 401, 403, 404],
    requires: [PROPERTY_ID, ADMIN_TOKEN],
    skipIfMissing: 'PROPERTY_ID and ADMIN_TOKEN',
  },
];

async function run() {
  console.log('API smoke test started');
  console.log('API_BASE:', API_BASE);
  console.log('ADMIN_ID:', ADMIN_ID || '(missing)');
  console.log('PROPERTY_ID:', PROPERTY_ID || '(missing)');
  console.log('TENANT_ID:', TENANT_ID || '(missing)');
  console.log('SETTINGS_ID:', SETTINGS_ID || '(missing)');
  console.log('Tokens loaded:', {
    admin: Boolean(ADMIN_TOKEN),
    propertyManager: Boolean(PROPERTY_MANAGER_TOKEN),
    tenant: Boolean(TENANT_TOKEN),
  });

  const results = [];
  for (const test of tests) {
    const path = typeof test.path === 'function' ? test.path() : test.path;
    const token = test.token || '';
    const requires = test.requires || [];
    if (requires.length > 0 && !requires.every(isPresent)) {
      console.log(`SKIP: ${test.name} -> missing ${test.skipIfMissing || 'required values'}`);
      results.push({ ...test, status: 'skipped' });
      continue;
    }

    if (!path) {
      console.log(`SKIP: ${test.name} -> generated path is empty`);
      results.push({ ...test, status: 'skipped' });
      continue;
    }

    process.stdout.write(`RUN: ${test.name} (${path}) ... `);
    try {
      const response = await request(path, token);
      const got = response.status;
      const pass = test.expected.includes(got);
      if (!pass) {
        console.log(`FAIL (${got})`);
        console.log('  Response:', JSON.stringify(response.data, null, 2));
        results.push({ ...test, status: 'fail', response });
        continue;
      }
      console.log(`OK (${got})`);
      results.push({ ...test, status: 'pass', response });
    } catch (err) {
      console.log('ERROR');
      console.error('  ', err.message || err);
      results.push({ ...test, status: 'error', error: err });
    }
  }

  const passCount = results.filter((r) => r.status === 'pass').length;
  const skipCount = results.filter((r) => r.status === 'skipped').length;
  const failCount = results.filter((r) => r.status === 'fail').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  console.log('\nSmoke test summary:');
  console.log(`  pass: ${passCount}`);
  console.log(`  skip: ${skipCount}`);
  console.log(`  fail: ${failCount}`);
  console.log(`  error: ${errorCount}`);

  if (failCount > 0 || errorCount > 0) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error('Fatal smoke test error:', err);
  process.exit(1);
});
