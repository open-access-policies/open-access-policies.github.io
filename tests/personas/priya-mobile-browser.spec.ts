import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: Priya - Mobile Browser
 *
 * Background: Checking site on phone during commute
 * Goals: Browse portfolio, read about offerings, find contact info
 * Behaviors: Scrolls frequently, taps links, expects fast load times
 *
 * Critical Evaluation: Is this site mobile-first or desktop-first?
 * Should it be the opposite? Does mobile experience feel like an afterthought?
 */
const persona: Persona = {
  name: 'Priya',
  role: 'Mobile Browser',
  background:
    'Product manager at a fintech startup, checking out compliance options on her phone ' +
    'during her morning commute. Has limited time and patience for slow/clunky mobile experiences.',
  goals: [
    'Browse portfolio on mobile viewport',
    'Read policy descriptions comfortably',
    'Navigate to external repos easily',
    'Find contact information quickly',
    'Complete tasks one-handed if possible',
  ],
  behaviors: [
    'Scrolls frequently and quickly',
    'Taps links with thumb (bottom of screen preferred)',
    'Expects fast load times on mobile network',
    'Gets frustrated by tiny tap targets',
    'Will leave if horizontal scrolling is required',
  ],
};

// Use mobile viewport
test.use({
  viewport: { width: 375, height: 667 }, // iPhone SE/8 size
  isMobile: true,
  hasTouch: true,
});

