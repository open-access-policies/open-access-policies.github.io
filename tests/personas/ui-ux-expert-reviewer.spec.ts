/**
 * Persona: Victoria - UI/UX Expert Reviewer
 *
 * Background: Senior design systems lead at a top-tier design agency. 15 years of
 * experience in visual design, information architecture, and user experience.
 * Previously led design at major tech companies. Known for obsessive attention
 * to pixel-level detail and creating harmonious visual hierarchies.
 *
 * Perspective: Evaluates sites through a critical design lens. Notices micro-
 * interactions, spacing inconsistencies, alignment issues, and visual rhythm
 * problems that most users only feel subconsciously. Believes great UX is
 * invisible - users should accomplish goals without noticing the interface.
 *
 * Goals:
 * - Assess visual hierarchy and information architecture
 * - Identify spacing, alignment, and rhythm inconsistencies
 * - Evaluate cognitive load and information density
 * - Check typography scale and readability
 * - Verify visual consistency across sections
 * - Ensure first-time users can quickly find what they need
 */

import { test, expect, Page } from '@playwright/test';
import { ObservationCollector } from '../utils/observation-collector';

const persona = {
  name: 'Victoria',
  role: 'UI/UX Expert Reviewer',
  background: `Senior design systems lead at a top-tier design agency with 15 years of experience.
Previously led design at major tech companies. Known for obsessive attention to pixel-level
detail and creating harmonious visual hierarchies. Has reviewed hundreds of sites and can
instantly spot spacing inconsistencies, alignment issues, and visual rhythm problems.`,
  goals: [
    'Assess visual hierarchy and information architecture',
    'Identify spacing, alignment, and rhythm inconsistencies',
    'Evaluate cognitive load and information density',
    'Check typography scale and readability',
    'Verify visual consistency across sections',
    'Ensure first-time users can quickly find what they need',
  ],
  behaviors: [
    'Measures spacing with pixel-level precision',
    'Evaluates visual weight and balance',
    'Checks alignment across elements',
    'Assesses typography hierarchy',
    'Reviews color contrast and consistency',
    'Analyzes information density and whitespace',
    'Tests visual flow and eye tracking patterns',
  ],
};

let collector: ObservationCollector;

