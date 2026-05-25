import { test, expect } from '@playwright/test';

test.describe('Settings smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByPlaceholder('Email, Name, or Phone').fill('admin@example.com');
    await page.getByPlaceholder('••••••••').fill('adminpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/dashboard/**', { timeout: 15000 });
    await page.goto('/dashboard/settings');
    await page.waitForLoadState('networkidle');
  });

  async function controlByLabel(page, labelText: string) {
    const label = page.locator('label', { hasText: labelText }).first();
    const control = label.locator('xpath=following-sibling::div//input | following-sibling::div//textarea | following-sibling::div//select | following-sibling::div//button').first();
    if (await control.count()) return control;
    return page.locator(`xpath=//label[contains(normalize-space(.), '${labelText}')]/following::input[1]`);
  }

  test('company name persists per-field', async ({ page }) => {
    const testValue = 'SmokeTest Co ' + Date.now();
    const input = await controlByLabel(page, 'Company Name');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill(testValue);
    await input.blur();

    const resp = await page.waitForResponse((r) => r.url().includes('/api/settings'), { timeout: 10000 });
    const postData = resp.request().postData() || '';
    expect(postData).toContain('companyInfo_name');
    expect(postData).toContain(testValue);
  });

  test('admin email persists per-field', async ({ page }) => {
    const testValue = 'smoke+' + Date.now() + '@example.test';
    const input = await controlByLabel(page, 'Email');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill(testValue);
    await input.blur();
    const resp = await page.waitForResponse((r) => r.url().includes('/api/settings'), { timeout: 10000 });
    const postData = resp.request().postData() || '';
    expect(postData).toContain('companyInfo_adminEmail');
    expect(postData).toContain(testValue);
  });

  test('currency select persists per-field', async ({ page }) => {
    const input = await controlByLabel(page, 'Currency');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('USD');
    await input.blur();
    const resp = await page.waitForResponse((r) => r.url().includes('/api/settings'), { timeout: 10000 });
    const postData = resp.request().postData() || '';
    expect(postData).toContain('financeSettings_currency');
  });

  test('system feature toggle persists per-field', async ({ page }) => {
    const label = page.locator('label', { hasText: 'Map' }).first();
    const toggle = label.locator('xpath=following-sibling::div//input[@type="checkbox"]').first();
    await expect(toggle).toBeVisible({ timeout: 10000 });
    await toggle.click();
    const resp = await page.waitForResponse((r) => r.url().includes('/api/settings'), { timeout: 10000 });
    const postData = resp.request().postData() || '';
    expect(postData).toContain('systemFeatures_map');
  });

  test('notifications template toggle persists per-field', async ({ page }) => {
    const card = page.locator('h4', { hasText: 'Rent Due' }).first();
    const switchInput = card.locator('xpath=ancestor::div[contains(@class,"p-4")]//input[@type="checkbox"]').first();
    await expect(switchInput).toBeVisible({ timeout: 10000 });
    const respPromise = page.waitForResponse((r) => r.url().includes('/api/settings'), { timeout: 10000 });
    await switchInput.click();
    const resp = await respPromise;
    const postData = resp.request().postData() || '';
    expect(postData).toMatch(/notifications_templates/);
  });
});

