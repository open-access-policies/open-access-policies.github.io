/**
 * Persona: Sarah - Security Engineer / Developer
 *
 * Tests the site from the perspective of a developer tasked with
 * implementing the compliance program. Wants to clone and customize fast.
 */

import { test, expect } from '@playwright/test';
import { ObservationCollector, definePersona } from 'personaspec';

const persona = definePersona({
  name: 'Sarah',
  role: 'Security Engineer',
  background:
    'Mid-level security engineer tasked with implementing the compliance program. Comfortable with Git and documentation. Wants to understand the repo structure before diving in.',
  goals: [
    'Get to the GitHub repo quickly',
    'Understand the file/folder structure',
    'Find customization guidance',
    'Verify the license allows modification',
  ],
  behaviors: [
    'Jumps to GitHub immediately',
    'Reads READMEs before anything else',
    'Checks commit history for activity',
    'Prefers CLI/code over UI navigation',
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

  test('find GitHub link from homepage', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'homepage-github-hunt', 'Sarah looking for GitHub link immediately');

    // Look for GitHub links
    const githubLinks = page.locator('a[href*="github.com"]');
    const count = await githubLinks.count();

    if (count > 0) {
      collector.observe('success', `Found ${count} GitHub link(s) on homepage`, 'Homepage');
      success = true;

      // Check if it's in header/nav for quick access
      const headerGithub = page.locator('header a[href*="github"], nav a[href*="github"]');
      if (await headerGithub.count() > 0) {
        collector.observe('success', 'GitHub link in navigation - easy access', 'Navigation');
      } else {
        collector.observe('note', 'GitHub links exist but not in nav - requires scrolling', 'Homepage');
      }
    } else {
      collector.observe('frustration', 'No GitHub links visible on homepage', 'Homepage');
    }

    collector.recordTask('find GitHub link from homepage', success, `${count} GitHub links found`);
  });

  test('navigate to specific policy repo', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/policies');
    collector.trackPageLoad();
    await collector.screenshot(page, 'policies-repo-hunt', 'Looking for specific policy repo links');

    // Look for minimal-soc2 or similar repo links
    const repoLinks = page.locator('a[href*="github.com/open-access-policies"]');
    const count = await repoLinks.count();

    if (count > 0) {
      collector.observe('success', `Found ${count} policy repo link(s)`, 'Policies page');

      // Get all repo URLs to see what's available
      const hrefs = await repoLinks.evaluateAll(links =>
        links.map(l => l.getAttribute('href')).filter(Boolean)
      );
      collector.observe('note', `Available repos: ${hrefs.slice(0, 3).join(', ')}${hrefs.length > 3 ? '...' : ''}`, 'Policies page');
      success = true;
    } else {
      collector.observe('frustration', 'Cannot find direct links to policy repos', 'Policies page');
    }

    collector.recordTask('navigate to specific policy repo', success, success ? 'Repos found' : 'No repos');
  });

  test('find getting started / setup instructions', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/start');
    collector.trackPageLoad();
    await collector.screenshot(page, 'getting-started', 'Looking for setup instructions');

    const pageText = await page.locator('body').textContent() || '';

    // Developer-friendly signals
    const devSignals = [
      { signal: 'git clone', found: pageText.toLowerCase().includes('git clone') || pageText.toLowerCase().includes('clone') },
      { signal: 'fork', found: pageText.toLowerCase().includes('fork') },
      { signal: 'step by step', found: pageText.toLowerCase().includes('step') },
      { signal: 'install', found: pageText.toLowerCase().includes('install') },
    ];

    const foundSignals = devSignals.filter(s => s.found);

    if (foundSignals.length >= 2) {
      collector.observe('success', `Good dev instructions: ${foundSignals.map(s => s.signal).join(', ')}`, 'Get Started page');
      success = true;
    } else if (foundSignals.length > 0) {
      collector.observe('note', 'Some dev guidance but could be more detailed', 'Get Started page');
      success = true;
    } else {
      collector.observe('confusion', 'No clear developer setup instructions', 'Get Started page');
    }

    // Look for code blocks
    const codeBlocks = page.locator('pre, code, .code-block');
    const codeCount = await codeBlocks.count();
    if (codeCount > 0) {
      collector.observe('success', `Found ${codeCount} code block(s) with examples`, 'Get Started page');
      success = true;
    }

    collector.recordTask('find getting started / setup instructions', success, `${foundSignals.length} dev signals, ${codeCount} code blocks`);
  });

  test('verify license for modification', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Check footer for license
    const footer = page.locator('footer');
    const footerText = await footer.textContent() || '';

    // License types a developer would look for
    const licenseTypes = ['cc-by', 'creative commons', 'mit', 'apache', 'open source'];
    const foundLicense = licenseTypes.some(l => footerText.toLowerCase().includes(l));

    if (foundLicense) {
      collector.observe('success', 'Open license visible in footer', 'Footer');
      success = true;
    }

    // Check about page
    await page.goto('https://openaccesspolicies.org/about');
    collector.trackPageLoad();
    const aboutText = await page.locator('body').textContent() || '';

    if (licenseTypes.some(l => aboutText.toLowerCase().includes(l))) {
      collector.observe('success', 'License details on about page', 'About page');
      success = true;
    }

    if (aboutText.toLowerCase().includes('modify') || aboutText.toLowerCase().includes('adapt')) {
      collector.observe('success', 'Explicitly mentions modification is allowed', 'About page');
    }

    if (!success) {
      collector.observe('confusion', 'License not prominently displayed - need to check GitHub', 'Site-wide');
    }

    await collector.screenshot(page, 'license-check', 'Checking license for modifications');
    collector.recordTask('verify license for modification', success, success ? 'License found' : 'License unclear');
  });

  test('assess documentation quality', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org/start');
    collector.trackPageLoad();
    await collector.screenshot(page, 'docs-quality', 'Assessing documentation quality');

    // Documentation quality signals
    const pageHtml = await page.content();

    const qualitySignals = [
      { signal: 'headings structure', found: pageHtml.includes('<h2') || pageHtml.includes('<h3') },
      { signal: 'ordered lists', found: pageHtml.includes('<ol') },
      { signal: 'code examples', found: pageHtml.includes('<code') || pageHtml.includes('<pre') },
      { signal: 'links to more info', found: (await page.locator('a').count()) > 5 },
    ];

    const foundSignals = qualitySignals.filter(s => s.found);

    if (foundSignals.length >= 3) {
      collector.observe('success', 'Well-structured documentation', 'Get Started page');
      success = true;
    } else {
      collector.observe('note', `Documentation structure could improve: missing ${qualitySignals.filter(s => !s.found).map(s => s.signal).join(', ')}`, 'Get Started page');
      success = foundSignals.length > 0;
    }

    collector.recordTask('assess documentation quality', success, `${foundSignals.length}/4 quality signals`);
  });

  test('free exploration - developer workflow', async ({ page }) => {
    collector.startTask();

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'dev-exploration-start', 'Developer starting exploration');

    // Developer-style exploration
    const actions = [
      {
        name: 'look for keyboard shortcuts or search',
        fn: async () => {
          // Check for search
          const search = page.locator('input[type="search"], [class*="search"], button:has-text("Search")');
          if (await search.count() > 0) {
            collector.observe('success', 'Search functionality available', 'Navigation');
          } else {
            collector.observe('note', 'No search - developers might expect Cmd+K', 'Navigation');
          }
        },
      },
      {
        name: 'check for API or programmatic access',
        fn: async () => {
          const pageText = await page.locator('body').textContent() || '';
          if (pageText.toLowerCase().includes('api') || pageText.toLowerCase().includes('programmatic')) {
            collector.observe('success', 'API/programmatic access mentioned', 'Page content');
          }
        },
      },
      {
        name: 'rapid navigation to policies',
        fn: async () => {
          const policiesLink = page.locator('a:has-text("Policies")').first();
          if (await policiesLink.isVisible()) {
            await policiesLink.click();
            collector.trackClick();
            collector.trackPageLoad();
            await collector.screenshot(page, 'policies-dev-view', 'Developer viewing policies page');
          }
        },
      },
      {
        name: 'look for contributing guidelines',
        fn: async () => {
          const pageText = await page.locator('body').textContent() || '';
          if (pageText.toLowerCase().includes('contribut')) {
            collector.observe('success', 'Contributing information available', 'Page content');
          }
        },
      },
    ];

    for (const action of actions) {
      try {
        await action.fn();
        await page.waitForTimeout(200);
      } catch (error) {
        collector.observe('note', `Action "${action.name}" failed`, page.url());
      }
    }

    await collector.screenshot(page, 'dev-exploration-end', 'Developer exploration complete');
    collector.recordTask('free exploration - developer workflow', true, 'Dev exploration complete');
  });
});