test.describe.serial(`${persona.name} - ${persona.role}`, () => {
  test.beforeAll(async () => {
    collector = new ObservationCollector(persona);
    collector.startSession();
  });

  test.afterAll(async () => {
    collector.endSession();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
    collector.trackPageLoad();
  });

  test('First Impression & Visual Hierarchy Assessment', async ({ page }) => {
    const startTime = Date.now();

    // Capture full page screenshot
    await collector.captureScreenshot(page, 'full-page-first-impression', 'Initial page load for visual hierarchy assessment');

    // Analyze hero section
    const heroSection = await page.$('.hero-section');
    const heroStyles = heroSection ? await heroSection.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        textAlign: styles.textAlign,
        background: styles.background,
      };
    }) : null;

    // Check headline hierarchy
    const headlines = await page.$$eval('h1, h2, h3', (els) =>
      els.map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 50),
        fontSize: window.getComputedStyle(el).fontSize,
        fontWeight: window.getComputedStyle(el).fontWeight,
        marginTop: window.getComputedStyle(el).marginTop,
        marginBottom: window.getComputedStyle(el).marginBottom,
      }))
    );

    // Check for consistent heading sizes
    const h2Sizes = headlines.filter(h => h.tag === 'H2').map(h => h.fontSize);
    const uniqueH2Sizes = [...new Set(h2Sizes)];

    if (uniqueH2Sizes.length > 2) {
      collector.critique(
        'Typography Hierarchy',
        `Found ${uniqueH2Sizes.length} different H2 sizes (${uniqueH2Sizes.join(', ')}). This breaks visual rhythm. Use a consistent type scale.`
      );
    }

    // Check visual weight of hero
    const heroHeadline = await page.$('.hero-headline');
    if (heroHeadline) {
      const heroHeadlineSize = await heroHeadline.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );
      collector.note(
        'Hero Typography',
        `Hero headline is ${heroHeadlineSize}. Should dominate the visual hierarchy and be significantly larger than section headings.`
      );
    }

    // Check for competing visual elements above the fold
    const aboveFoldElements = await page.$$eval('*', (els) => {
      const viewportHeight = window.innerHeight;
      return els.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < viewportHeight && rect.height > 50;
      }).length;
    });

    if (aboveFoldElements > 30) {
      collector.critique(
        'Visual Density',
        `${aboveFoldElements} significant elements above the fold. This creates visual noise. Consider reducing density or creating clearer visual groupings.`
      );
    }

    collector.recordTask('First Impression & Visual Hierarchy Assessment', true,
      `Analyzed visual hierarchy: ${headlines.length} headings found`);
  });

  test('Spacing & Alignment Audit', async ({ page }) => {
    const startTime = Date.now();

    await collector.captureScreenshot(page, 'spacing-audit', 'Analyzing spacing and alignment');

    // Collect all section paddings
    const sectionPaddings = await page.$$eval('section, .trust-section, .comparison-section, .faq-section, .about-section, [style*="padding"]', (els) =>
      els.map((el) => {
        const styles = window.getComputedStyle(el);
        return {
          className: el.className,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
        };
      })
    );

    // Check for inconsistent vertical spacing
    const verticalSpacings = sectionPaddings.map(s => s.marginBottom).filter(Boolean);
    const uniqueVerticalSpacings = [...new Set(verticalSpacings)];

    if (uniqueVerticalSpacings.length > 4) {
      collector.critique(
        'Spacing Inconsistency',
        `Found ${uniqueVerticalSpacings.length} different vertical spacing values. Design systems typically use 4-6 spacing values max. Current values: ${uniqueVerticalSpacings.slice(0, 5).join(', ')}...`
      );
    }

    // Check container alignment
    const containerWidths = await page.$$eval('.container, .trust-grid, .portfolio-grid, .comparison-table', (els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          className: el.className,
          width: rect.width,
          left: rect.left,
        };
      })
    );

    // Check if containers are consistently aligned
    const leftEdges = containerWidths.map(c => Math.round(c.left));
    const uniqueLeftEdges = [...new Set(leftEdges)];

    if (uniqueLeftEdges.length > 2) {
      collector.critique(
        'Alignment Inconsistency',
        `Content containers have ${uniqueLeftEdges.length} different left alignments (${uniqueLeftEdges.join('px, ')}px). This creates visual dissonance. All main content should align to the same grid.`
      );
    }

    // Check for orphaned spacing (inconsistent gaps)
    const gaps = await page.$$eval('.trust-grid, .portfolio-grid', (els) =>
      els.map((el) => window.getComputedStyle(el).gap)
    );

    const uniqueGaps = [...new Set(gaps)];
    if (uniqueGaps.length > 1) {
      collector.note(
        'Grid Gap Inconsistency',
        `Different grid gaps used: ${uniqueGaps.join(', ')}. Consider using consistent spacing.`
      );
    }

    collector.recordTask('Spacing & Alignment Audit', true,
      `Checked ${sectionPaddings.length} sections for spacing consistency`);
  });

  test('Typography & Readability Analysis', async ({ page }) => {
    const startTime = Date.now();

    // Analyze body text
    const bodyTextAnalysis = await page.$$eval('p', (els) => {
      return els.slice(0, 20).map((el) => {
        const styles = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          letterSpacing: styles.letterSpacing,
          width: rect.width,
          text: el.textContent?.substring(0, 30),
        };
      });
    });

    // Check line length (optimal: 45-75 characters, ~600-900px)
    const lineWidths = bodyTextAnalysis.map(t => t.width).filter(w => w > 100);
    const avgLineWidth = lineWidths.reduce((a, b) => a + b, 0) / lineWidths.length;

    if (avgLineWidth > 900) {
      collector.critique(
        'Line Length',
        `Average paragraph width is ${Math.round(avgLineWidth)}px (~${Math.round(avgLineWidth / 10)} characters). Optimal reading width is 600-800px (45-75 characters). Long lines cause eye fatigue.`
      );
    } else if (avgLineWidth < 400) {
      collector.note(
        'Line Length',
        `Average paragraph width is ${Math.round(avgLineWidth)}px. This is narrow but acceptable for mobile-first design.`
      );
    } else {
      collector.noteSuccess(
        'Line Length',
        `Paragraph width averaging ${Math.round(avgLineWidth)}px is within optimal reading range.`
      );
    }

    // Check line height ratio
    const lineHeightIssues = bodyTextAnalysis.filter((t) => {
      const fontSize = parseFloat(t.fontSize);
      const lineHeight = parseFloat(t.lineHeight);
      const ratio = lineHeight / fontSize;
      return ratio < 1.4 || ratio > 2.0;
    });

    if (lineHeightIssues.length > 0) {
      collector.critique(
        'Line Height',
        `${lineHeightIssues.length} paragraphs have suboptimal line-height ratios. Aim for 1.5-1.7x font size for body text.`
      );
    }

    // Check font size consistency
    const fontSizes = bodyTextAnalysis.map(t => t.fontSize);
    const uniqueFontSizes = [...new Set(fontSizes)];

    if (uniqueFontSizes.length > 3) {
      collector.critique(
        'Font Size Consistency',
        `Found ${uniqueFontSizes.length} different body text sizes: ${uniqueFontSizes.join(', ')}. Use a consistent type scale with 2-3 body text sizes max.`
      );
    }

    // Take screenshot of a text-heavy area
    await page.evaluate(() => {
      document.querySelector('#licensing')?.scrollIntoView();
    });
    await collector.captureScreenshot(page, 'typography-faq-section', 'FAQ section for typography analysis');

    collector.recordTask('Typography & Readability Analysis', true,
      `Analyzed ${bodyTextAnalysis.length} paragraphs`);
  });

  test('Information Architecture & Cognitive Load', async ({ page }) => {
    const startTime = Date.now();

    // Count major sections
    const sections = await page.$$eval('h2', (els) =>
      els.map((el) => el.textContent?.trim())
    );

    if (sections.length > 8) {
      collector.critique(
        'Information Overload',
        `Page has ${sections.length} major sections: ${sections.join(', ')}. This may overwhelm users. Consider grouping related sections or using progressive disclosure.`
      );
    } else if (sections.length > 5) {
      collector.note(
        'Section Count',
        `Page has ${sections.length} major sections. This is manageable but consider if all need to be on one page.`
      );
    }

    // Check scroll depth required
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const scrollsRequired = Math.ceil(pageHeight / viewportHeight);

    if (scrollsRequired > 6) {
      collector.critique(
        'Page Length',
        `Page requires ~${scrollsRequired} scrolls to view completely. This is very long. Consider: (1) splitting into multiple pages, (2) using anchor navigation, or (3) collapsible sections.`
      );
    }

    // Check navigation accessibility
    const navLinks = await page.$$eval('nav a, .site-nav a', (els) =>
      els.map((el) => ({
        text: el.textContent?.trim(),
        href: el.getAttribute('href'),
      }))
    );

    const anchorLinks = navLinks.filter(l => l.href?.startsWith('#'));

    if (anchorLinks.length < 3 && scrollsRequired > 4) {
      collector.suggestRedesign(
        'Navigation',
        `Long page (${scrollsRequired} scrolls) but only ${anchorLinks.length} anchor links in nav. Add sticky navigation with anchor links to all major sections.`
      );
    } else if (anchorLinks.length >= 3) {
      collector.noteSuccess(
        'Navigation',
        `Good: ${anchorLinks.length} anchor links help users navigate the long page.`
      );
    }

    // Check for clear visual grouping
    const backgroundChanges = await page.$$eval('*', (els) => {
      let changes = 0;
      let lastBg = '';
      els.forEach((el) => {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg !== lastBg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          changes++;
          lastBg = bg;
        }
      });
      return changes;
    });

    collector.note(
      'Visual Grouping',
      `${backgroundChanges} background color changes detected. Background changes help group related content visually.`
    );

    await collector.captureScreenshot(page, 'information-architecture-full', 'Full page for information architecture review');

    collector.recordTask('Information Architecture & Cognitive Load', true,
      `Analyzed ${sections.length} sections, ${scrollsRequired} scrolls required`);
  });

  test('Visual Consistency & Design System Adherence', async ({ page }) => {
    const startTime = Date.now();

    // Collect all colors used
    const colors = await page.$$eval('*', (els) => {
      const colorSet = new Set<string>();
      els.forEach((el) => {
        const styles = window.getComputedStyle(el);
        colorSet.add(styles.color);
        colorSet.add(styles.backgroundColor);
        colorSet.add(styles.borderColor);
      });
      return Array.from(colorSet).filter(c =>
        c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' && c !== ''
      );
    });

    if (colors.length > 15) {
      collector.critique(
        'Color Palette',
        `Found ${colors.length} distinct colors. A cohesive design uses 5-8 colors max. Consider consolidating similar shades.`
      );
    }

    // Check border radius consistency
    const borderRadii = await page.$$eval('*', (els) => {
      const radii = new Set<string>();
      els.forEach((el) => {
        const br = window.getComputedStyle(el).borderRadius;
        if (br && br !== '0px') radii.add(br);
      });
      return Array.from(radii);
    });

    if (borderRadii.length > 4) {
      collector.note(
        'Border Radius Consistency',
        `Found ${borderRadii.length} different border radius values: ${borderRadii.join(', ')}. Consider using 2-3 consistent values.`
      );
    }

    // Check button/CTA consistency
    const ctaButtons = await page.$$eval('.cta-button, a[class*="cta"], button', (els) =>
      els.map((el) => {
        const styles = window.getComputedStyle(el);
        return {
          padding: styles.padding,
          fontSize: styles.fontSize,
          borderRadius: styles.borderRadius,
          background: styles.backgroundColor,
        };
      })
    );

    const uniqueCtaStyles = new Set(ctaButtons.map(b => `${b.padding}-${b.fontSize}-${b.borderRadius}`));

    if (uniqueCtaStyles.size > 2) {
      collector.critique(
        'Button Consistency',
        `Found ${uniqueCtaStyles.size} different button styles. CTAs should be visually consistent. Use 1-2 button variants max (primary/secondary).`
      );
    }

    // Check shadow consistency
    const shadows = await page.$$eval('*', (els) => {
      const shadowSet = new Set<string>();
      els.forEach((el) => {
        const shadow = window.getComputedStyle(el).boxShadow;
        if (shadow && shadow !== 'none') shadowSet.add(shadow);
      });
      return Array.from(shadowSet);
    });

    if (shadows.length > 3) {
      collector.note(
        'Shadow Consistency',
        `Found ${shadows.length} different box-shadow values. Design systems typically use 2-3 elevation levels.`
      );
    }

    collector.recordTask('Visual Consistency & Design System Adherence', true,
      `Found ${colors.length} colors, ${borderRadii.length} border radii, ${ctaButtons.length} CTAs`);
  });

  test('First-Time User Quick Access Evaluation', async ({ page }) => {
    const startTime = Date.now();

    await collector.captureScreenshot(page, 'above-the-fold', 'First-time user view above fold');

    // What can users see without scrolling?
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    const aboveFoldContent = await page.$$eval('*', (els) => {
      const vh = window.innerHeight;
      const visible: string[] = [];

      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0 && rect.height > 20) {
          if (el.tagName === 'H1' || el.tagName === 'H2') {
            visible.push(`${el.tagName}: ${el.textContent?.trim().substring(0, 40)}`);
          }
          if (el.tagName === 'A' && el.classList.contains('cta-button')) {
            visible.push(`CTA: ${el.textContent?.trim()}`);
          }
        }
      });
      return [...new Set(visible)];
    });

    collector.note(
      'Above the Fold Content',
      `First-time users see: ${aboveFoldContent.join(', ')}`
    );

    // Check if primary CTA is above fold
    const primaryCtaAboveFold = await page.$eval('.cta-button', (el) => {
      const rect = el.getBoundingClientRect();
      return rect.bottom < window.innerHeight;
    }).catch(() => false);

    if (primaryCtaAboveFold) {
      collector.noteSuccess(
        'CTA Visibility',
        'Primary call-to-action is visible above the fold - good for conversions.'
      );
    } else {
      collector.critique(
        'CTA Visibility',
        'Primary CTA is below the fold. First-time users should see a clear next step immediately.'
      );
    }

    // Check for clear value proposition
    const heroText = await page.$eval('.hero-subheadline, .hero-section p', (el) =>
      el.textContent?.trim()
    ).catch(() => '');

    if (heroText && heroText.length > 200) {
      collector.critique(
        'Value Proposition Length',
        `Hero subheadline is ${heroText.length} characters. Should be under 150 characters for quick scanning. Current: "${heroText.substring(0, 100)}..."`
      );
    }

    // Check for decision paralysis
    const ctaCount = await page.$$eval('.hero-section a, .hero-section button', (els) => els.length);

    if (ctaCount > 3) {
      collector.critique(
        'Decision Paralysis',
        `Hero section has ${ctaCount} clickable actions. Too many choices slow users down. Reduce to 1-2 primary actions.`
      );
    } else if (ctaCount === 2) {
      collector.noteSuccess(
        'CTA Strategy',
        'Two CTAs (primary + secondary) is optimal - gives users a clear choice without overwhelming.'
      );
    }

    // Check time to first meaningful content
    const firstContentSection = await page.$('h2');
    if (firstContentSection) {
      const firstContentPosition = await firstContentSection.evaluate((el) =>
        el.getBoundingClientRect().top
      );

      if (firstContentPosition > viewportHeight * 0.8) {
        collector.note(
          'Content Positioning',
          `First content section starts ${Math.round(firstContentPosition)}px down. Users must scroll to see substantive content.`
        );
      }
    }

    collector.recordTask('First-Time User Quick Access Evaluation', true,
      `Analyzed above-fold content and CTA visibility`);
  });

  test('Whitespace & Visual Breathing Room', async ({ page }) => {
    const startTime = Date.now();

    // Analyze whitespace ratios in key sections
    const sectionAnalysis = await page.$$eval('.trust-section, .comparison-section, .about-section, .faq-section', (els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        const styles = window.getComputedStyle(el);
        const paddingTop = parseFloat(styles.paddingTop);
        const paddingBottom = parseFloat(styles.paddingBottom);
        const totalPadding = paddingTop + paddingBottom;
        const contentHeight = rect.height - totalPadding;
        const whitespaceRatio = totalPadding / rect.height;

        return {
          className: el.className,
          totalHeight: rect.height,
          paddingTop,
          paddingBottom,
          whitespaceRatio: Math.round(whitespaceRatio * 100),
        };
      })
    );

    // Check for cramped sections
    const crampedSections = sectionAnalysis.filter(s => s.whitespaceRatio < 15);
    if (crampedSections.length > 0) {
      collector.critique(
        'Cramped Sections',
        `${crampedSections.length} sections have less than 15% whitespace. Sections feel cramped: ${crampedSections.map(s => s.className).join(', ')}. Add more padding.`
      );
    }

    // Check for consistent section spacing
    const topPaddings = sectionAnalysis.map(s => s.paddingTop);
    const uniqueTopPaddings = [...new Set(topPaddings)];

    if (uniqueTopPaddings.length > 2) {
      collector.note(
        'Section Padding Variance',
        `Sections have ${uniqueTopPaddings.length} different top padding values: ${uniqueTopPaddings.map(p => p + 'px').join(', ')}. Consider using consistent spacing.`
      );
    }

    // Check table density
    const tableAnalysis = await page.$$eval('table', (els) =>
      els.map((el) => {
        const cells = el.querySelectorAll('td, th');
        let cramped = 0;
        cells.forEach((cell) => {
          const padding = parseFloat(window.getComputedStyle(cell).padding);
          if (padding < 12) cramped++;
        });
        return {
          totalCells: cells.length,
          crampedCells: cramped,
        };
      })
    );

    const totalCrampedCells = tableAnalysis.reduce((a, t) => a + t.crampedCells, 0);
    if (totalCrampedCells > 0) {
      collector.note(
        'Table Cell Padding',
        `${totalCrampedCells} table cells have tight padding (<12px). Consider increasing for better readability.`
      );
    }

    // Screenshot a section to visualize whitespace
    await page.evaluate(() => {
      document.querySelector('.trust-section')?.scrollIntoView({ block: 'center' });
    });
    await collector.captureScreenshot(page, 'whitespace-trust-section', 'Trust section whitespace analysis');

    collector.recordTask('Whitespace & Visual Breathing Room', true,
      `Analyzed ${sectionAnalysis.length} sections for whitespace balance`);
  });

  test('Interactive Elements & Micro-interactions', async ({ page }) => {
    const startTime = Date.now();

    // Check hover states
    const interactiveElements = await page.$$('a, button, .cta-button, .portfolio-item');

    // Sample a few elements for hover state testing
    const hoverAnalysis: string[] = [];

    for (const el of interactiveElements.slice(0, 5)) {
      // Scroll element into view first
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(50);

      const beforeHover = await el.evaluate((e) => ({
        transform: window.getComputedStyle(e).transform,
        boxShadow: window.getComputedStyle(e).boxShadow,
        background: window.getComputedStyle(e).backgroundColor,
      }));

      await el.hover({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(100);

      const afterHover = await el.evaluate((e) => ({
        transform: window.getComputedStyle(e).transform,
        boxShadow: window.getComputedStyle(e).boxShadow,
        background: window.getComputedStyle(e).backgroundColor,
      }));

      const hasHoverEffect =
        beforeHover.transform !== afterHover.transform ||
        beforeHover.boxShadow !== afterHover.boxShadow ||
        beforeHover.background !== afterHover.background;

      if (hasHoverEffect) {
        hoverAnalysis.push('has-effect');
      } else {
        hoverAnalysis.push('no-effect');
      }
    }

    const withEffects = hoverAnalysis.filter(h => h === 'has-effect').length;
    const withoutEffects = hoverAnalysis.filter(h => h === 'no-effect').length;

    if (withoutEffects > withEffects) {
      collector.critique(
        'Hover States',
        `${withoutEffects}/${hoverAnalysis.length} interactive elements lack hover effects. Users need visual feedback that elements are clickable.`
      );
    } else if (withEffects > 0) {
      collector.noteSuccess(
        'Hover States',
        `${withEffects}/${hoverAnalysis.length} tested elements have hover effects - good interactive feedback.`
      );
    }

    // Check transition smoothness
    const transitions = await page.$$eval('a, button, .cta-button, .portfolio-item', (els) =>
      els.map((el) => window.getComputedStyle(el).transition).filter(t => t && t !== 'none' && t !== 'all 0s ease 0s')
    );

    if (transitions.length < 3) {
      collector.note(
        'Transitions',
        `Only ${transitions.length} elements have CSS transitions. Consider adding subtle transitions to improve perceived polish.`
      );
    }

    // Screenshot hover state
    const portfolioItem = await page.$('.portfolio-item');
    if (portfolioItem) {
      await portfolioItem.hover();
      await page.waitForTimeout(200);
      await collector.captureScreenshot(page, 'hover-state-portfolio', 'Portfolio item hover state');
    }

    collector.recordTask('Interactive Elements & Micro-interactions', true,
      `Tested ${hoverAnalysis.length} elements for hover states`);
  });

  test('Mobile Responsiveness Pixel Check', async ({ page }) => {
    const startTime = Date.now();

    // Test at common mobile breakpoint
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('/index.html');
    await collector.captureScreenshot(page, 'mobile-375-full', 'Mobile viewport (375px) full page');

    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );

    if (hasHorizontalScroll) {
      collector.critique(
        'Mobile Overflow',
        'Page has horizontal scroll on mobile (375px). Elements are breaking out of the viewport.'
      );
    } else {
      collector.noteSuccess(
        'Mobile Overflow',
        'No horizontal scroll on mobile - content fits viewport properly.'
      );
    }

    // Check touch target sizes
    const touchTargets = await page.$$eval('a, button', (els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          text: el.textContent?.trim().substring(0, 20),
        };
      }).filter(t => t.width > 0 && t.height > 0)
    );

    const smallTargets = touchTargets.filter(t => t.width < 44 || t.height < 44);

    if (smallTargets.length > 0) {
      collector.critique(
        'Touch Targets',
        `${smallTargets.length} touch targets are smaller than 44x44px minimum: ${smallTargets.slice(0, 3).map(t => `"${t.text}" (${Math.round(t.width)}x${Math.round(t.height)})`).join(', ')}`
      );
    }

    // Check text readability on mobile
    const mobileText = await page.$$eval('p', (els) =>
      els.slice(0, 5).map((el) => ({
        fontSize: window.getComputedStyle(el).fontSize,
        lineHeight: window.getComputedStyle(el).lineHeight,
      }))
    );

    const smallText = mobileText.filter(t => parseFloat(t.fontSize) < 16);
    if (smallText.length > 0) {
      collector.critique(
        'Mobile Text Size',
        `${smallText.length} paragraphs have font-size below 16px on mobile. This is hard to read without zooming.`
      );
    }

    // Test tablet breakpoint
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/index.html');
    await collector.captureScreenshot(page, 'tablet-768-full', 'Tablet viewport (768px) full page');

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 800 });

    collector.recordTask('Mobile Responsiveness Pixel Check', true,
      `Tested mobile (375px) and tablet (768px) breakpoints`);
  });

  test('Critical Design Assessment & Recommendations', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/index.html');

    // Final full-page assessment
    await collector.captureScreenshot(page, 'final-assessment-full', 'Final full page assessment');

    // Scroll through the page capturing key sections
    const scrollPositions = [0, 500, 1000, 1500, 2000, 2500, 3000];
    for (const pos of scrollPositions) {
      await page.evaluate((y) => window.scrollTo(0, y), pos);
      await page.waitForTimeout(100);
    }

    // Overall structure assessment
    const pageStructure = await page.evaluate(() => {
      const sections = document.querySelectorAll('h2');
      const totalHeight = document.body.scrollHeight;
      const structure: { section: string; position: number }[] = [];

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        structure.push({
          section: section.textContent?.trim() || '',
          position: Math.round((absoluteTop / totalHeight) * 100),
        });
      });

      return structure;
    });

    collector.note(
      'Page Structure Map',
      `Content distribution: ${pageStructure.map(s => `${s.section} (${s.position}%)`).join(' → ')}`
    );

    // Check for visual dead zones (large areas without content)
    const contentDistribution = pageStructure.map(s => s.position);
    for (let i = 1; i < contentDistribution.length; i++) {
      const gap = contentDistribution[i] - contentDistribution[i - 1];
      if (gap > 20) {
        collector.note(
          'Content Gap',
          `Large gap (${gap}%) between "${pageStructure[i - 1].section}" and "${pageStructure[i].section}". Consider tightening spacing or adding content.`
        );
      }
    }

    // Summary observations
    collector.suggestRedesign(
      'Overall Assessment',
      `As a UX expert, key recommendations: (1) Establish a stricter spacing system with 4-6 values, (2) Reduce the number of sections or use progressive disclosure, (3) Ensure all interactive elements have consistent hover states, (4) Consider a sticky navigation for this long page, (5) Test with real users to validate the information hierarchy.`
    );

    collector.recordTask('Critical Design Assessment & Recommendations', true,
      'Completed comprehensive design review');
  });
});
