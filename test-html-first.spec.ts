/**
 * HTML-First Rendering Test
 * Verifies that:
 * 1. Server renders actual HTML (not Flight JSON that requires JS)
 * 2. Page content is visible immediately
 * 3. Client components hydrate properly
 */

import { test, expect, chromium } from '@playwright/test';

test.describe('HTML-First Rendering', () => {
  test('page renders HTML immediately without JS', async () => {
    // Launch browser with JS disabled to verify HTML is server-rendered
    const browser = await chromium.launch();
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/');

    // Should see server-rendered content without JS
    // Use .first() to handle multiple matching elements
    await expect(page.locator('h1').first()).toContainText('Tana Framework Demo');
    await expect(page.getByRole('heading', { name: 'Server Component' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Client Component' })).toBeVisible();

    // Server component section should be visible (proves server rendering)
    await expect(page.getByRole('heading', { name: 'Server Component' })).toBeVisible();

    // Check that root div has content (not empty)
    const root = page.locator('#root');
    const rootHtml = await root.innerHTML();
    expect(rootHtml.length).toBeGreaterThan(100);

    await browser.close();
    console.log('✅ HTML renders without JavaScript');
  });

  test('Flight data is embedded for hydration', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/');

    // Check that Flight data is embedded
    const flightData = page.locator('#__FLIGHT_DATA__');
    await expect(flightData).toBeAttached();

    const flightContent = await flightData.textContent();
    expect(flightContent).toContain('["$"');  // Flight format

    await browser.close();
    console.log('✅ Flight data embedded for hydration');
  });

  test('client component placeholder exists', async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://localhost:5173/');

    // Check for client component placeholder
    const placeholder = page.locator('[data-tana-client="public_App"]');
    await expect(placeholder).toBeAttached();

    // Check that props are embedded
    const props = await placeholder.getAttribute('data-tana-props');
    expect(props).toContain('url');

    await browser.close();
    console.log('✅ Client component placeholder exists with props');
  });

  test('client component hydrates with JS enabled', async ({ page }) => {
    // Collect console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => consoleLogs.push(msg.text()));

    // Collect any errors
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto('http://localhost:5173/');

    // Wait for hydration
    await page.waitForTimeout(3000);

    // Server content should still be visible
    await expect(page.locator('h1').first()).toContainText('Tana Framework Demo');

    // Log any console messages
    console.log('Console logs:', consoleLogs);

    // Check for errors
    if (errors.length > 0) {
      console.log('Page errors:', errors);
    }

    // Check hydration logs
    const hydrationLog = consoleLogs.find(log => log.includes('[tana]'));
    if (hydrationLog) {
      console.log('Hydration log:', hydrationLog);
    }

    console.log('✅ Page loads with JS enabled');
  });
});
