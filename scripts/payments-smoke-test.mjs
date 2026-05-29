const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE || 'http://localhost:5454/api';
const TENANT_ID = process.env.TENANT_ID || '6a0ee8eaf7d9698f1e6151ce';
const PROPERTY_ID = process.env.PROPERTY_ID || '6a0ea2af675296a667cbdf07';
const AUTH_TOKEN = process.env.AUTH_TOKEN || process.env.BEARER_TOKEN || null;

async function request(path, method = 'GET', body) {
  const url = `${API_BASE}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  const opts = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, opts);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = text;
  }
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    error.response = { status: res.status, data };
    throw error;
  }
  return data;
}

async function run() {
  console.log('API base:', API_BASE);
  console.log('Tenant ID:', TENANT_ID);
  console.log('Property ID:', PROPERTY_ID);

  const payload = {
    tenantId: TENANT_ID,
    propertyId: PROPERTY_ID,
    amount: 1250,
    monthlyRent: 1500,
    paymentMethod: 'bank_transfer',
    paidOn: new Date().toISOString(),
    paidBy: 'Smoke Test User',
    leaseType: 'monthly',
    reasonForPayment: 'rentPayment',
    balance: 250,
    status: 'balance',
    notes: 'Smoke test payment',
  };

  console.log('\n1) Creating payment...');
  const createResp = await request('/payments/create', 'POST', payload);
  console.log('Create response:', createResp);

  const createdPayment = createResp?.data || createResp?.payment || createResp;
  if (!createdPayment || !createdPayment.id) {
    throw new Error('Created payment response did not include an id');
  }

  const paymentId = createdPayment.id;
  console.log('Created payment ID:', paymentId);

  console.log('\n2) Fetching tenant payments...');
  const listResp = await request(`/payments/tenant/${encodeURIComponent(TENANT_ID)}/all`, 'GET');
  const payments = listResp?.data || listResp?.payments || listResp;
  console.log(`Fetched ${Array.isArray(payments) ? payments.length : 0} payments for tenant`);
  const found = Array.isArray(payments) ? payments.find((p) => p.id === paymentId || p._id === paymentId) : null;
  if (!found) {
    throw new Error('Created payment was not found in tenant payment list');
  }
  console.log('Found created payment in tenant list.');

  console.log('\n3) Updating payment status to complete...');
  const updatePayload = {
    status: 'complete',
    notes: 'Smoke test payment status updated to complete',
  };
  const updateResp = await request(`/payments/${encodeURIComponent(paymentId)}/update`, 'PUT', updatePayload);
  console.log('Update response:', updateResp);

  const updatedPayment = updateResp?.data || updateResp?.payment || updateResp;
  if (!updatedPayment || updatedPayment.status !== 'complete') {
    throw new Error('Payment update did not return complete status');
  }
  console.log('Payment status updated to complete.');

  console.log('\n4) Deleting payment...');
  const deleteResp = await request(`/payments/${encodeURIComponent(paymentId)}/delete`, 'DELETE');
  console.log('Delete response:', deleteResp);

  console.log('\n5) Verifying deletion...');
  try {
    const verifyList = await request(`/payments/tenant/${encodeURIComponent(TENANT_ID)}/all`, 'GET');
    const verifyPayments = verifyList?.data || verifyList?.payments || verifyList;
    const stillExists = Array.isArray(verifyPayments) ? verifyPayments.some((p) => p.id === paymentId || p._id === paymentId) : false;
    if (stillExists) {
      throw new Error('Payment still exists after delete');
    }
    console.log('Payment deletion verified.');
  } catch (err) {
    console.error('Verification failed:', err.message || err);
    throw err;
  }

  console.log('\nSmoke test completed successfully.');
}

run().catch((err) => {
  console.error('\nSmoke test failed:', err.message || err);
  process.exit(1);
});
