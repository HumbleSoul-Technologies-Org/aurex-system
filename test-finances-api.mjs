#!/usr/bin/env node

/**
 * Test script to verify tenant finances settings are saved via API
 * Usage: node test-finances-api.mjs <tenantId> [serverUrl]
 */

const API_URL = process.argv[3] || "http://localhost:3001";
const TENANT_ID = process.argv[2];

if (!TENANT_ID) {
  console.error("❌ Usage: node test-finances-api.mjs <tenantId> [serverUrl]");
  console.error("Example: node test-finances-api.mjs 507f1f77bcf86cd799439011");
  process.exit(1);
}

console.log(`🧪 Testing Tenant Finances API Save`);
console.log(`   API URL: ${API_URL}`);
console.log(`   Tenant ID: ${TENANT_ID}`);
console.log("");

async function testFinancesAPI() {
  try {
    // Step 1: Fetch initial tenant data
    console.log("📡 Step 1: Fetching initial tenant data...");
    const initialRes = await fetch(`${API_URL}/tenants/${TENANT_ID}`);
    if (!initialRes.ok) {
      throw new Error(`Failed to fetch tenant: ${initialRes.status}`);
    }
    const initialData = await initialRes.json();
    const initialTenant = initialData.data || initialData.tenant;
    console.log(`✅ Fetched tenant: ${initialTenant.name}`);
    console.log(
      `   Current paymentMethod:`,
      JSON.stringify(initialTenant.paymentMethod, null, 2),
    );
    console.log(
      `   Current autoPay:`,
      JSON.stringify(initialTenant.autoPay, null, 2),
    );
    console.log("");

    // Step 2: Update with test finances settings
    console.log("📡 Step 2: Updating tenant with test finances settings...");
    const testPaymentMethod = {
      provider: "Visa_Mastercard",
      label: "Credit / Debit Card",
      externalId: "card_**** **** **** 4242",
    };
    const testAutoPay = {
      enabled: true,
      scheduleType: "monthly_day",
      dayOfMonth: 5,
      nextRunDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "active",
      retryAttempts: 0,
      lastError: "",
    };

    const updateRes = await fetch(`${API_URL}/tenants/${TENANT_ID}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentMethod: testPaymentMethod,
        autoPay: testAutoPay,
      }),
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update tenant: ${updateRes.status}`);
    }

    const updateData = await updateRes.json();
    const updatedTenant = updateData.data || updateData.tenant;
    console.log(`✅ Updated tenant successfully`);
    console.log(
      `   New paymentMethod:`,
      JSON.stringify(updatedTenant.paymentMethod, null, 2),
    );
    console.log(
      `   New autoPay:`,
      JSON.stringify(updatedTenant.autoPay, null, 2),
    );
    console.log("");

    // Step 3: Verify by fetching again
    console.log("📡 Step 3: Verifying changes persisted...");
    const verifyRes = await fetch(`${API_URL}/tenants/${TENANT_ID}`);
    if (!verifyRes.ok) {
      throw new Error(
        `Failed to fetch tenant for verification: ${verifyRes.status}`,
      );
    }
    const verifyData = await verifyRes.json();
    const verifiedTenant = verifyData.data || verifyData.tenant;
    console.log(`✅ Fetched tenant again for verification`);
    console.log(
      `   Verified paymentMethod:`,
      JSON.stringify(verifiedTenant.paymentMethod, null, 2),
    );
    console.log(
      `   Verified autoPay:`,
      JSON.stringify(verifiedTenant.autoPay, null, 2),
    );
    console.log("");

    // Step 4: Validate changes
    console.log("🔍 Step 4: Validating changes...");
    const paymentMatch =
      verifiedTenant.paymentMethod?.provider === testPaymentMethod.provider &&
      verifiedTenant.paymentMethod?.label === testPaymentMethod.label &&
      verifiedTenant.paymentMethod?.externalId === testPaymentMethod.externalId;

    const autoPayMatch =
      verifiedTenant.autoPay?.enabled === testAutoPay.enabled &&
      verifiedTenant.autoPay?.scheduleType === testAutoPay.scheduleType &&
      verifiedTenant.autoPay?.dayOfMonth === testAutoPay.dayOfMonth;

    if (paymentMatch && autoPayMatch) {
      console.log(
        "✅ All changes verified! Finances settings saved correctly.",
      );
      console.log("");
      console.log(
        "🎉 SUCCESS: Tenant finances settings are being persisted to the database.",
      );
      return true;
    } else {
      console.error("❌ Validation failed:");
      if (!paymentMatch) {
        console.error("   - Payment method did not match expected values");
      }
      if (!autoPayMatch) {
        console.error("   - Auto-pay settings did not match expected values");
      }
      return false;
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    return false;
  }
}

testFinancesAPI().then((success) => {
  process.exit(success ? 0 : 1);
});
