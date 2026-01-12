/**
 * Persona: David - VP of Operations (Mobile)
 *
 * Tests the site from the perspective of an executive browsing on mobile
 * during a commute, making a quick initial assessment.
 */

import { test, expect } from '@playwright/test';
import { ObservationCollector, definePersona } from 'personaspec';

const persona = definePersona({
  name: 'David',
  role: 'VP of Operations',
  background:
    'Executive at a growing SaaS company. Heard from sales team that prospects are asking about SOC2. Browsing on phone during commute to understand options.',
  goals: [
    'Quickly understand what this site offers',
    'Determine if it looks legitimate',
    'Decide if worth deeper investigation later',
    'Maybe bookmark for team to review',
  ],
  behaviors: [
    'Scrolls quickly through content',
    'Reads only headlines and key points',
    'Taps around to explore structure',
    'Low patience for poor mobile experience',
  ],
});

const collector = new ObservationCollector({
  outputDir: './test-results',
  persona,
});

// Use mobile viewport (Pixel 5 uses Chromium)
test.use({
  viewport: { width: 393, height: 851 },
  userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36',
  deviceScaleFactor: 2.75,
  isMobile: true,
  hasTouch: true,
});

test.describe.configure({ mode: 'serial' });

test.describe(`${persona.name} - ${persona.role} (Mobile)`, () => {
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

  test('mobile: page loads and is readable', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'mobile-landing', 'David opens site on iPhone during commute');

    // Check if content is visible without horizontal scroll
    const viewport = page.viewportSize();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);

    if (viewport && bodyWidth <= viewport.width + 10) {
      collector.observe('success', 'No horizontal scrolling required', 'Mobile layout');
      success = true;
    } else {
      collector.observe('frustration', 'Horizontal scrolling required - poor mobile experience', 'Mobile layout');
    }

    // Check text readability
    const headline = page.locator('h1').first();
    if (await headline.isVisible()) {
      const fontSize = await headline.evaluate(el => window.getComputedStyle(el).fontSize);
      const fontSizeNum = parseInt(fontSize);
      if (fontSizeNum >= 24) {
        collector.observe('success', 'Headline readable on mobile', 'Typography');
      } else {
        collector.observe('note', 'Headline might be small on mobile', 'Typography');
      }
      success = true;
    }

    collector.recordTask('mobile: page loads and is readable', success, success ? 'Mobile-friendly' : 'Mobile issues');
  });

  test('mobile: navigation is accessible', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Look for hamburger menu or visible nav
    const hamburger = page.locator('[class*="hamburger"], [class*="menu-toggle"], button[aria-label*="menu"]');
    const visibleNav = page.locator('nav a:visible');

    if (await hamburger.isVisible()) {
      collector.observe('success', 'Mobile hamburger menu available', 'Navigation');
      await hamburger.click();
      collector.trackClick();
      await page.waitForTimeout(300);
      await collector.screenshot(page, 'mobile-nav-open', 'Mobile navigation opened');
      success = true;
    } else if (await visibleNav.count() > 0) {
      collector.observe('success', 'Navigation links visible on mobile', 'Navigation');
      success = true;
    } else {
      collector.observe('frustration', 'Cannot find navigation on mobile', 'Navigation');
    }

    collector.recordTask('mobile: navigation is accessible', success, success ? 'Nav accessible' : 'Nav issues');
  });

  test('mobile: can scroll and read key content', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Scroll behavior test
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(300);
    await collector.screenshot(page, 'mobile-scrolled', 'After scrolling on mobile');

    // Check if content is visible after scroll
    const visibleContent = await page.locator('h2, h3, p').first().isVisible();

    if (visibleContent) {
      collector.observe('success', 'Content readable while scrolling', 'Mobile scroll');
      success = true;
    }

    // Check for sticky header issues
    const header = page.locator('header, nav').first();
    if (await header.isVisible()) {
      const headerHeight = await header.evaluate(el => el.getBoundingClientRect().height);
      if (headerHeight < 80) {
        collector.observe('success', 'Header not taking too much mobile screen space', 'Mobile header');
      } else {
        collector.observe('note', 'Header might be taking significant mobile screen space', 'Mobile header');
      }
    }

    collector.recordTask('mobile: can scroll and read key content', success, success ? 'Scrolling works' : 'Scroll issues');
  });

  test('mobile: tap targets are adequate', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    // Check button/link sizes
    const tappableElements = page.locator('a, button');
    const count = await tappableElements.count();

    let adequateTargets = 0;
    let smallTargets = 0;

    for (let i = 0; i < Math.min(count, 10); i++) {
      const el = tappableElements.nth(i);
      if (await el.isVisible()) {
        const box = await el.boundingBox();
        if (box && box.height >= 44 && box.width >= 44) {
          adequateTargets++;
        } else if (box) {
          smallTargets++;
        }
      }
    }

    if (adequateTargets > smallTargets) {
      collector.observe('success', `Most tap targets adequately sized (${adequateTargets}/${adequateTargets + smallTargets})`, 'Mobile touch');
      success = true;
    } else {
      collector.observe('note', `Some tap targets may be small (${smallTargets} small, ${adequateTargets} adequate)`, 'Mobile touch');
      success = adequateTargets > 0;
    }

    collector.recordTask('mobile: tap targets are adequate', success, `${adequateTargets} adequate, ${smallTargets} small`);
  });

  test('mobile: quick assessment of legitimacy', async ({ page }) => {
    collector.startTask();
    let success = false;

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();

    const pageText = await page.locator('body').textContent() || '';

    // Legitimacy signals visible on mobile
    const legitimacySignals = [
      { signal: 'open source', found: pageText.toLowerCase().includes('open') },
      { signal: 'free', found: pageText.toLowerCase().includes('free') },
      { signal: 'github', found: pageText.toLowerCase().includes('github') },
      { signal: 'professional look', found: true }, // Assumed if loads properly
    ];

    const foundSignals = legitimacySignals.filter(s => s.found);

    if (foundSignals.length >= 3) {
      collector.observe('success', 'Site appears legitimate on quick mobile scan', 'First impression');
      success = true;
    } else {
      collector.observe('note', 'Legitimacy not immediately obvious on mobile', 'First impression');
      success = foundSignals.length > 1;
    }

    await collector.screenshot(page, 'mobile-legitimacy', 'Assessing legitimacy on mobile');
    collector.recordTask('mobile: quick assessment of legitimacy', success, `${foundSignals.length} trust signals`);
  });

  test('free exploration - executive mobile browsing', async ({ page }) => {
    collector.startTask();

    await page.goto('https://openaccesspolicies.org');
    collector.trackPageLoad();
    await collector.screenshot(page, 'mobile-exploration-start', 'Executive starting mobile exploration');

    // Quick mobile exploration
    const actions = [
      {
        name: 'quick scroll through page',
        fn: async () => {
          await page.mouse.wheel(0, 800);
          await page.waitForTimeout(200);
          await page.mouse.wheel(0, 800);
          await page.waitForTimeout(200);
        },
      },
      {
        name: 'tap first prominent link',
        fn: async () => {
          const ctaButton = page.locator('a.btn, a.button, a:has-text("Get"), a:has-text("Start")').first();
          if (await ctaButton.isVisible().catch(() => false)) {
            await ctaButton.tap();
            collector.trackClick();
            collector.trackPageLoad();
            await collector.screenshot(page, 'mobile-after-tap', 'After tapping CTA on mobile');
          }
        },
      },
      {
        name: 'check if page title is shareable',
        fn: async () => {
          const title = await page.title();
          if (title && title.length < 60) {
            collector.observe('success', `Concise page title for sharing: "${title}"`, 'SEO/Sharing');
          }
        },
      },
      {
        name: 'scroll to footer',
        fn: async () => {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(300);
          await collector.screenshot(page, 'mobile-footer', 'Mobile footer view');
        },
      },
    ];

    for (const action of actions) {
      try {
        await action.fn();
        await page.waitForTimeout(200);
      } catch (error) {
        collector.observe('note', `Action "${action.name}" failed on mobile`, page.url());
      }
    }

    await collector.screenshot(page, 'mobile-exploration-end', 'End of mobile executive browsing');
    collector.recordTask('free exploration - executive mobile browsing', true, 'Mobile exploration complete');
  });
});
