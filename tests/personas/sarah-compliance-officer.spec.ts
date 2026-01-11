import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  clickWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: Sarah - Compliance Officer
 *
 * Background: Works at a startup needing SOC2 compliance, non-technical
 * Goals: Find appropriate policy templates, understand licensing, evaluate fit
 * Behaviors: Scans headings, looks for trust signals, checks external links
 *
 * Critical Evaluation: Does this site give me confidence to use these policies?
 * What's missing that would help me decide?
 */
const persona: Persona = {
  name: 'Sarah',
  role: 'Compliance Officer',
  background:
    'Works at a Series A startup that needs to achieve SOC2 compliance for enterprise sales. ' +
    'Non-technical background, came from operations. Evaluating options to accelerate compliance.',
  goals: [
    'Find appropriate policy templates for SOC2',
    'Understand licensing terms (can she use these commercially?)',
    'Evaluate if these policies are trustworthy and complete',
    'Compare different offerings to find the best fit',
    'Find contact information for custom work',
  ],
  behaviors: [
    'Scans headings and summaries before reading details',
    'Looks for trust signals (testimonials, logos, certifications)',
    'Checks that external links work',
    'Wants clear pricing/licensing information upfront',
    'Skeptical of "free" offerings - looks for the catch',
  ],
};

// Serial execution - tests simulate a continuous user session
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

  test('Task 1: Understand site purpose from homepage', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    // Navigate to homepage
    await navigateWithTracking(page, '/', collector);
    await collector.captureScreenshot(
      page,
      'homepage-initial',
      'First impression of the homepage - trying to understand what this site offers'
    );

    // Give the page a moment to fully render
    await page.waitForLoadState('networkidle');

    // Evaluate: Can Sarah understand what this site is about within 10 seconds?
    const pageContent = await page.textContent('body');
    const title = await page.title();

    // Look for clear value proposition
    const hasValueProp = pageContent?.toLowerCase().includes('policy') ||
                         pageContent?.toLowerCase().includes('compliance') ||
                         pageContent?.toLowerCase().includes('soc2');

    if (hasValueProp) {
      success = true;
      notes.push('Site mentions policies/compliance - purpose somewhat clear');
      collector.noteSuccess('Found mention of policies/compliance', 'Homepage');
    } else {
      collector.noteConfusion(
        'Not immediately clear what this site offers or who it is for',
        'Homepage'
      );
      notes.push('Purpose not immediately clear from homepage');
    }

    // Look for missing trust elements
    const hasTrustSignals = pageContent?.toLowerCase().includes('client') ||
                           pageContent?.toLowerCase().includes('testimonial') ||
                           pageContent?.toLowerCase().includes('company') ||
                           pageContent?.toLowerCase().includes('trusted');

    if (!hasTrustSignals) {
      collector.noteMissing(
        'No visible trust signals (testimonials, client logos, company info)',
        'Homepage'
      );
      notes.push('Missing trust signals for a compliance-focused site');
    }

    // Critical evaluation
    collector.critique(
      'As a compliance officer, I need to trust the source. ' +
      'There should be clear information about who created these policies and their credentials.',
      'Homepage'
    );

    await collector.captureScreenshot(
      page,
      'homepage-evaluated',
      'After scanning the homepage to understand the site purpose'
    );

    collector.recordTask(
      'Understand site purpose from homepage',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Find SOC2 policy templates', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'searching-for-soc2',
      'Looking for SOC2-specific policy templates'
    );

    // Look for SOC2 mentions on the page
    const soc2Links = await page.locator('a, h2, h3, .portfolio-item, [class*="card"]')
      .filter({ hasText: /soc\s*2/i })
      .all();

    if (soc2Links.length > 0) {
      success = true;
      notes.push(`Found ${soc2Links.length} SOC2-related items`);
      collector.noteSuccess('SOC2 policies are visible and findable', 'Homepage/Portfolio');

      // Try clicking the first SOC2 link
      try {
        await clickWithTracking(page, 'a:has-text("SOC2"), a:has-text("SOC 2")', collector);
        await page.waitForLoadState('networkidle');

        await collector.captureScreenshot(
          page,
          'soc2-detail',
          'Viewing SOC2 policy details after clicking'
        );

        // Check if we landed on useful information
        const detailContent = await page.textContent('body');
        if (detailContent?.includes('github.com')) {
          notes.push('Links to GitHub repository found');
        }
      } catch {
        notes.push('Could not navigate to SOC2 detail page');
        collector.noteConfusion('SOC2 link did not lead to expected content', 'Navigation');
      }
    } else {
      collector.noteFrustration(
        'Cannot easily find SOC2-specific policies - need to scan entire page',
        'Homepage'
      );
      notes.push('SOC2 policies not prominently displayed');

      // Suggest redesign
      collector.suggestRedesign(
        'Compliance officers search by framework name. ' +
        'Consider organizing content by compliance framework (SOC2, HIPAA, HITRUST) with clear categories.',
        'Site Structure'
      );
    }

    await page.goto('/');
    collector.trackPageLoad();

    collector.recordTask(
      'Find SOC2 policy templates',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Evaluate licensing terms', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'looking-for-licensing',
      'Searching for licensing information - can I use these policies commercially?'
    );

    // Look for licensing information
    const pageContent = await page.textContent('body');
    const hasLicense = pageContent?.toLowerCase().includes('license') ||
                      pageContent?.toLowerCase().includes('cc-by') ||
                      pageContent?.toLowerCase().includes('creative commons') ||
                      pageContent?.toLowerCase().includes('open source');

    if (hasLicense) {
      success = true;
      notes.push('Found licensing information on the page');
      collector.noteSuccess('Licensing information is visible', 'Page Content');

      // Check if it's clear enough
      if (pageContent?.includes('CC-BY-SA')) {
        notes.push('CC-BY-SA license identified');
        collector.note(
          'License is CC-BY-SA - but is it clear what this means for commercial use?',
          'Licensing'
        );
      }
    } else {
      collector.noteFrustration(
        'Cannot find clear licensing information. As a compliance officer, ' +
        'I need to know if we can legally use these policies in our business.',
        'Entire Site'
      );
      notes.push('Licensing information not found or not prominent');
    }

    // Critical evaluation on licensing clarity
    collector.critique(
      'For a site offering policy documents, licensing should be FRONT AND CENTER. ' +
      'Compliance officers need to verify they can use these documents legally ' +
      'before investing time evaluating them.',
      'Site Design'
    );

    collector.noteMissing(
      'Clear licensing FAQ or explanation. What can I do with these policies? ' +
      'Can I modify them? Do I need to attribute? Can I use them commercially?',
      'Site Content'
    );

    collector.recordTask(
      'Evaluate licensing terms',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Compare Health Tech vs minimal SOC2', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'comparing-offerings',
      'Trying to compare different policy offerings to understand which fits my needs'
    );

    // Look for multiple offerings
    const portfolioItems = await page.locator('.portfolio-item, [class*="card"], article').all();

    if (portfolioItems.length > 1) {
      notes.push(`Found ${portfolioItems.length} offerings to compare`);

      // Check if there's any comparison or differentiation visible
      const pageContent = await page.textContent('body');
      const hasComparison = pageContent?.toLowerCase().includes('vs') ||
                           pageContent?.toLowerCase().includes('compare') ||
                           pageContent?.toLowerCase().includes('difference');

      if (!hasComparison) {
        collector.noteMissing(
          'No comparison chart or clear differentiation between offerings. ' +
          'How do I know if I need "Minimal SOC2" vs "Health Tech"?',
          'Portfolio Section'
        );
        notes.push('No comparison feature found');

        collector.suggestRedesign(
          'Add a comparison table or decision tree: ' +
          '"Choose Minimal SOC2 if you need X, choose Health Tech if you need Y"',
          'Portfolio'
        );
      }

      success = true;
    } else {
      collector.noteConfusion(
        'Cannot find multiple offerings to compare',
        'Homepage'
      );
      notes.push('Could not find offerings to compare');
    }

    collector.critique(
      'As someone evaluating compliance options, I need to quickly understand ' +
      'the difference between offerings. A "Which one is right for me?" guide would be invaluable.',
      'Content Strategy'
    );

    collector.recordTask(
      'Compare Health Tech vs minimal SOC2',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Find contact for custom work', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'looking-for-contact',
      'Searching for contact information to inquire about custom policy work'
    );

    // Look for contact information
    const pageContent = await page.textContent('body');
    const hasEmail = pageContent?.match(/[\w.-]+@[\w.-]+\.\w+/);
    const hasContactLink = await page.locator('a:has-text("contact"), a:has-text("email"), a[href^="mailto:"]').count();
    const hasForHire = pageContent?.toLowerCase().includes('for hire') ||
                      pageContent?.toLowerCase().includes('custom') ||
                      pageContent?.toLowerCase().includes('consulting');

    if (hasEmail || hasContactLink > 0) {
      success = true;
      notes.push('Contact information found');
      collector.noteSuccess('Found way to contact for custom work', 'Page Content');
    }

    if (hasForHire) {
      notes.push('"For Hire" or custom services mentioned');
      collector.noteSuccess('Custom/consulting services are mentioned', 'Page Content');
    } else {
      collector.noteMissing(
        'No clear "Services" or "Custom Work" section. ' +
        'If custom policy creation is offered, it should be prominently featured.',
        'Navigation'
      );
    }

    if (!success) {
      collector.noteFrustration(
        'Cannot find how to contact someone about custom policy needs. ' +
        'This is a missed business opportunity.',
        'Entire Site'
      );
      notes.push('No clear contact or services information');
    }

    collector.critique(
      'For a professional services offering, the contact/engagement path should be crystal clear. ' +
      'Consider adding a prominent CTA: "Need custom policies? Contact us."',
      'Business Model'
    );

    collector.recordTask(
      'Find contact for custom work',
      success,
      notes.join('; ')
    );
  });

  test('Critical Evaluation: Overall confidence assessment', async () => {
    collector.startTask();
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'final-evaluation',
      'Final evaluation: Would I recommend this site to my leadership?'
    );

    // Collect critical evaluation observations
    collector.critique(
      'As a compliance officer, I need to justify my recommendations to leadership. ' +
      'This site lacks: (1) Clear credentials of policy authors, ' +
      '(2) Case studies or testimonials from companies who used these, ' +
      '(3) Information about how policies are kept up-to-date.',
      'Trust & Credibility'
    );

    collector.noteMissing(
      'FAQ section addressing common compliance officer concerns: ' +
      'Are these policies auditor-tested? When were they last updated? ' +
      'What frameworks do they map to?',
      'Content'
    );

    collector.noteMissing(
      'Version history or changelog for policies. ' +
      'Compliance frameworks evolve - how do I know these are current?',
      'Content'
    );

    collector.suggestRedesign(
      'Consider restructuring the site around the compliance officer journey: ' +
      '1. What frameworks are covered? ' +
      '2. What do I get? (preview of actual policies) ' +
      '3. Who else uses these? (social proof) ' +
      '4. How do I get started?',
      'Site Architecture'
    );

    collector.suggestRedesign(
      'Add a "Why trust these policies?" section featuring: ' +
      'Author credentials, methodology, audit firm feedback if any, update frequency.',
      'Homepage'
    );

    notes.push('Critical evaluation complete - see observations for details');

    collector.recordTask(
      'Critical Evaluation: Overall confidence assessment',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: Browse as a skeptical compliance officer', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Exploration actions Sarah might naturally take
    const explorationActions = [
      { action: 'scroll', description: 'Scroll down to see full page content' },
      { action: 'checkLinks', description: 'Check if external links work' },
      { action: 'lookForAbout', description: 'Look for About/Team information' },
      { action: 'checkFooter', description: 'Check footer for additional info' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'scroll':
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(1000);
            await collector.captureScreenshot(page, 'explore-scrolled', description);
            break;

          case 'checkLinks':
            const externalLinks = await page.locator('a[href^="http"]').count();
            notes.push(`Found ${externalLinks} external links`);
            if (externalLinks === 0) {
              collector.noteMissing('No external links to GitHub repos or resources visible', 'Page');
            }
            break;

          case 'lookForAbout':
            const aboutLink = await page.locator('a:has-text("About"), a:has-text("Team")').count();
            if (aboutLink === 0) {
              collector.noteMissing(
                'No About or Team page. Who is behind this?',
                'Navigation'
              );
            }
            break;

          case 'checkFooter':
            const footer = await page.locator('footer').count();
            if (footer > 0) {
              await collector.captureScreenshot(page, 'explore-footer', description);
              const footerContent = await page.locator('footer').textContent();
              if (!footerContent?.includes('@') && !footerContent?.includes('contact')) {
                collector.note('Footer exists but no contact info', 'Footer');
              }
            }
            break;
        }
      } catch (error) {
        notes.push(`${action} failed: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-complete',
      'Completed free exploration as Sarah the Compliance Officer'
    );

    // Always mark exploration as successful - observations are what matter
    collector.recordTask(
      'Free Exploration: Browse as skeptical compliance officer',
      true,
      notes.join('; ')
    );
  });
});
