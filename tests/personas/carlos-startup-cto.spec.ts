/**
 * Persona: Carlos - Startup CTO Under Pressure
 *
 * Tests the site from the perspective of a technical founder who just
 * landed an enterprise deal requiring SOC2 compliance. Time is critical.
 */

import { test, expect } from '@playwright/test';
import { ObservationCollector, definePersona } from 'personaspec';

const persona = definePersona({
  name: 'Carlos',
  role: 'Startup CTO',
  background:
    'Series A startup just landed enterprise deal requiring SOC2. Has 3 weeks to show compliance progress. Technical but not a compliance expert. Under pressure from board and sales team.',
  goals: [
    'Find the right policy set for SOC2 quickly',
    'Understand what policies are actually needed',
    'Get to the GitHub repo to assess the templates',
    'Determine customization effort required',
  ],
  behaviors: [
    'Skips marketing copy, looks for technical details',
    'Wants to see actual files before committing',
    'Checks GitHub activity and stars for credibility',
    'Impatient with slow or unclear navigation',
  ],
});

const collector = new ObservationCollector({
  outputDir: './test-results',
  persona,
});

test.describe.configure({ mode: 'serial' });

test.describe(`${persona.name} - ${persona.role}`, () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        collector.addConsoleError(msg.text());
      }
    });
  });

  test.afterAll(async () => {
    const filepath = await collector.save();
    console.log(`\nObservations saved to: ${filepath}`);
  });

  test('quickly identify this is about compliance policies', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'landing-first-look', 'Carlos lands on site, scanning for relevance to SOC2');

    // Check headline for SOC2 or compliance mention
    const headline = await page.locator('h1').first().textContent();
    const pageText = await page.locator('body').textContent() || '';

    if (headline?.toLowerCase().includes('compliance') || headline?.toLowerCase().includes('polic')) {
      collector.observe('success', `Headline immediately relevant: "${headline}"`, 'Homepage hero');
      success = true;
    }

    if (pageText.toLowerCase().includes('soc2') || pageText.toLowerCase().includes('soc 2')) {
      collector.observe('success', 'SOC2 mentioned on homepage - directly relevant', 'Homepage');
      success = true;
    } else {
      collector.observe('note', 'SOC2 not prominently visible on landing - may need to dig', 'Homepage');
    }

    await collector.screenshot(page, 'landing-scanned', 'After quick scan of homepage');
    collector.recordTask('quickly identify this is about compliance policies', success, headline || 'No headline');

    expect(success).toBe(true);
  });

  test('find SOC2-specific policy set', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Look for policies or SOC2 link
    const policiesLink = page.locator('a:has-text("Policies"), a[href*="policies"]').first();
    const soc2Link = page.locator('a:has-text("SOC2"), a:has-text("SOC 2"), a[href*="soc"]').first();

    if (await soc2Link.isVisible().catch(() => false)) {
      await soc2Link.click();
      collector.trackClick();
      collector.trackPageLoad();
      collector.observe('success', 'Direct SOC2 link found - efficient', 'Navigation');
      success = true;
    } else if (await policiesLink.isVisible().catch(() => false)) {
      await policiesLink.click();
      collector.trackClick();
      collector.trackPageLoad();
      await collector.screenshot(page, 'policies-page', 'Navigated to policies page');

      // Look for SOC2 on this page
      const soc2Content = page.locator('text=/SOC\\s*2/i, text=/minimal.*soc/i').first();
      if (await soc2Content.isVisible().catch(() => false)) {
        collector.observe('success', 'Found SOC2 policy set on policies page', 'Policies page');
        success = true;
      } else {
        collector.observe('confusion', 'On policies page but SOC2 option not obvious', 'Policies page');
      }
    } else {
      collector.observe('frustration', 'Cannot find path to SOC2 policies', 'Homepage');
    }

    await collector.screenshot(page, 'soc2-search-result', 'After searching for SOC2 policies');
    collector.recordTask('find SOC2-specific policy set', success, success ? 'Found SOC2' : 'SOC2 not found easily');
  });

  test('get to GitHub repo quickly', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/policies');
    collector.trackPageLoad();
    await collector.screenshot(page, 'policies-looking-for-github', 'Looking for GitHub links');

    // Look for GitHub links
    const githubLinks = page.locator('a[href*="github.com"]');
    const count = await githubLinks.count();

    if (count > 0) {
      collector.observe('success', `Found ${count} GitHub link(s) on policies page`, 'Policies page');

      // Check if repo link is for SOC2/minimal
      const minimalSoc2Link = page.locator('a[href*="github.com"][href*="minimal"], a[href*="github.com"][href*="soc"]').first();
      if (await minimalSoc2Link.isVisible().catch(() => false)) {
        const href = await minimalSoc2Link.getAttribute('href');
        collector.observe('success', `Direct link to SOC2 repo: ${href}`, 'Policies page');
        success = true;
      } else {
        collector.observe('note', 'GitHub links present but not clearly labeled for SOC2', 'Policies page');
        success = true; // Still found GitHub
      }
    } else {
      collector.observe('frustration', 'No GitHub links visible - where are the actual templates?', 'Policies page');
    }

    collector.recordTask('get to GitHub repo quickly', success, success ? 'GitHub accessible' : 'GitHub not found');
  });

  test('assess what policies are included', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/policies');
    collector.trackPageLoad();

    // Look for policy list or breakdown
    const policyList = await page.locator('ul li, .policy-list, table').first().isVisible().catch(() => false);

    if (policyList) {
      await collector.screenshot(page, 'policy-breakdown', 'Examining what policies are included');

      // Check for specific policy mentions
      const pageText = await page.locator('body').textContent() || '';
      const hasPolicyDetails = pageText.toLowerCase().includes('access control') ||
                              pageText.toLowerCase().includes('incident') ||
                              pageText.toLowerCase().includes('risk');

      if (hasPolicyDetails) {
        collector.observe('success', 'Can see specific policy types included', 'Policies page');
        success = true;
      } else {
        collector.observe('note', 'Policy categories listed but specific policies not detailed', 'Policies page');
        success = true; // Partial success
      }
    } else {
      collector.observe('confusion', 'Hard to understand what specific policies are included', 'Policies page');
    }

    collector.recordTask('assess what policies are included', success, success ? 'Policy details visible' : 'Details unclear');
  });

  test('understand customization requirements', async ({ page }) => {
    collector.startTask();
    let success = false;

    // Check Get Started page for customization guidance
    await page.goto('https://openaccesspolicies.org/start');
    collector.trackPageLoad();
    await collector.screenshot(page, 'getting-started', 'Looking for customization guidance');

    const pageText = await page.locator('body').textContent() || '';

    const hasCustomizationInfo = pageText.toLowerCase().includes('customiz') ||
                                 pageText.toLowerCase().includes('edit') ||
                                 pageText.toLowerCase().includes('modify') ||
                                 pageText.toLowerCase().includes('your company');

    if (hasCustomizationInfo) {
      collector.observe('success', 'Found customization guidance', 'Get Started page');
      success = true;
    } else {
      collector.observe('note', 'Customization process not immediately clear', 'Get Started page');
    }

    // Look for steps or instructions
    const hasSteps = await page.locator('ol, .steps, [class*="step"]').first().isVisible().catch(() => false);
    if (hasSteps) {
      collector.observe('success', 'Clear step-by-step instructions available', 'Get Started page');
      success = true;
    }

    await collector.screenshot(page, 'customization-guidance', 'After reviewing getting started content');
    collector.recordTask('understand customization requirements', success, success ? 'Guidance found' : 'Unclear process');
  });

  test('free exploration - impatient CTO behavior', async ({ page }) => {
    collector.startTask();

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Impatient CTO behavior - quick clicks, looking for substance
    const actions = [
      {
        name: 'quick scroll past hero',
        fn: async () => {
          await page.mouse.wheel(0, 600);
          await page.waitForTimeout(200);
        },
      },
      {
        name: 'look for comparison table',
        fn: async () => {
          const table = await page.locator('table, .comparison').first().isVisible().catch(() => false);
          if (table) {
            collector.observe('success', 'Found comparison table - helps quick decision', 'Homepage');
          }
        },
      },
      {
        name: 'check footer for legitimacy signals',
        fn: async () => {
          await page.mouse.wheel(0, 2000);
          await collector.screenshot(page, 'footer-check', 'Checking footer for legitimacy');
          const footer = await page.locator('footer').textContent() || '';
          if (footer.toLowerCase().includes('license') || footer.toLowerCase().includes('github')) {
            collector.observe('success', 'Footer has legitimacy signals (license, GitHub)', 'Footer');
          }
        },
      },
      {
        name: 'rapid nav exploration',
        fn: async () => {
          const navLinks = await page.locator('nav a').all();
          collector.observe('note', `${navLinks.length} nav items to explore`, 'Navigation');
        },
      },
    ];

    for (const action of actions) {
      try {
        await action.fn();
      } catch (error) {
        collector.observe('note', `Action "${action.name}" failed`, page.url());
      }
    }

    await collector.screenshot(page, 'exploration-end', 'End of impatient CTO exploration');
    collector.recordTask('free exploration - impatient CTO behavior', true, 'Exploration complete');
  });
});
