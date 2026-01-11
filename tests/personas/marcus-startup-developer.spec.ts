import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  clickWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: Marcus - Startup Developer
 *
 * Background: Technical founder implementing compliance for funding
 * Goals: Find GitHub repos quickly, understand what's included, fork policies
 * Behaviors: Power user, keyboard shortcuts, skips to action items
 *
 * Critical Evaluation: Is this site structure optimal for developers?
 * Would a different approach (API, CLI tool, npm package) work better?
 */
const persona: Persona = {
  name: 'Marcus',
  role: 'Startup Developer',
  background:
    'Technical co-founder at a B2B SaaS startup. Needs to implement SOC2 compliance ' +
    'to close enterprise deals. Prefers self-service, code-first approaches.',
  goals: [
    'Find GitHub repositories quickly',
    'Understand what policies are included in each package',
    'Fork and customize policies for their startup',
    'Find HITRUST-specific policies',
    'Evaluate "For Hire" services for custom work',
  ],
  behaviors: [
    'Power user - uses keyboard shortcuts when available',
    'Skips marketing content, jumps straight to technical details',
    'Looks for documentation, README files, repo quality indicators',
    'Values speed and efficiency over hand-holding',
    'Will evaluate based on repo stars, activity, and code quality',
  ],
};

test.describe.serial(`Persona: ${persona.name} - ${persona.role}`, () => {
  let collector: ObservationCollector;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    collector = new ObservationCollector(persona);
    collector.startSession();
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    attachConsoleErrorListener(page, collector);
  });

  test.afterAll(async () => {
    const reportPath = collector.endSession();
    console.log(`\n📊 Observations saved to: ${reportPath}\n`);
    await page.close();
  });

  test('Task 1: Navigate directly to GitHub repos', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);
    await collector.captureScreenshot(
      page,
      'homepage-looking-for-github',
      'Marcus lands on homepage, immediately looking for GitHub links'
    );

    // Developer wants to get to code FAST
    const githubLinks = await page.locator('a[href*="github.com"]').all();

    if (githubLinks.length > 0) {
      success = true;
      notes.push(`Found ${githubLinks.length} GitHub links`);
      collector.noteSuccess('GitHub links are visible on the page', 'Homepage');

      // Check if they're prominent or buried
      const firstGithubLink = githubLinks[0];
      const isVisible = await firstGithubLink.isVisible();
      if (isVisible) {
        notes.push('GitHub links are visible without scrolling');
      } else {
        collector.note('GitHub links require scrolling to find', 'Homepage');
      }
    } else {
      collector.noteFrustration(
        'No GitHub links visible. As a developer, this is the FIRST thing I look for.',
        'Homepage'
      );
      notes.push('No GitHub links found on homepage');
    }

    // Critical: Developer perspective on site design
    collector.critique(
      'This is a landing page when it should be a developer portal. ' +
      'Developers want: (1) Direct repo links, (2) Quick copy-paste instructions, ' +
      '(3) Tech stack info. Marketing-speak wastes our time.',
      'Site Design Philosophy'
    );

    collector.suggestRedesign(
      'Lead with code, not marketing. Consider a design like: ' +
      '"git clone [repo]" front and center, with framework badges (SOC2, HIPAA, etc.)',
      'Homepage'
    );

    collector.recordTask(
      'Navigate directly to GitHub repos',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Assess repo quality/documentation', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    // Try to find and click a GitHub link
    const githubLink = page.locator('a[href*="github.com"]').first();

    if (await githubLink.count() > 0) {
      await collector.captureScreenshot(
        page,
        'about-to-click-github',
        'Found a GitHub link, about to evaluate the repo'
      );

      // Note: We can't actually navigate to GitHub in the test, but we can evaluate the link
      const href = await githubLink.getAttribute('href');
      notes.push(`Found GitHub link: ${href}`);
      success = true;

      // Check link quality
      if (href?.includes('github.com/')) {
        collector.noteSuccess('GitHub links are properly formatted', 'Links');
      }
    } else {
      collector.noteFrustration(
        'Cannot assess repository quality because no GitHub links are accessible',
        'Site'
      );
      notes.push('No GitHub links to assess');
    }

    // What would make this better for developers
    collector.noteMissing(
      'Repo quality indicators on the site itself: star count, last update, ' +
      'contributor count. Don\'t make me click through to evaluate.',
      'Portfolio Items'
    );

    collector.noteMissing(
      'README preview or summary of what\'s in each repo. ' +
      'How many policies? What format? What\'s the file structure?',
      'Portfolio Items'
    );

    collector.recordTask(
      'Assess repo quality/documentation',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Find HITRUST-specific policies', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'searching-for-hitrust',
      'Searching for HITRUST-specific policies'
    );

    // Look for HITRUST mentions
    const pageContent = await page.textContent('body');
    const hasHitrust = pageContent?.toLowerCase().includes('hitrust');

    if (hasHitrust) {
      success = true;
      notes.push('HITRUST mentioned on the page');
      collector.noteSuccess('Found HITRUST content', 'Page');

      // Try to find a direct link
      const hitrustLink = await page.locator('a:has-text("HITRUST")').count();
      if (hitrustLink > 0) {
        notes.push('Found clickable HITRUST link');
      } else {
        collector.note('HITRUST mentioned but no direct link/CTA', 'Navigation');
      }
    } else {
      collector.noteFrustration(
        'Cannot find HITRUST-specific policies. As a health tech developer, this is critical.',
        'Homepage'
      );
      notes.push('No HITRUST content found');
    }

    // Developer-specific critique
    collector.critique(
      'No search functionality. Developers expect Cmd+K or a search bar ' +
      'to quickly find specific content.',
      'Site Features'
    );

    collector.suggestRedesign(
      'Add framework tags/filters: click "HITRUST" to see only HITRUST repos. ' +
      'This is table stakes for any developer-focused site.',
      'Navigation'
    );

    collector.recordTask(
      'Find HITRUST-specific policies',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Locate licensing information', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'looking-for-license',
      'Developer checking licensing - need to know if this is truly open source'
    );

    const pageContent = await page.textContent('body');

    // Developers look for specific license identifiers
    const licenses = ['MIT', 'Apache', 'GPL', 'CC-BY', 'BSD', 'ISC'];
    let foundLicense: string | null = null;

    for (const license of licenses) {
      if (pageContent?.includes(license)) {
        foundLicense = license;
        break;
      }
    }

    if (foundLicense) {
      success = true;
      notes.push(`Found ${foundLicense} license mention`);
      collector.noteSuccess(`License type identified: ${foundLicense}`, 'Page Content');
    } else if (pageContent?.toLowerCase().includes('license')) {
      success = true;
      notes.push('License mentioned but type unclear');
      collector.noteConfusion(
        'License mentioned but specific type not immediately clear',
        'Page Content'
      );
    } else {
      collector.noteFrustration(
        'No licensing info visible. Developers NEED to know the license before using.',
        'Page'
      );
      notes.push('No license information found');
    }

    collector.noteMissing(
      'SPDX license identifier or badge. Developers expect to see "MIT" or "Apache-2.0" clearly displayed.',
      'Repo Cards'
    );

    collector.recordTask(
      'Locate licensing information',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Evaluate "For Hire" services', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'looking-for-services',
      'Checking if professional services are available for custom work'
    );

    const pageContent = await page.textContent('body');
    const hasServices = pageContent?.toLowerCase().includes('hire') ||
                       pageContent?.toLowerCase().includes('custom') ||
                       pageContent?.toLowerCase().includes('consulting') ||
                       pageContent?.toLowerCase().includes('service');

    if (hasServices) {
      success = true;
      notes.push('Professional services mentioned');
      collector.noteSuccess('Found services/consulting offering', 'Page');
    } else {
      collector.note(
        'No professional services advertised. This could be a business opportunity.',
        'Page'
      );
      notes.push('No services section found');
    }

    // Developer perspective on services
    collector.critique(
      'If offering services, show me: (1) What you\'ve built before, ' +
      '(2) Turnaround time, (3) Pricing range. Developers hate vague "contact us" CTAs.',
      'Services Section'
    );

    collector.noteMissing(
      'Case studies or portfolio of custom compliance work. ' +
      'As a technical decision maker, I need proof of expertise.',
      'Services'
    );

    collector.recordTask(
      'Evaluate "For Hire" services',
      success,
      notes.join('; ')
    );
  });

  test('Critical Evaluation: Developer experience assessment', async () => {
    collector.startTask();
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'developer-ux-evaluation',
      'Final developer experience evaluation'
    );

    // Fundamental developer experience critique
    collector.critique(
      'This site is designed for browsers, not builders. ' +
      'Developers want: installation commands, file structures, API docs. ' +
      'This site offers: cards, descriptions, external links.',
      'Site Philosophy'
    );

    collector.suggestRedesign(
      'Consider alternative approaches entirely: ' +
      '(1) An npm package: "npx create-compliance-policies" ' +
      '(2) A CLI tool: "compliance-policies init soc2" ' +
      '(3) A GitHub organization with clear READMEs instead of a website',
      'Product Approach'
    );

    collector.suggestRedesign(
      'If keeping the website, make it developer-first: ' +
      'Code snippets, installation instructions, file tree previews, ' +
      'and live examples instead of marketing copy.',
      'Homepage Redesign'
    );

    collector.noteMissing(
      'Getting Started guide. How do I go from "I found this site" to ' +
      '"I have policies in my repo" in under 5 minutes?',
      'Documentation'
    );

    collector.noteMissing(
      'Contribution guidelines. Can I submit improvements? ' +
      'Is this a community project or a commercial offering?',
      'Open Source'
    );

    notes.push('Developer experience evaluation complete');

    collector.recordTask(
      'Critical Evaluation: Developer experience assessment',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: Power user browsing', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Developer exploration patterns
    const explorationActions = [
      { action: 'keyboard', description: 'Test keyboard navigation (Tab, Enter)' },
      { action: 'rightClick', description: 'Check for useful context menus' },
      { action: 'viewSource', description: 'Evaluate page structure/semantics' },
      { action: 'checkMeta', description: 'Look at meta tags, structured data' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'keyboard':
            // Tab through focusable elements
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            const focusedElement = await page.evaluate(() => {
              const el = document.activeElement;
              return el?.tagName + (el?.getAttribute('href') ? ` (${el.getAttribute('href')})` : '');
            });
            notes.push(`Tab navigation works, focused on: ${focusedElement}`);
            break;

          case 'checkMeta':
            const meta = await page.evaluate(() => {
              const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
              const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
              return { description, ogTitle };
            });
            if (meta.description) {
              notes.push('Has meta description');
            } else {
              collector.note('Missing meta description - bad for SEO', 'Head');
            }
            break;

          case 'viewSource':
            // Check for semantic HTML
            const semanticElements = await page.evaluate(() => {
              return {
                nav: document.querySelectorAll('nav').length,
                main: document.querySelectorAll('main').length,
                article: document.querySelectorAll('article').length,
                section: document.querySelectorAll('section').length,
              };
            });
            notes.push(`Semantic HTML: nav(${semanticElements.nav}), main(${semanticElements.main}), article(${semanticElements.article})`);
            break;
        }
      } catch (error) {
        notes.push(`${action}: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-developer-complete',
      'Completed power user exploration'
    );

    collector.recordTask(
      'Free Exploration: Power user browsing',
      true,
      notes.join('; ')
    );
  });
});