test.describe.serial(`Persona: ${persona.name} - ${persona.role}`, () => {
  let collector: ObservationCollector;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    collector = new ObservationCollector(persona);
    collector.startSession();
    // Create context with mobile settings
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      hasTouch: true,
    });
    page = await context.newPage();
  });

  test.beforeEach(async () => {
    attachConsoleErrorListener(page, collector);
  });

  test.afterAll(async () => {
    const reportPath = collector.endSession();
    console.log(`\n📊 Observations saved to: ${reportPath}\n`);
    await page.close();
  });

  test('Task 1: Browse portfolio on mobile viewport', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'mobile-homepage-initial',
      'First view of site on mobile device - iPhone SE viewport'
    );

    // Check for horizontal scrolling (mobile UX killer)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    if (hasHorizontalScroll) {
      collector.noteFrustration(
        'Horizontal scrolling required on mobile. This is a critical mobile UX failure.',
        'Viewport'
      );
      notes.push('FAIL: Horizontal scroll detected');
    } else {
      success = true;
      notes.push('No horizontal scrolling');
    }

    // Scroll through the page to see all content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    await collector.captureScreenshot(
      page,
      'mobile-homepage-scrolled',
      'Mobile view after scrolling - checking content layout'
    );

    // Check if portfolio items are visible and readable
    const portfolioItems = await page.locator('.portfolio-item, [class*="card"], article, .grid > *').count();
    notes.push(`Found ${portfolioItems} content items`);

    if (portfolioItems > 0) {
      collector.noteSuccess('Portfolio content is visible on mobile', 'Content');
    }

    // Evaluate mobile-first design
    collector.critique(
      'Evaluate if this is truly mobile-first or just responsive. ' +
      'Does the layout feel native to mobile, or is it a squeezed desktop site?',
      'Mobile Design Philosophy'
    );

    collector.recordTask(
      'Browse portfolio on mobile viewport',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Read policy descriptions comfortably', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'mobile-readability-test',
      'Testing text readability on mobile device'
    );

    // Check text sizing
    const textAnalysis = await page.evaluate(() => {
      const body = document.body;
      const paragraphs = document.querySelectorAll('p');
      const computedStyle = window.getComputedStyle(body);

      let smallTextCount = 0;
      paragraphs.forEach(p => {
        const size = parseFloat(window.getComputedStyle(p).fontSize);
        if (size < 14) smallTextCount++;
      });

      return {
        bodyFontSize: computedStyle.fontSize,
        paragraphCount: paragraphs.length,
        smallTextCount,
        lineHeight: computedStyle.lineHeight,
      };
    });

    notes.push(`Body font size: ${textAnalysis.bodyFontSize}`);
    notes.push(`Small text instances: ${textAnalysis.smallTextCount}`);

    const bodySize = parseFloat(textAnalysis.bodyFontSize);
    if (bodySize >= 16) {
      success = true;
      collector.noteSuccess('Base font size is mobile-appropriate (16px+)', 'Typography');
    } else {
      collector.noteFrustration(
        `Base font size ${textAnalysis.bodyFontSize} is too small for comfortable mobile reading`,
        'Typography'
      );
    }

    if (textAnalysis.smallTextCount > 0) {
      collector.note(
        `${textAnalysis.smallTextCount} text elements below 14px - may be hard to read on mobile`,
        'Typography'
      );
    }

    collector.critique(
      'Mobile reading requires larger text, more line spacing, and shorter line lengths. ' +
      'Check if policy descriptions are easy to scan during a commute.',
      'Mobile Readability'
    );

    collector.recordTask(
      'Read policy descriptions comfortably',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Navigate to external repos easily', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    // Find external links
    const externalLinks = await page.locator('a[href^="http"]').all();
    notes.push(`Found ${externalLinks.length} external links`);

    if (externalLinks.length > 0) {
      // Check tap target sizes
      const tapTargetIssues: string[] = [];

      for (let i = 0; i < Math.min(externalLinks.length, 5); i++) {
        const link = externalLinks[i];
        const box = await link.boundingBox();

        if (box) {
          // Apple HIG recommends 44x44 minimum tap target
          if (box.width < 44 || box.height < 44) {
            const text = await link.textContent();
            tapTargetIssues.push(`"${text?.slice(0, 20)}" (${Math.round(box.width)}x${Math.round(box.height)})`);
          }
        }
      }

      if (tapTargetIssues.length === 0) {
        success = true;
        collector.noteSuccess('External link tap targets are adequately sized', 'Touch Targets');
      } else {
        collector.noteFrustration(
          `${tapTargetIssues.length} links have tap targets below 44px minimum: ${tapTargetIssues.slice(0, 2).join(', ')}`,
          'Touch Targets'
        );
        notes.push(`Tap target issues: ${tapTargetIssues.length}`);
      }
    } else {
      collector.noteConfusion(
        'No external links found to repositories',
        'Navigation'
      );
    }

    await collector.captureScreenshot(
      page,
      'mobile-external-links',
      'External links on mobile - evaluating tap target sizes'
    );

    collector.suggestRedesign(
      'Consider adding prominent "View on GitHub" buttons with large tap targets (44x44px minimum). ' +
      'Make external link destinations obvious on mobile.',
      'Mobile Navigation'
    );

    collector.recordTask(
      'Navigate to external repos easily',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Find contact information quickly', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'mobile-looking-for-contact',
      'Searching for contact info on mobile'
    );

    // Quick scan for contact info
    const pageContent = await page.textContent('body');
    const hasEmail = pageContent?.match(/[\w.-]+@[\w.-]+\.\w+/);
    const hasContactLink = await page.locator('a[href^="mailto:"], a:has-text("contact")').count();

    // Scroll to bottom (common place for contact info)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await collector.captureScreenshot(
      page,
      'mobile-footer-contact',
      'Checking footer for contact information'
    );

    if (hasEmail || hasContactLink > 0) {
      success = true;
      notes.push('Contact information found');
      collector.noteSuccess('Contact information is accessible', 'Contact');
    } else {
      collector.noteFrustration(
        'Cannot quickly find contact info on mobile. ' +
        'Should be in footer or accessible from mobile nav.',
        'Contact'
      );
      notes.push('Contact info not easily found');
    }

    // Mobile-specific contact suggestions
    collector.noteMissing(
      'Sticky contact button or floating action button (FAB) for mobile. ' +
      'Common pattern for mobile sites needing easy contact access.',
      'Mobile UX'
    );

    collector.recordTask(
      'Find contact information quickly',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Test touch target sizes', async () => {
    collector.startTask();
    let success = true;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    // Analyze all interactive elements
    const touchTargetAnalysis = await page.evaluate(() => {
      const interactive = document.querySelectorAll('a, button, input, select, [onclick]');
      const issues: Array<{element: string, width: number, height: number}> = [];

      interactive.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.width < 44 || rect.height < 44) {
            const text = el.textContent?.trim().slice(0, 20) || el.tagName;
            issues.push({
              element: text,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            });
          }
        }
      });

      return { total: interactive.length, issues };
    });

    notes.push(`Total interactive elements: ${touchTargetAnalysis.total}`);
    notes.push(`Below 44px minimum: ${touchTargetAnalysis.issues.length}`);

    if (touchTargetAnalysis.issues.length > 0) {
      success = false;
      collector.noteFrustration(
        `${touchTargetAnalysis.issues.length} touch targets below 44px: ` +
        touchTargetAnalysis.issues.slice(0, 3).map(i => `"${i.element}" (${i.width}x${i.height})`).join(', '),
        'Touch Targets'
      );
    } else {
      collector.noteSuccess('All touch targets meet 44px minimum', 'Touch Targets');
    }

    await collector.captureScreenshot(
      page,
      'mobile-touch-targets',
      'Evaluating touch target sizes for thumb-friendly navigation'
    );

    collector.critique(
      'Apple HIG and WCAG 2.5.5 recommend minimum 44x44px touch targets. ' +
      'Small targets are especially problematic for one-handed mobile use.',
      'Mobile Accessibility'
    );

    collector.recordTask(
      'Test touch target sizes',
      success,
      notes.join('; ')
    );
  });

  test('Critical Evaluation: Mobile-first or afterthought?', async () => {
    collector.startTask();
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'mobile-design-evaluation',
      'Critical evaluation: Is this mobile-first design?'
    );

    // Fundamental mobile design critique
    collector.critique(
      'Key question: Was this site designed for mobile first, or is mobile an afterthought? ' +
      'Look for: hamburger menu that works, thumb-zone-optimized CTAs, ' +
      'mobile-appropriate whitespace, and content prioritization for small screens.',
      'Mobile Strategy'
    );

    // Check for mobile navigation
    const hasMobileNav = await page.locator('.hamburger, .mobile-menu, [class*="mobile"], button[aria-label*="menu"]').count();

    if (hasMobileNav === 0) {
      collector.noteMissing(
        'No mobile-specific navigation detected. How do mobile users navigate a multi-page site?',
        'Navigation'
      );
    }

    collector.suggestRedesign(
      'Consider mobile-first rebuild: ' +
      '(1) Bottom navigation bar for thumb access, ' +
      '(2) Card-based content layout, ' +
      '(3) Pull-to-refresh for updates, ' +
      '(4) Swipe gestures for navigation.',
      'Mobile Redesign'
    );

    collector.suggestRedesign(
      'For a compliance resource site, mobile might mean: ' +
      '"I\'m in a meeting and need to quickly check which policies cover HIPAA." ' +
      'Design for quick lookup, not extended reading.',
      'Mobile Use Cases'
    );

    collector.noteMissing(
      'PWA (Progressive Web App) capability. ' +
      'Allow mobile users to install the site for quick offline access.',
      'Mobile Features'
    );

    notes.push('Mobile design evaluation complete');

    collector.recordTask(
      'Critical Evaluation: Mobile-first or afterthought?',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: One-handed mobile browsing', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Simulate one-handed browsing patterns
    const explorationActions = [
      { action: 'thumbZone', description: 'Check if key actions are in thumb zone' },
      { action: 'scrollTest', description: 'Test smooth scrolling behavior' },
      { action: 'orientationNote', description: 'Note landscape/portrait optimization' },
      { action: 'performanceNote', description: 'Note perceived performance' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'thumbZone':
            // Thumb zone is bottom third of screen
            const bottomThirdY = 667 * 0.66; // Bottom third of iPhone SE height
            const elementsInThumbZone = await page.evaluate((y) => {
              const elements = document.querySelectorAll('a, button');
              let count = 0;
              elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top > y) count++;
              });
              return count;
            }, bottomThirdY);

            notes.push(`Interactive elements in thumb zone: ${elementsInThumbZone}`);
            if (elementsInThumbZone === 0) {
              collector.note(
                'No interactive elements in thumb zone (bottom third of screen). ' +
                'One-handed use is difficult.',
                'Thumb Zone'
              );
            }
            break;

          case 'scrollTest':
            // Quick scroll test
            const startTime = Date.now();
            await page.evaluate(() => {
              window.scrollTo({ top: 500, behavior: 'smooth' });
            });
            await page.waitForTimeout(500);
            await page.evaluate(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            const scrollTime = Date.now() - startTime;
            notes.push(`Scroll test completed in ${scrollTime}ms`);
            break;

          case 'orientationNote':
            collector.note(
              'Tested in portrait mode (375x667). ' +
              'Should also test landscape for users who prefer wider view.',
              'Orientation'
            );
            break;

          case 'performanceNote':
            const timing = await page.evaluate(() => {
              const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              return {
                loadTime: Math.round(perf?.loadEventEnd - perf?.startTime) || 0,
                domContentLoaded: Math.round(perf?.domContentLoadedEventEnd - perf?.startTime) || 0,
              };
            });
            notes.push(`Page load: ${timing.loadTime}ms, DOM ready: ${timing.domContentLoaded}ms`);

            if (timing.loadTime > 3000) {
              collector.noteFrustration(
                `Slow page load on mobile: ${timing.loadTime}ms. Target is under 3 seconds.`,
                'Performance'
              );
            }
            break;
        }
      } catch (error) {
        notes.push(`${action}: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-mobile-complete',
      'Completed mobile browsing exploration'
    );

    collector.recordTask(
      'Free Exploration: One-handed mobile browsing',
      true,
      notes.join('; ')
    );
  });
});
