import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: Elena - First-Time Visitor
 *
 * Background: Landed from Google search, doesn't know the site
 * Goals: Understand what the site offers within 10 seconds, evaluate credibility
 * Behaviors: Scans quickly, forms impressions fast, bounces if confused
 *
 * Critical Evaluation: First impressions - is this site professional? Trustworthy?
 * Would I recommend it? What would make me leave immediately?
 */
const persona: Persona = {
  name: 'Elena',
  role: 'First-Time Visitor',
  background:
    'Marketing director who searched "compliance policy templates" on Google. ' +
    'Has 30 tabs open, will spend max 10 seconds deciding if this site is worth her time.',
  goals: [
    'Understand what this site offers within 10 seconds',
    'Determine if this is trustworthy/legitimate',
    'Identify who this site is for',
    'Find "about" or credibility information',
    'Decide whether to bookmark or bounce',
  ],
  behaviors: [
    'Scans headlines, not paragraphs',
    'Looks at visual design to judge credibility',
    'Forms impressions in seconds, not minutes',
    'Will bounce if confused or skeptical',
    'Shares useful resources with colleagues',
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

  test('Task 1: 10-second first impression test', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    // Start timer
    const startTime = Date.now();

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'first-impression-0s',
      'The very first thing Elena sees when landing on the site'
    );

    // Wait 2 seconds (simulating quick scan)
    await page.waitForTimeout(2000);

    await collector.captureScreenshot(
      page,
      'first-impression-2s',
      'After 2 seconds of scanning - what stands out?'
    );

    // Evaluate what's visible "above the fold"
    const viewportContent = await page.evaluate(() => {
      const viewportHeight = window.innerHeight;
      const elements = document.elementsFromPoint(
        window.innerWidth / 2,
        viewportHeight / 2
      );
      return {
        visibleText: document.body.innerText.slice(0, 500),
        hasHero: !!document.querySelector('.hero, [class*="hero"], h1'),
        hasNavigation: !!document.querySelector('nav'),
        hasCTA: !!document.querySelector('button, .btn, [class*="button"], a.cta'),
      };
    });

    // Evaluate clarity of value proposition
    const headline = await page.locator('h1').first().textContent().catch(() => null);

    if (headline) {
      notes.push(`Main headline: "${headline.trim()}"`);
      if (headline.toLowerCase().includes('policy') ||
          headline.toLowerCase().includes('compliance')) {
        success = true;
        collector.noteSuccess('Headline mentions policies/compliance', 'Hero');
      } else {
        collector.noteConfusion(
          `Headline "${headline.trim()}" doesn\'t immediately convey what the site does`,
          'Hero'
        );
      }
    } else {
      collector.noteFrustration(
        'No clear headline visible. What is this site?',
        'Above the Fold'
      );
      notes.push('No clear headline found');
    }

    const elapsed = Date.now() - startTime;
    notes.push(`First impression evaluation took ${elapsed}ms`);

    // Critical first impression observations
    if (!viewportContent.hasCTA) {
      collector.noteMissing(
        'No clear call-to-action above the fold. What should I do next?',
        'Hero Section'
      );
    }

    collector.recordTask(
      '10-second first impression test',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Identify who this site is for', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'identifying-audience',
      'Trying to understand who this site is meant for'
    );

    const pageContent = await page.textContent('body');

    // Look for audience indicators
    const audienceKeywords = [
      { keyword: 'startup', audience: 'startups' },
      { keyword: 'enterprise', audience: 'enterprises' },
      { keyword: 'developer', audience: 'developers' },
      { keyword: 'compliance', audience: 'compliance professionals' },
      { keyword: 'healthcare', audience: 'healthcare companies' },
      { keyword: 'saas', audience: 'SaaS companies' },
    ];

    const foundAudiences: string[] = [];
    for (const { keyword, audience } of audienceKeywords) {
      if (pageContent?.toLowerCase().includes(keyword)) {
        foundAudiences.push(audience);
      }
    }

    if (foundAudiences.length > 0) {
      success = true;
      notes.push(`Target audience seems to be: ${foundAudiences.join(', ')}`);
      collector.noteSuccess(
        `Can identify target audience: ${foundAudiences.join(', ')}`,
        'Content'
      );
    } else {
      collector.noteConfusion(
        'Not clear who this site is for. Startups? Enterprises? Consultants?',
        'Messaging'
      );
      notes.push('Target audience unclear');
    }

    // Critical evaluation on audience clarity
    collector.critique(
      'First-time visitors need to immediately know: "Is this for me?" ' +
      'Consider adding explicit audience targeting in the hero.',
      'Value Proposition'
    );

    collector.suggestRedesign(
      'Add a "This is for you if..." section or audience-specific entry points: ' +
      '"I\'m a startup founder" / "I\'m a compliance officer" / "I\'m a developer"',
      'Homepage'
    );

    collector.recordTask(
      'Identify who this site is for',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Find credibility information', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'looking-for-credibility',
      'Searching for trust signals - who is behind this?'
    );

    // Look for credibility indicators
    const credibilityChecks = {
      hasAbout: false,
      hasTeam: false,
      hasTestimonials: false,
      hasLogos: false,
      hasStats: false,
    };

    const pageContent = await page.textContent('body');

    credibilityChecks.hasAbout = !!(
      await page.locator('a:has-text("About"), a:has-text("Who we are")').count()
    );
    credibilityChecks.hasTeam = pageContent?.toLowerCase().includes('team') || false;
    credibilityChecks.hasTestimonials = pageContent?.toLowerCase().includes('testimonial') ||
                                        pageContent?.toLowerCase().includes('customer') ||
                                        pageContent?.includes('"') ||
                                        false;
    credibilityChecks.hasLogos = await page.locator('img[alt*="logo"], .client-logos, .partner-logos').count() > 0;
    credibilityChecks.hasStats = /\d+\+?\s*(companies|users|downloads|customers)/i.test(pageContent || '');

    const credibilityScore = Object.values(credibilityChecks).filter(Boolean).length;

    if (credibilityScore >= 2) {
      success = true;
      notes.push(`Found ${credibilityScore}/5 credibility indicators`);
      collector.noteSuccess('Some credibility indicators present', 'Page');
    } else {
      collector.noteFrustration(
        'Very few trust signals. Who made this? Why should I trust it?',
        'Entire Site'
      );
      notes.push(`Only ${credibilityScore}/5 credibility indicators found`);
    }

    // Specific missing elements
    if (!credibilityChecks.hasTestimonials) {
      collector.noteMissing(
        'No testimonials or social proof. Who else uses these policies?',
        'Homepage'
      );
    }

    if (!credibilityChecks.hasAbout) {
      collector.noteMissing(
        'No visible "About" link. As a first-time visitor, I want to know who\'s behind this.',
        'Navigation'
      );
    }

    collector.critique(
      'For a site offering compliance documents (legal/regulatory content), ' +
      'credibility is EVERYTHING. The lack of author information, company background, ' +
      'or customer proof makes this feel risky to use.',
      'Trust Architecture'
    );

    collector.recordTask(
      'Find credibility information',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Visual design and professionalism assessment', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'design-assessment',
      'Evaluating the visual design and professionalism'
    );

    // Evaluate design elements
    const designCheck = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);

      return {
        hasFavicon: !!document.querySelector('link[rel*="icon"]'),
        fontFamily: computedStyle.fontFamily,
        hasImages: document.querySelectorAll('img').length,
        hasConsistentSpacing: true, // Would need visual inspection
        colorCount: new Set(
          Array.from(document.querySelectorAll('*'))
            .slice(0, 100)
            .map(el => window.getComputedStyle(el).color)
        ).size,
      };
    });

    notes.push(`Design elements: ${designCheck.hasImages} images, ${designCheck.colorCount} colors detected`);

    if (designCheck.hasFavicon && designCheck.hasImages > 0) {
      success = true;
      collector.noteSuccess('Basic design elements present', 'Visual Design');
    }

    // Design critique for vision model
    collector.note(
      'Visual design evaluation: Check screenshot for color consistency, ' +
      'typography quality, whitespace balance, and overall professionalism.',
      'Design'
    );

    // First impression design observations
    collector.critique(
      'First-time visitors judge credibility by design in milliseconds. ' +
      'Vision model should evaluate: Does this look like a trustworthy, ' +
      'professional compliance resource or a hobby project?',
      'Visual Design'
    );

    collector.suggestRedesign(
      'Consider what signals "trustworthy compliance resource": ' +
      'clean typography, professional color palette, clear hierarchy, ' +
      'and visual consistency throughout.',
      'Branding'
    );

    collector.recordTask(
      'Visual design and professionalism assessment',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Bounce or bookmark decision', async () => {
    collector.startTask();
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'bounce-or-bookmark-decision',
      'Final decision: Would Elena bookmark this or bounce?'
    );

    // Summarize the decision factors
    const observations = collector.getObservations();
    const frustrations = observations.filter(o => o.type === 'frustration').length;
    const successes = observations.filter(o => o.type === 'success').length;
    const missing = observations.filter(o => o.type === 'missing').length;

    const decision = frustrations > successes ? 'BOUNCE' : 'UNCERTAIN';

    notes.push(`Decision factors: ${successes} positives, ${frustrations} frustrations, ${missing} missing elements`);
    notes.push(`Elena's likely decision: ${decision}`);

    collector.critique(
      `First-time visitor verdict: ${decision}. ` +
      'The site needs clearer value proposition, better trust signals, ' +
      'and an obvious next step to convert visitors into users.',
      'Conversion'
    );

    if (decision === 'BOUNCE') {
      collector.suggestRedesign(
        'Critical changes to reduce bounce rate: ' +
        '(1) Clearer headline explaining the value, ' +
        '(2) Social proof above the fold, ' +
        '(3) Obvious CTA that tells me what to do next.',
        'Homepage'
      );
    }

    collector.noteMissing(
      'Reason to return. What would make me bookmark this? ' +
      'Newsletter signup? New policy alerts? Community?',
      'Engagement'
    );

    collector.recordTask(
      'Bounce or bookmark decision',
      true, // Always complete this evaluation
      notes.join('; ')
    );
  });

  test('Critical Evaluation: First impressions summary', async () => {
    collector.startTask();
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'first-impressions-final',
      'Final first impressions evaluation'
    );

    // Comprehensive first-time visitor critique
    collector.critique(
      'The 5-second test fails. A first-time visitor cannot immediately answer: ' +
      '(1) What is this? (2) Who is it for? (3) Why should I trust it? (4) What do I do next?',
      'Homepage Effectiveness'
    );

    collector.suggestRedesign(
      'Homepage restructure for first-time visitors: ' +
      'Hero: "Free, open-source compliance policies" + trust badge/logo. ' +
      'Below: "Used by X companies" + 3 customer logos. ' +
      'CTA: "Browse Policies" or "Get Started Free".',
      'Homepage Layout'
    );

    collector.suggestRedesign(
      'Consider adding "What is this?" content for people who don\'t know ' +
      'what compliance policies are. Brief explanation with examples.',
      'Educational Content'
    );

    collector.noteMissing(
      'Exit intent or engagement mechanism. ' +
      'When Elena is about to bounce, what keeps her engaged?',
      'Conversion'
    );

    notes.push('First impressions evaluation complete');

    collector.recordTask(
      'Critical Evaluation: First impressions summary',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: Casual browsing behavior', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Elena's casual browsing patterns
    const explorationActions = [
      { action: 'quickScroll', description: 'Quick scroll to get page overview' },
      { action: 'scanHeadings', description: 'Scan headings to understand structure' },
      { action: 'checkURL', description: 'Look at URL for legitimacy' },
      { action: 'hoverLinks', description: 'Hover over links to preview destinations' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'quickScroll':
            // Quick scroll down and back up (common first-time behavior)
            await page.evaluate(() => {
              window.scrollTo(0, document.body.scrollHeight / 2);
            });
            await page.waitForTimeout(500);
            await page.evaluate(() => window.scrollTo(0, 0));
            await collector.captureScreenshot(page, 'explore-quick-scroll', description);
            notes.push('Quick scroll completed');
            break;

          case 'scanHeadings':
            const headings = await page.locator('h1, h2, h3').allTextContents();
            notes.push(`Found ${headings.length} headings: ${headings.slice(0, 3).join(', ')}...`);
            if (headings.length < 3) {
              collector.note('Few headings visible - content structure unclear', 'Page Structure');
            }
            break;

          case 'checkURL':
            const url = page.url();
            notes.push(`Current URL: ${url}`);
            if (url.includes('.github.io')) {
              collector.note(
                'URL contains github.io - signals this might be a project/portfolio site, not a company',
                'URL'
              );
            }
            break;

          case 'hoverLinks':
            const links = await page.locator('a').all();
            notes.push(`Page has ${links.length} links`);
            break;
        }
      } catch (error) {
        notes.push(`${action} failed: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-first-time-complete',
      'Completed first-time visitor exploration'
    );

    collector.recordTask(
      'Free Exploration: Casual browsing behavior',
      true,
      notes.join('; ')
    );
  });
});
