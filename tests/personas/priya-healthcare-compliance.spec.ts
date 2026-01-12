/**
 * Persona: Priya - Healthcare Compliance Officer
 *
 * Tests the site from the perspective of a compliance officer at a
 * healthcare organization evaluating HIPAA vs HITRUST options.
 */

import { test, expect } from '@playwright/test';
import { ObservationCollector, definePersona } from 'personaspec';

const persona = definePersona({
  name: 'Priya',
  role: 'Healthcare Compliance Officer',
  background:
    'Works at a regional hospital system evaluating compliance options. Needs to present HIPAA vs HITRUST comparison to leadership. Has compliance background but not deeply technical. Budget-conscious.',
  goals: [
    'Understand the difference between HIPAA and HITRUST offerings',
    'Find control mapping documents for audit preparation',
    'Assess if templates are audit-ready',
    'Find contact information for questions',
  ],
  behaviors: [
    'Reads carefully before making decisions',
    'Looks for authoritative signals (credentials, experience)',
    'Compares options side-by-side',
    'Downloads documentation for offline review',
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

  test('find healthcare-specific policy options', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'homepage-healthcare-search', 'Priya looking for healthcare/HIPAA options');

    const pageText = await page.locator('body').textContent() || '';

    // Look for healthcare-specific mentions
    const hasHipaa = pageText.toLowerCase().includes('hipaa');
    const hasHitrust = pageText.toLowerCase().includes('hitrust');
    const hasHealthcare = pageText.toLowerCase().includes('health');

    if (hasHipaa || hasHitrust || hasHealthcare) {
      collector.observe('success', 'Healthcare/HIPAA content visible from homepage', 'Homepage');
      success = true;
    } else {
      collector.observe('confusion', 'Not immediately clear if healthcare options exist', 'Homepage');
    }

    await collector.screenshot(page, 'homepage-scanned', 'After scanning for healthcare content');
    collector.recordTask('find healthcare-specific policy options', success, hasHipaa ? 'HIPAA found' : 'Healthcare not prominent');
  });

  test('understand HIPAA vs HITRUST difference', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/policies');
    collector.trackPageLoad();
    await collector.screenshot(page, 'policies-hipaa-hitrust', 'Looking for HIPAA vs HITRUST comparison');

    const pageText = await page.locator('body').textContent() || '';

    // Check if both are explained
    const hasHipaa = pageText.toLowerCase().includes('hipaa');
    const hasHitrust = pageText.toLowerCase().includes('hitrust');

    if (hasHipaa && hasHitrust) {
      collector.observe('success', 'Both HIPAA and HITRUST options are presented', 'Policies page');

      // Look for comparison or distinguishing information
      const hasComparison = pageText.toLowerCase().includes('vs') ||
                           pageText.toLowerCase().includes('difference') ||
                           pageText.toLowerCase().includes('certification');

      if (hasComparison) {
        collector.observe('success', 'Comparison information helps distinguish options', 'Policies page');
        success = true;
      } else {
        collector.observe('note', 'Both options shown but difference not clearly explained', 'Policies page');
        success = true; // Partial success
      }
    } else {
      collector.observe('confusion', 'Cannot find clear HIPAA vs HITRUST options', 'Policies page');
    }

    await collector.screenshot(page, 'hipaa-hitrust-comparison', 'Reviewing HIPAA vs HITRUST');
    collector.recordTask('understand HIPAA vs HITRUST difference', success, success ? 'Options visible' : 'Comparison unclear');
  });

  test('find control mapping documents', async ({ page }) => {
    collector.startTask();
    let success = false;

    // Check the For Auditors page
    await page.goto('https://openaccesspolicies.org/auditors');
    collector.trackPageLoad();
    await collector.screenshot(page, 'auditors-page', 'Looking for control mappings on auditors page');

    const pageText = await page.locator('body').textContent() || '';

    // Look for control mapping content
    const hasControlMapping = pageText.toLowerCase().includes('control') ||
                             pageText.toLowerCase().includes('mapping') ||
                             pageText.toLowerCase().includes('crosswalk');

    if (hasControlMapping) {
      collector.observe('success', 'Control mapping information available', 'Auditors page');
      success = true;

      // Look for downloadable documents
      const downloadLinks = page.locator('a[href*=".xlsx"], a[href*=".csv"], a[href*=".pdf"], a:has-text("download")');
      const downloadCount = await downloadLinks.count();

      if (downloadCount > 0) {
        collector.observe('success', `Found ${downloadCount} downloadable document(s)`, 'Auditors page');
      } else {
        collector.observe('note', 'Control mappings mentioned but no direct download links', 'Auditors page');
      }
    } else {
      collector.observe('frustration', 'Cannot find control mapping documents', 'Auditors page');
    }

    collector.recordTask('find control mapping documents', success, success ? 'Mappings found' : 'Mappings not found');
  });

  test('assess audit-readiness of templates', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Look for audit-related credibility signals
    const pageText = await page.locator('body').textContent() || '';

    const auditSignals = [
      { term: 'audit', found: pageText.toLowerCase().includes('audit') },
      { term: 'tested', found: pageText.toLowerCase().includes('tested') },
      { term: 'production', found: pageText.toLowerCase().includes('production') },
      { term: 'real', found: pageText.toLowerCase().includes('real') },
    ];

    const foundSignals = auditSignals.filter(s => s.found);

    if (foundSignals.length >= 2) {
      collector.observe('success', `Multiple audit credibility signals: ${foundSignals.map(s => s.term).join(', ')}`, 'Homepage');
      success = true;
    } else if (foundSignals.length === 1) {
      collector.observe('note', 'Some audit credibility, could be stronger', 'Homepage');
      success = true;
    } else {
      collector.observe('confusion', 'Unclear if these templates are actually audit-tested', 'Homepage');
    }

    await collector.screenshot(page, 'audit-credibility', 'Assessing audit-readiness claims');
    collector.recordTask('assess audit-readiness of templates', success, `${foundSignals.length} credibility signals`);
  });

  test('find contact information for questions', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/about');
    collector.trackPageLoad();
    await collector.screenshot(page, 'about-page', 'Looking for contact information');

    // Look for contact methods
    const emailLink = page.locator('a[href^="mailto:"]');
    const contactText = page.locator('text=/contact|email|reach/i');

    const hasEmail = await emailLink.count() > 0;
    const hasContactInfo = await contactText.count() > 0;

    if (hasEmail) {
      const email = await emailLink.first().getAttribute('href');
      collector.observe('success', `Email contact available: ${email}`, 'About page');
      success = true;
    }

    if (hasContactInfo) {
      collector.observe('success', 'Contact information visible', 'About page');
      success = true;
    }

    if (!success) {
      collector.observe('frustration', 'Cannot find way to ask questions', 'About page');

      // Check footer as fallback
      const footer = page.locator('footer');
      if (await footer.isVisible()) {
        const footerText = await footer.textContent() || '';
        if (footerText.includes('@') || footerText.toLowerCase().includes('contact')) {
          collector.observe('note', 'Contact info may be in footer', 'Footer');
          success = true;
        }
      }
    }

    collector.recordTask('find contact information for questions', success, success ? 'Contact found' : 'No contact visible');
  });

  test('free exploration - careful compliance officer', async ({ page }) => {
    collector.startTask();

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'exploration-start', 'Beginning methodical exploration');

    // Careful, methodical exploration
    const actions = [
      {
        name: 'read hero section carefully',
        fn: async () => {
          const hero = await page.locator('h1, .hero').first().textContent();
          await page.waitForTimeout(1000); // Actually reading
          if (hero) {
            collector.observe('note', `Hero message: "${hero.substring(0, 100)}..."`, 'Homepage');
          }
        },
      },
      {
        name: 'look for author credentials',
        fn: async () => {
          const pageText = await page.locator('body').textContent() || '';
          if (pageText.toLowerCase().includes('ciso') || pageText.toLowerCase().includes('security')) {
            collector.observe('success', 'Author has security credentials - builds trust', 'Page content');
          }
        },
      },
      {
        name: 'check all navigation options',
        fn: async () => {
          const navLinks = await page.locator('nav a').allTextContents();
          collector.observe('note', `Navigation options: ${navLinks.join(', ')}`, 'Navigation');
        },
      },
      {
        name: 'visit About page for credibility',
        fn: async () => {
          const aboutLink = page.locator('a:has-text("About")').first();
          if (await aboutLink.isVisible().catch(() => false)) {
            await aboutLink.click();
            collector.trackClick();
            collector.trackPageLoad();
            await collector.screenshot(page, 'about-credibility-check', 'Checking author credibility');
          }
        },
      },
    ];

    for (const action of actions) {
      try {
        await action.fn();
        await page.waitForTimeout(500);
      } catch (error) {
        collector.observe('note', `Action "${action.name}" failed`, page.url());
      }
    }

    await collector.screenshot(page, 'exploration-end', 'End of careful exploration');
    collector.recordTask('free exploration - careful compliance officer', true, 'Methodical review complete');
  });
});
