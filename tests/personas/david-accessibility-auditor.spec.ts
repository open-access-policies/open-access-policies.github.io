import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: David - Accessibility Auditor
 *
 * Background: WCAG compliance specialist
 * Goals: Navigate with keyboard only, verify focus states, check color contrast
 * Behaviors: Keyboard-only, checks semantic structure, tests at different zoom levels
 *
 * Critical Evaluation: What fundamental accessibility issues exist?
 * Should the site structure be redesigned for better a11y?
 */
const persona: Persona = {
  name: 'David',
  role: 'Accessibility Auditor',
  background:
    'Accessibility consultant who evaluates websites for WCAG 2.1 AA compliance. ' +
    'Tests sites for clients in regulated industries (healthcare, government, finance).',
  goals: [
    'Navigate entire site using only keyboard',
    'Verify focus indicators are visible',
    'Check heading hierarchy',
    'Test at 200% zoom',
    'Verify link text is descriptive',
  ],
  behaviors: [
    'Uses keyboard only - never touches the mouse',
    'Checks semantic HTML structure',
    'Tests at multiple zoom levels (100%, 150%, 200%)',
    'Evaluates color contrast ratios',
    'Examines ARIA usage and screen reader compatibility',
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

  test('Task 1: Keyboard-only navigation', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'keyboard-nav-start',
      'Starting keyboard-only navigation test'
    );

    // Test Tab navigation
    const focusedElements: string[] = [];
    const focusIssues: string[] = [];

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');

      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;

        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);

        return {
          tag: el.tagName,
          text: el.textContent?.slice(0, 50) || '',
          href: el.getAttribute('href') || '',
          hasFocusStyle: styles.outlineWidth !== '0px' ||
                        styles.boxShadow !== 'none' ||
                        el.matches(':focus-visible'),
          isVisible: rect.width > 0 && rect.height > 0,
        };
      });

      if (focusInfo) {
        focusedElements.push(`${focusInfo.tag}: ${focusInfo.text.slice(0, 20)}`);

        if (!focusInfo.hasFocusStyle) {
          focusIssues.push(`No visible focus on: ${focusInfo.tag}`);
        }
        if (!focusInfo.isVisible) {
          focusIssues.push(`Hidden element received focus: ${focusInfo.tag}`);
        }
      }
    }

    // Capture state after tabbing
    await collector.captureScreenshot(
      page,
      'keyboard-nav-mid',
      'After tabbing through page elements - check focus visibility'
    );

    notes.push(`Tabbed through ${focusedElements.length} elements`);

    if (focusIssues.length === 0) {
      success = true;
      collector.noteSuccess('All focusable elements have visible focus indicators', 'Keyboard Nav');
    } else {
      collector.noteFrustration(
        `Found ${focusIssues.length} focus issues: ${focusIssues.slice(0, 3).join('; ')}`,
        'Keyboard Navigation'
      );
      notes.push(`Focus issues: ${focusIssues.length}`);
    }

    // Test skip link
    await page.keyboard.press('Tab');
    const hasSkipLink = await page.evaluate(() => {
      const firstLink = document.querySelector('a');
      return firstLink?.textContent?.toLowerCase().includes('skip') ||
             firstLink?.getAttribute('href')?.includes('#main');
    });

    if (!hasSkipLink) {
      collector.noteMissing(
        'No skip navigation link. Screen reader users need to skip repetitive navigation.',
        'Navigation'
      );
    }

    collector.recordTask(
      'Keyboard-only navigation',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Verify focus indicators', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    // Focus on interactive elements and check visibility
    const interactiveSelectors = ['a', 'button', 'input', 'select', 'textarea', '[tabindex]'];
    const focusProblems: string[] = [];

    for (const selector of interactiveSelectors) {
      const elements = await page.locator(selector).all();

      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        try {
          await elements[i].focus();

          const hasFocus = await elements[i].evaluate((el) => {
            const styles = window.getComputedStyle(el);
            // Check for any visual focus indicator
            return (
              styles.outlineStyle !== 'none' ||
              styles.outlineWidth !== '0px' ||
              styles.boxShadow !== 'none' ||
              el.classList.contains('focus') ||
              el.matches(':focus-visible')
            );
          });

          if (!hasFocus) {
            const text = await elements[i].textContent();
            focusProblems.push(`${selector}: "${text?.slice(0, 20)}"`);
          }
        } catch {
          // Element might not be focusable, that's ok
        }
      }
    }

    await collector.captureScreenshot(
      page,
      'focus-indicator-test',
      'Testing focus indicator visibility on interactive elements'
    );

    if (focusProblems.length === 0) {
      success = true;
      collector.noteSuccess('Focus indicators present on tested elements', 'Focus States');
    } else {
      collector.noteFrustration(
        `${focusProblems.length} elements missing visible focus: ${focusProblems.slice(0, 3).join(', ')}`,
        'Focus Indicators'
      );
    }

    notes.push(`Focus problems found: ${focusProblems.length}`);

    collector.critique(
      'WCAG 2.4.7 requires visible focus indication. Vision model should verify ' +
      'that focus states are clearly distinguishable in screenshots.',
      'WCAG Compliance'
    );

    collector.recordTask(
      'Verify focus indicators',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Check heading hierarchy', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    // Analyze heading structure
    const headingAnalysis = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const structure = headings.map(h => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim().slice(0, 50) || '',
      }));

      // Check for hierarchy issues
      const issues: string[] = [];
      let prevLevel = 0;

      const h1Count = structure.filter(h => h.level === 1).length;
      if (h1Count === 0) issues.push('No H1 found');
      if (h1Count > 1) issues.push(`Multiple H1s found: ${h1Count}`);

      for (const heading of structure) {
        if (heading.level > prevLevel + 1) {
          issues.push(`Skipped heading level: h${prevLevel} to h${heading.level}`);
        }
        prevLevel = heading.level;
      }

      return { structure, issues, count: headings.length };
    });

    notes.push(`Found ${headingAnalysis.count} headings`);
    notes.push(`Hierarchy: ${headingAnalysis.structure.map(h => `h${h.level}`).join(' → ')}`);

    if (headingAnalysis.issues.length === 0) {
      success = true;
      collector.noteSuccess('Heading hierarchy is properly structured', 'Semantic Structure');
    } else {
      collector.noteFrustration(
        `Heading hierarchy issues: ${headingAnalysis.issues.join('; ')}`,
        'Heading Structure'
      );
    }

    await collector.captureScreenshot(
      page,
      'heading-hierarchy',
      `Heading analysis: ${headingAnalysis.structure.map(h => `h${h.level}: ${h.text.slice(0,15)}`).join(', ')}`
    );

    collector.critique(
      'Screen reader users navigate by headings. Proper hierarchy (H1 → H2 → H3) ' +
      'is essential. Skipped levels or missing H1 breaks navigation.',
      'Document Structure'
    );

    collector.recordTask(
      'Check heading hierarchy',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Test at 200% zoom', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'zoom-100',
      'Page at 100% zoom (baseline)'
    );

    // Set viewport to simulate 200% zoom (halve the viewport)
    const originalViewport = page.viewportSize();
    await page.setViewportSize({
      width: Math.floor((originalViewport?.width || 1280) / 2),
      height: Math.floor((originalViewport?.height || 720) / 2),
    });

    await collector.captureScreenshot(
      page,
      'zoom-200',
      'Page at 200% zoom - checking for content overflow and readability'
    );

    // Check for horizontal scrolling (a common zoom failure)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    if (!hasHorizontalScroll) {
      success = true;
      collector.noteSuccess('No horizontal scrolling at 200% zoom', 'Responsive');
    } else {
      collector.noteFrustration(
        'Horizontal scrolling required at 200% zoom - fails WCAG 1.4.10',
        'Zoom Support'
      );
    }

    // Check for text overlap or truncation
    const layoutIssues = await page.evaluate(() => {
      const issues: string[] = [];
      const elements = document.querySelectorAll('p, span, div, a');

      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        if (styles.overflow === 'hidden' && styles.textOverflow === 'ellipsis') {
          issues.push('Text truncation detected');
        }
      });

      return issues;
    });

    notes.push(`Horizontal scroll: ${hasHorizontalScroll}`);
    notes.push(`Layout issues at zoom: ${layoutIssues.length}`);

    // Reset viewport
    if (originalViewport) {
      await page.setViewportSize(originalViewport);
    }

    collector.critique(
      'WCAG 1.4.10 requires content to be viewable at 400% zoom without horizontal scrolling. ' +
      'Testing at 200% is a minimum. Check screenshots for text overlap, truncation, or layout breaking.',
      'Zoom Compliance'
    );

    collector.recordTask(
      'Test at 200% zoom',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Verify descriptive link text', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    // Analyze link text
    const linkAnalysis = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const badLinks: string[] = [];
      const goodLinks: string[] = [];

      const vaguePhrases = [
        'click here', 'here', 'read more', 'learn more', 'more',
        'link', 'this', 'this link', 'info', 'details'
      ];

      links.forEach(link => {
        const text = link.textContent?.trim().toLowerCase() || '';
        const href = link.getAttribute('href') || '';

        // Skip anchor links
        if (href.startsWith('#')) return;

        // Check for vague link text
        if (vaguePhrases.includes(text) || text.length < 3) {
          badLinks.push(`"${text}" → ${href.slice(0, 30)}`);
        } else {
          goodLinks.push(text.slice(0, 30));
        }
      });

      return { badLinks, goodLinks, total: links.length };
    });

    notes.push(`Total links: ${linkAnalysis.total}`);
    notes.push(`Descriptive links: ${linkAnalysis.goodLinks.length}`);
    notes.push(`Vague links: ${linkAnalysis.badLinks.length}`);

    if (linkAnalysis.badLinks.length === 0) {
      success = true;
      collector.noteSuccess('All link text is descriptive', 'Link Text');
    } else {
      collector.noteFrustration(
        `Found ${linkAnalysis.badLinks.length} links with vague text: ${linkAnalysis.badLinks.slice(0, 3).join(', ')}`,
        'Link Text'
      );
    }

    await collector.captureScreenshot(
      page,
      'link-text-audit',
      'Auditing link text for descriptiveness'
    );

    collector.critique(
      'WCAG 2.4.4 requires link purpose to be clear from link text alone. ' +
      '"Click here" or "Read more" fails this. Screen reader users navigate by links.',
      'Link Accessibility'
    );

    collector.recordTask(
      'Verify descriptive link text',
      success,
      notes.join('; ')
    );
  });

  test('Task 6: Check image alt text', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    // Analyze images
    const imageAnalysis = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const issues: string[] = [];
      const good: string[] = [];

      images.forEach(img => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src') || '';

        if (alt === null) {
          issues.push(`Missing alt: ${src.slice(0, 30)}`);
        } else if (alt === '') {
          // Empty alt is OK for decorative images
          good.push('decorative (empty alt)');
        } else if (alt.length < 5) {
          issues.push(`Too short alt "${alt}": ${src.slice(0, 20)}`);
        } else {
          good.push(alt.slice(0, 30));
        }
      });

      return { issues, good, total: images.length };
    });

    notes.push(`Total images: ${imageAnalysis.total}`);
    notes.push(`Images with proper alt: ${imageAnalysis.good.length}`);
    notes.push(`Images with issues: ${imageAnalysis.issues.length}`);

    if (imageAnalysis.issues.length === 0) {
      success = true;
      collector.noteSuccess('All images have appropriate alt text', 'Image Alt');
    } else {
      collector.noteFrustration(
        `${imageAnalysis.issues.length} images missing or have poor alt text`,
        'Image Accessibility'
      );
    }

    await collector.captureScreenshot(
      page,
      'image-alt-audit',
      'Auditing image alt text'
    );

    collector.recordTask(
      'Check image alt text',
      success,
      notes.join('; ')
    );
  });

  test('Critical Evaluation: Fundamental accessibility assessment', async () => {
    collector.startTask();
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'accessibility-final-evaluation',
      'Final accessibility evaluation'
    );

    // Comprehensive accessibility critique
    collector.critique(
      'Overall accessibility assessment: Vision model should evaluate whether ' +
      'this site could pass a WCAG 2.1 AA audit. Key areas: color contrast, ' +
      'touch target sizes, text sizing, and visual hierarchy.',
      'WCAG Compliance'
    );

    collector.noteMissing(
      'Accessibility statement. Sites offering compliance documents should ' +
      'model accessibility best practices with a public accessibility statement.',
      'Site Content'
    );

    collector.suggestRedesign(
      'For a compliance-focused site, consider making accessibility a feature: ' +
      '"Our site and policies meet WCAG 2.1 AA standards" as a trust signal.',
      'Branding'
    );

    collector.suggestRedesign(
      'Implement an accessibility toolbar or settings: ' +
      'font size controls, high contrast mode, reduced motion option. ' +
      'This demonstrates commitment to accessibility.',
      'Site Features'
    );

    // Check for ARIA
    const ariaUsage = await page.evaluate(() => {
      const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-describedby]');
      return ariaElements.length;
    });

    if (ariaUsage === 0) {
      collector.note(
        'No ARIA attributes detected. While semantic HTML is preferred, ' +
        'some ARIA may improve screen reader experience.',
        'ARIA'
      );
    }

    notes.push('Comprehensive accessibility evaluation complete');

    collector.recordTask(
      'Critical Evaluation: Fundamental accessibility assessment',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: Accessibility-focused browsing', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Accessibility auditor exploration patterns
    const explorationActions = [
      { action: 'testColorContrast', description: 'Evaluate color contrast visually' },
      { action: 'checkLandmarks', description: 'Check for proper landmark regions' },
      { action: 'testFormLabels', description: 'Check form field labels' },
      { action: 'checkLanguage', description: 'Verify lang attribute' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'testColorContrast':
            // This is best evaluated via vision model
            await collector.captureScreenshot(
              page,
              'explore-color-contrast',
              'Evaluate color contrast ratios - vision model should check text/background combinations'
            );
            collector.note(
              'Color contrast evaluation needed via vision model. ' +
              'Check body text, links, buttons, and any gray/light text.',
              'Color Contrast'
            );
            break;

          case 'checkLandmarks':
            const landmarks = await page.evaluate(() => {
              return {
                main: !!document.querySelector('main'),
                nav: !!document.querySelector('nav'),
                header: !!document.querySelector('header'),
                footer: !!document.querySelector('footer'),
                aside: !!document.querySelector('aside'),
              };
            });
            notes.push(`Landmarks: main(${landmarks.main}), nav(${landmarks.nav}), header(${landmarks.header}), footer(${landmarks.footer})`);

            const missingLandmarks = Object.entries(landmarks)
              .filter(([_, exists]) => !exists)
              .map(([name]) => name);

            if (missingLandmarks.length > 0) {
              collector.noteMissing(
                `Missing landmark regions: ${missingLandmarks.join(', ')}`,
                'Page Structure'
              );
            }
            break;

          case 'testFormLabels':
            const formFields = await page.evaluate(() => {
              const inputs = document.querySelectorAll('input, select, textarea');
              let unlabeled = 0;
              inputs.forEach(input => {
                const id = input.getAttribute('id');
                const hasLabel = id && document.querySelector(`label[for="${id}"]`);
                const hasAriaLabel = input.getAttribute('aria-label');
                if (!hasLabel && !hasAriaLabel) unlabeled++;
              });
              return { total: inputs.length, unlabeled };
            });
            if (formFields.unlabeled > 0) {
              collector.noteFrustration(
                `${formFields.unlabeled} form fields without proper labels`,
                'Forms'
              );
            }
            notes.push(`Form fields: ${formFields.total} total, ${formFields.unlabeled} unlabeled`);
            break;

          case 'checkLanguage':
            const langAttr = await page.evaluate(() => {
              return document.documentElement.getAttribute('lang');
            });
            if (!langAttr) {
              collector.noteFrustration(
                'Missing lang attribute on html element - required for screen readers',
                'HTML Element'
              );
            } else {
              notes.push(`Language attribute: ${langAttr}`);
            }
            break;
        }
      } catch (error) {
        notes.push(`${action} failed: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-accessibility-complete',
      'Completed accessibility-focused exploration'
    );

    collector.recordTask(
      'Free Exploration: Accessibility-focused browsing',
      true,
      notes.join('; ')
    );
  });
});
