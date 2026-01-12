/**
 * Persona: Michael - External SOC2 Auditor
 *
 * Tests the site from the perspective of a CPA firm auditor evaluating
 * whether a client can use these templates for their compliance program.
 */

import { test, expect } from '@playwright/test';
import { ObservationCollector, definePersona } from 'personaspec';

const persona = definePersona({
  name: 'Michael',
  role: 'External SOC2 Auditor',
  background:
    'Senior auditor at a CPA firm. Client is using these open-source templates and Michael needs to evaluate if they meet audit requirements. Skeptical of free resources.',
  goals: [
    'Verify control coverage claims are accurate',
    'Find control mapping documentation',
    'Assess template quality and completeness',
    'Check maintenance and version history',
  ],
  behaviors: [
    'Highly skeptical of marketing claims',
    'Looks for evidence and documentation',
    'Checks dates, versions, and update frequency',
    'Examines methodology and sources',
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

  test('verify SOC2 control coverage claims', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/auditors');
    collector.trackPageLoad();
    await collector.screenshot(page, 'auditors-page-verification', 'Michael examining control coverage claims');

    const pageText = await page.locator('body').textContent() || '';

    // Look for specific SOC2 TSC mentions
    const tscMentions = [
      { code: 'CC1', found: pageText.includes('CC1') },
      { code: 'CC2', found: pageText.includes('CC2') },
      { code: 'CC3', found: pageText.includes('CC3') },
      { code: 'CC4', found: pageText.includes('CC4') },
      { code: 'CC5', found: pageText.includes('CC5') },
      { code: 'CC6', found: pageText.includes('CC6') },
      { code: 'CC7', found: pageText.includes('CC7') },
      { code: 'CC8', found: pageText.includes('CC8') },
      { code: 'CC9', found: pageText.includes('CC9') },
    ];

    const foundTsc = tscMentions.filter(t => t.found);

    if (foundTsc.length >= 5) {
      collector.observe('success', `Detailed TSC coverage visible: ${foundTsc.map(t => t.code).join(', ')}`, 'Auditors page');
      success = true;
    } else if (foundTsc.length > 0) {
      collector.observe('note', `Partial TSC coverage shown (${foundTsc.length}/9)`, 'Auditors page');
      success = true;
    } else {
      // Check for general coverage claims
      if (pageText.toLowerCase().includes('all') && pageText.toLowerCase().includes('criteria')) {
        collector.observe('note', 'Claims full coverage but specifics not visible', 'Auditors page');
        success = true;
      } else {
        collector.observe('frustration', 'Cannot verify specific control coverage', 'Auditors page');
      }
    }

    await collector.screenshot(page, 'tsc-coverage-check', 'Verifying TSC coverage');
    collector.recordTask('verify SOC2 control coverage claims', success, `${foundTsc.length} TSC codes found`);
  });

  test('find control mapping documentation', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/auditors');
    collector.trackPageLoad();

    // Look for downloadable control mappings
    const mappingLinks = page.locator('a[href*=".xlsx"], a[href*=".csv"], a[href*="mapping"], a[href*="crosswalk"]');
    const mappingCount = await mappingLinks.count();

    if (mappingCount > 0) {
      collector.observe('success', `Found ${mappingCount} control mapping document(s)`, 'Auditors page');
      success = true;

      // Check if they link to actual files
      const firstLink = mappingLinks.first();
      const href = await firstLink.getAttribute('href');
      if (href?.includes('github') || href?.endsWith('.xlsx') || href?.endsWith('.csv')) {
        collector.observe('success', 'Direct links to downloadable mapping files', 'Auditors page');
      }
    } else {
      // Check for GitHub links that might contain mappings
      const githubLinks = page.locator('a[href*="github.com"]');
      if (await githubLinks.count() > 0) {
        collector.observe('note', 'GitHub links present - mappings may be in repo', 'Auditors page');
        success = true;
      } else {
        collector.observe('frustration', 'No control mapping documentation found', 'Auditors page');
      }
    }

    await collector.screenshot(page, 'mapping-docs-search', 'Looking for control mapping docs');
    collector.recordTask('find control mapping documentation', success, success ? 'Docs found' : 'No docs');
  });

  test('assess template quality indicators', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/about');
    collector.trackPageLoad();
    await collector.screenshot(page, 'about-quality-check', 'Assessing author credentials and methodology');

    const pageText = await page.locator('body').textContent() || '';

    // Quality indicators an auditor would look for
    const qualitySignals = [
      { indicator: 'CISO credentials', found: pageText.toLowerCase().includes('ciso') },
      { indicator: 'production use', found: pageText.toLowerCase().includes('production') },
      { indicator: 'audit tested', found: pageText.toLowerCase().includes('audit') },
      { indicator: 'real companies', found: pageText.toLowerCase().includes('real') },
      { indicator: 'actively maintained', found: pageText.toLowerCase().includes('maintain') },
    ];

    const foundSignals = qualitySignals.filter(s => s.found);

    if (foundSignals.length >= 3) {
      collector.observe('success', `Strong quality indicators: ${foundSignals.map(s => s.indicator).join(', ')}`, 'About page');
      success = true;
    } else if (foundSignals.length > 0) {
      collector.observe('note', `Some quality indicators: ${foundSignals.map(s => s.indicator).join(', ')}`, 'About page');
      success = true;
    } else {
      collector.observe('confusion', 'Quality and credibility indicators not prominent', 'About page');
    }

    collector.recordTask('assess template quality indicators', success, `${foundSignals.length} quality signals`);
  });

  test('check maintenance and version history', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    const pageText = await page.locator('body').textContent() || '';

    // Look for maintenance/update information
    const hasUpdates = pageText.toLowerCase().includes('update') ||
                      pageText.toLowerCase().includes('maintain') ||
                      pageText.toLowerCase().includes('version');

    if (hasUpdates) {
      collector.observe('success', 'Maintenance/update information mentioned', 'Homepage');
      success = true;
    }

    // Check for GitHub links (version history there)
    const githubLinks = page.locator('a[href*="github.com"]');
    if (await githubLinks.count() > 0) {
      collector.observe('success', 'GitHub links available for version history verification', 'Homepage');
      success = true;
    } else {
      collector.observe('frustration', 'No way to verify version history or updates', 'Homepage');
    }

    // Look for dates
    const datePattern = /\b(202[0-9]|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
    if (datePattern.test(pageText)) {
      collector.observe('note', 'Dates visible - can assess recency', 'Homepage');
    }

    await collector.screenshot(page, 'maintenance-check', 'Checking for maintenance information');
    collector.recordTask('check maintenance and version history', success, success ? 'Info available' : 'No history visible');
  });

  test('verify licensing allows commercial use', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Check footer first
    const footer = page.locator('footer');
    const footerText = await footer.textContent() || '';

    const hasLicense = footerText.toLowerCase().includes('license') ||
                      footerText.toLowerCase().includes('cc-by') ||
                      footerText.toLowerCase().includes('creative commons');

    if (hasLicense) {
      collector.observe('success', 'License information visible in footer', 'Footer');
      success = true;
    }

    // Check about page
    await page.goto('https://openaccesspolicies.org/about');
    collector.trackPageLoad();
    const aboutText = await page.locator('body').textContent() || '';

    if (aboutText.toLowerCase().includes('license') || aboutText.toLowerCase().includes('free to use')) {
      collector.observe('success', 'License/usage rights explained', 'About page');
      success = true;
    }

    if (!success) {
      collector.observe('frustration', 'License terms not clearly stated - compliance risk', 'Site-wide');
    }

    await collector.screenshot(page, 'license-verification', 'Verifying licensing terms');
    collector.recordTask('verify licensing allows commercial use', success, success ? 'License found' : 'License unclear');
  });

  test('free exploration - skeptical auditor behavior', async ({ page }) => {
    collector.startTask();

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'skeptical-start', 'Beginning skeptical auditor review');

    // Skeptical behavior - looking for red flags
    const actions = [
      {
        name: 'check for disclaimers',
        fn: async () => {
          const pageText = await page.locator('body').textContent() || '';
          if (pageText.toLowerCase().includes('disclaimer') || pageText.toLowerCase().includes('warranty')) {
            collector.observe('note', 'Appropriate disclaimers present', 'Page content');
          }
        },
      },
      {
        name: 'verify external links',
        fn: async () => {
          const externalLinks = await page.locator('a[href^="http"]').count();
          collector.observe('note', `${externalLinks} external links to verify`, 'Page content');
        },
      },
      {
        name: 'look for testimonials or case studies',
        fn: async () => {
          const pageText = await page.locator('body').textContent() || '';
          if (pageText.toLowerCase().includes('testimonial') || pageText.toLowerCase().includes('case study')) {
            collector.observe('success', 'Social proof available', 'Page content');
          } else {
            collector.observe('note', 'No testimonials - harder to verify real-world use', 'Page content');
          }
        },
      },
      {
        name: 'examine policy comparison',
        fn: async () => {
          await page.goto('https://openaccesspolicies.org/policies');
          collector.trackPageLoad();
          await collector.screenshot(page, 'policies-audit-review', 'Auditor reviewing policy comparison');
        },
      },
    ];

    for (const action of actions) {
      try {
        await action.fn();
        await page.waitForTimeout(300);
      } catch (error) {
        collector.observe('note', `Action "${action.name}" failed`, page.url());
      }
    }

    await collector.screenshot(page, 'skeptical-end', 'End of skeptical auditor review');
    collector.recordTask('free exploration - skeptical auditor behavior', true, 'Audit review complete');
  });
});
