import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: Robert - CISO
 *
 * Background: Chief Information Security Officer at mid-size company evaluating policy solutions
 * Goals: Assess credibility, understand coverage depth, determine enterprise readiness
 * Behaviors: Looks for maturity indicators, wants methodology explanations, evaluates risk/trust
 *
 * Critical Evaluation: Would I trust this for my company?
 * What would it take to reach enterprise-grade credibility?
 * Is this site even targeting the right audience?
 */
const persona: Persona = {
  name: 'Robert',
  role: 'CISO',
  background:
    'Chief Information Security Officer at a 500-person financial services company. ' +
    'Responsible for security strategy, compliance programs, and vendor risk management. ' +
    'Has been burned by "free" solutions that weren\'t enterprise-ready.',
  goals: [
    'Assess site credibility and professionalism within 30 seconds',
    'Understand methodology and approach to policy creation',
    'Evaluate coverage breadth (which frameworks/standards)',
    'Find evidence of expertise/track record',
    'Determine if this could work for enterprise needs',
    'Locate engagement/pricing information',
  ],
  behaviors: [
    'Skeptical of free offerings - looks for the business model',
    'Wants to see methodology and rigor behind policies',
    'Evaluates vendor risk before recommending to team',
    'Looks for enterprise features: support, SLAs, customization',
    'Will check team backgrounds, company info, funding',
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

  test('Task 1: 30-second credibility assessment', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'ciso-first-impression',
      'CISO first impression - assessing credibility in 30 seconds'
    );

    // Executive credibility indicators
    const credibilityChecks = {
      hasCompanyInfo: false,
      hasProfessionalDesign: false,
      hasSecurityCredentials: false,
      hasEnterpriseLanguage: false,
      hasClientReferences: false,
    };

    const pageContent = await page.textContent('body');

    // Check for company/organization info
    credibilityChecks.hasCompanyInfo = !!(
      pageContent?.toLowerCase().includes('about') ||
      pageContent?.toLowerCase().includes('company') ||
      pageContent?.toLowerCase().includes('team') ||
      pageContent?.toLowerCase().includes('founded')
    );

    // Check for security/compliance credentials
    credibilityChecks.hasSecurityCredentials = !!(
      pageContent?.toLowerCase().includes('certified') ||
      pageContent?.toLowerCase().includes('auditor') ||
      pageContent?.toLowerCase().includes('cissp') ||
      pageContent?.toLowerCase().includes('cisa') ||
      pageContent?.toLowerCase().includes('experience')
    );

    // Check for enterprise language
    credibilityChecks.hasEnterpriseLanguage = !!(
      pageContent?.toLowerCase().includes('enterprise') ||
      pageContent?.toLowerCase().includes('organization') ||
      pageContent?.toLowerCase().includes('scale') ||
      pageContent?.toLowerCase().includes('support')
    );

    // Check for client references
    credibilityChecks.hasClientReferences = !!(
      pageContent?.toLowerCase().includes('client') ||
      pageContent?.toLowerCase().includes('customer') ||
      pageContent?.toLowerCase().includes('testimonial') ||
      pageContent?.toLowerCase().includes('case study')
    );

    const credibilityScore = Object.values(credibilityChecks).filter(Boolean).length;
    notes.push(`Credibility indicators found: ${credibilityScore}/5`);

    if (credibilityScore >= 3) {
      success = true;
      collector.noteSuccess('Multiple credibility indicators present', 'Trust');
    } else {
      collector.noteFrustration(
        `Only ${credibilityScore}/5 credibility indicators. ` +
        'As a CISO, I cannot recommend this to my team without more information.',
        'Trust & Credibility'
      );
    }

    // Specific missing elements for executive
    if (!credibilityChecks.hasCompanyInfo) {
      collector.noteMissing(
        'No company/organization information. Who owns this? Is it a person, company, or open source project?',
        'About Section'
      );
    }

    if (!credibilityChecks.hasSecurityCredentials) {
      collector.noteMissing(
        'No visible security credentials. What qualifies the authors to write compliance policies?',
        'Credentials'
      );
    }

    collector.critique(
      'First impression for enterprise: This looks like a side project, not an enterprise solution. ' +
      'CISOs need to justify vendor choices to boards. Where\'s the evidence of maturity?',
      'Enterprise Readiness'
    );

    collector.recordTask(
      '30-second credibility assessment',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Understand methodology and approach', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'ciso-looking-for-methodology',
      'Searching for methodology - how were these policies created?'
    );

    const pageContent = await page.textContent('body');

    // Look for methodology indicators
    const hasMethodology = pageContent?.toLowerCase().includes('methodology') ||
                          pageContent?.toLowerCase().includes('approach') ||
                          pageContent?.toLowerCase().includes('process') ||
                          pageContent?.toLowerCase().includes('framework') ||
                          pageContent?.toLowerCase().includes('created') ||
                          pageContent?.toLowerCase().includes('developed');

    if (hasMethodology) {
      success = true;
      notes.push('Some methodology language found');
      collector.noteSuccess('Methodology is mentioned', 'Content');
    } else {
      collector.noteFrustration(
        'No methodology explanation. How were these policies created? ' +
        'Were they based on real audits? Template standards? Experience?',
        'Methodology'
      );
      notes.push('No methodology found');
    }

    // Critical methodology questions
    collector.noteMissing(
      'Methodology page answering: ' +
      '(1) How are policies created? ' +
      '(2) What frameworks do they map to? ' +
      '(3) How often are they updated? ' +
      '(4) Have they been audit-tested?',
      'Documentation'
    );

    collector.critique(
      'Enterprise compliance requires defensible policies. ' +
      'Without methodology documentation, I can\'t explain to auditors where these came from.',
      'Audit Defensibility'
    );

    collector.suggestRedesign(
      'Add a "Our Methodology" page featuring: ' +
      'Author backgrounds, control mapping approach, audit experience, update cadence.',
      'Site Content'
    );

    collector.recordTask(
      'Understand methodology and approach',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Evaluate coverage breadth', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'ciso-evaluating-coverage',
      'Evaluating framework coverage - what standards are addressed?'
    );

    const pageContent = await page.textContent('body');

    // Check for framework coverage
    const frameworks = [
      { name: 'SOC2', found: false },
      { name: 'HIPAA', found: false },
      { name: 'HITRUST', found: false },
      { name: 'ISO 27001', found: false },
      { name: 'GDPR', found: false },
      { name: 'PCI', found: false },
      { name: 'NIST', found: false },
      { name: 'FedRAMP', found: false },
    ];

    frameworks.forEach(fw => {
      fw.found = pageContent?.toLowerCase().includes(fw.name.toLowerCase()) || false;
    });

    const coveredFrameworks = frameworks.filter(fw => fw.found).map(fw => fw.name);
    const missingFrameworks = frameworks.filter(fw => !fw.found).map(fw => fw.name);

    notes.push(`Frameworks covered: ${coveredFrameworks.join(', ') || 'none identified'}`);

    if (coveredFrameworks.length >= 2) {
      success = true;
      collector.noteSuccess(`Multiple frameworks covered: ${coveredFrameworks.join(', ')}`, 'Coverage');
    } else {
      collector.noteConfusion(
        'Coverage breadth unclear. Which frameworks are actually supported?',
        'Content'
      );
    }

    // Enterprise coverage expectations
    if (!coveredFrameworks.includes('ISO 27001')) {
      collector.noteMissing(
        'ISO 27001 coverage not visible. This is table stakes for enterprise compliance.',
        'Framework Coverage'
      );
    }

    if (!coveredFrameworks.includes('NIST')) {
      collector.noteMissing(
        'NIST framework coverage not visible. Critical for many enterprise and government contexts.',
        'Framework Coverage'
      );
    }

    collector.suggestRedesign(
      'Create a framework matrix: Clear grid showing which policies cover which frameworks. ' +
      'Make it easy to see "I need SOC2 + HIPAA - what package covers both?"',
      'Navigation'
    );

    collector.recordTask(
      'Evaluate coverage breadth',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Find evidence of expertise/track record', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'ciso-looking-for-track-record',
      'Searching for track record - who has used these policies successfully?'
    );

    const pageContent = await page.textContent('body');

    // Evidence types CISOs look for
    const evidenceChecks = {
      customerLogos: await page.locator('img[alt*="logo"], .logos, .clients').count() > 0,
      caseStudies: pageContent?.toLowerCase().includes('case study') || false,
      testimonials: pageContent?.toLowerCase().includes('testimonial') ||
                   pageContent?.includes('"') ||
                   false,
      statistics: /\d+\+?\s*(companies|customers|downloads)/i.test(pageContent || ''),
      auditSuccess: pageContent?.toLowerCase().includes('passed audit') ||
                   pageContent?.toLowerCase().includes('audit-ready') ||
                   false,
    };

    const evidenceCount = Object.values(evidenceChecks).filter(Boolean).length;
    notes.push(`Track record evidence: ${evidenceCount}/5 types`);

    if (evidenceCount >= 2) {
      success = true;
      collector.noteSuccess('Some track record evidence found', 'Social Proof');
    } else {
      collector.noteFrustration(
        'No evidence of successful usage. Who has used these policies? Did they pass audits?',
        'Track Record'
      );
    }

    collector.noteMissing(
      'Case studies: "Company X used these policies and passed their SOC2 audit in Y weeks"',
      'Social Proof'
    );

    collector.noteMissing(
      'Statistics: "Used by X companies" or "Supported Y successful audits"',
      'Credibility'
    );

    collector.critique(
      'As a CISO, I\'m asking: "Has anyone bet their audit on these policies and won?" ' +
      'Without that proof, this is a risk I can\'t recommend.',
      'Risk Assessment'
    );

    collector.recordTask(
      'Find evidence of expertise/track record',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Determine enterprise readiness', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'ciso-enterprise-evaluation',
      'Evaluating enterprise readiness'
    );

    const pageContent = await page.textContent('body');

    // Enterprise readiness indicators
    const enterpriseChecks = {
      hasSupport: pageContent?.toLowerCase().includes('support') || false,
      hasSLA: pageContent?.toLowerCase().includes('sla') ||
              pageContent?.toLowerCase().includes('service level') ||
              false,
      hasCustomization: pageContent?.toLowerCase().includes('custom') ||
                       pageContent?.toLowerCase().includes('tailored') ||
                       false,
      hasUpdates: pageContent?.toLowerCase().includes('update') ||
                 pageContent?.toLowerCase().includes('maintain') ||
                 false,
      hasSecurity: pageContent?.toLowerCase().includes('secure') ||
                  pageContent?.toLowerCase().includes('security') ||
                  false,
    };

    const enterpriseScore = Object.values(enterpriseChecks).filter(Boolean).length;
    notes.push(`Enterprise readiness indicators: ${enterpriseScore}/5`);

    if (enterpriseScore >= 3) {
      success = true;
      collector.noteSuccess('Some enterprise features mentioned', 'Enterprise');
    } else {
      collector.noteFrustration(
        'Not enterprise-ready. Missing: support options, SLAs, customization, update commitments.',
        'Enterprise Readiness'
      );
    }

    // Critical enterprise questions
    collector.noteMissing(
      'Support model: Who do I contact if I have questions about implementing these policies?',
      'Support'
    );

    collector.noteMissing(
      'Update commitment: How often are policies updated when frameworks change?',
      'Maintenance'
    );

    collector.noteMissing(
      'Customization services: Can I get these tailored to my specific industry/size?',
      'Services'
    );

    collector.critique(
      'Enterprise purchasing decision: Free is great, but enterprises pay for: ' +
      'support, liability, updates, and customization. Where\'s the enterprise tier?',
      'Business Model'
    );

    collector.recordTask(
      'Determine enterprise readiness',
      success,
      notes.join('; ')
    );
  });

  test('Task 6: Locate engagement/pricing information', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'ciso-looking-for-pricing',
      'Looking for pricing or engagement options'
    );

    const pageContent = await page.textContent('body');

    // Look for pricing/engagement info
    const hasPricing = pageContent?.toLowerCase().includes('price') ||
                      pageContent?.toLowerCase().includes('pricing') ||
                      pageContent?.toLowerCase().includes('cost') ||
                      pageContent?.toLowerCase().includes('plan') ||
                      pageContent?.toLowerCase().includes('tier');

    const hasEngagement = pageContent?.toLowerCase().includes('contact') ||
                         pageContent?.toLowerCase().includes('consult') ||
                         pageContent?.toLowerCase().includes('engage') ||
                         pageContent?.toLowerCase().includes('hire');

    if (hasPricing || hasEngagement) {
      success = true;
      notes.push('Engagement/pricing information found');
      collector.noteSuccess('Found engagement options', 'Business');
    } else {
      collector.noteConfusion(
        'Business model unclear. Is this purely open source? ' +
        'Is there a paid tier? How does this sustain itself?',
        'Business Model'
      );
      notes.push('No clear business model visible');
    }

    collector.critique(
      'Free makes me suspicious. As a CISO, I ask: ' +
      '"What\'s the business model? Will this be maintained? Who\'s accountable?" ' +
      'Clear monetization (even if optional) signals sustainability.',
      'Sustainability'
    );

    collector.suggestRedesign(
      'Be explicit about the business model: ' +
      '"Free and open source, with optional professional services" or ' +
      '"Free for startups, enterprise tier available" - transparency builds trust.',
      'Positioning'
    );

    collector.noteMissing(
      'Enterprise contact: "For enterprise licensing or custom work, contact X"',
      'Enterprise Sales'
    );

    collector.recordTask(
      'Locate engagement/pricing information',
      success,
      notes.join('; ')
    );
  });

  test('Critical Evaluation: Would I trust this for my company?', async () => {
    collector.startTask();
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'ciso-final-evaluation',
      'Final CISO evaluation: Would I trust this for my company?'
    );

    // Comprehensive executive evaluation
    collector.critique(
      'CISO VERDICT: Currently, NO. I cannot recommend this to my team or board because: ' +
      '(1) Unknown provenance - who created these?, ' +
      '(2) No track record - who has successfully used them?, ' +
      '(3) No support path - what if we have questions?, ' +
      '(4) Unknown maintenance - will these stay current?',
      'Executive Decision'
    );

    collector.suggestRedesign(
      'To reach enterprise-grade credibility, add: ' +
      '(1) "About Us" with team credentials, ' +
      '(2) "Methodology" explaining how policies are created and maintained, ' +
      '(3) "Success Stories" with named customers or anonymized case studies, ' +
      '(4) "Enterprise" tier with support, SLAs, and customization options.',
      'Enterprise Positioning'
    );

    collector.suggestRedesign(
      'Consider the target market question: Is this for startups bootstrapping compliance, ' +
      'or enterprises seeking alternatives to Big 4? The messaging should be crystal clear. ' +
      'Currently, it\'s unclear who this is actually for.',
      'Market Positioning'
    );

    collector.noteMissing(
      'Security posture of the policies themselves. ' +
      'Have these policies been reviewed by third-party security professionals?',
      'Quality Assurance'
    );

    collector.noteMissing(
      'Liability disclaimer or limitations. ' +
      'What happens if an auditor rejects these policies?',
      'Legal'
    );

    notes.push('CISO evaluation complete - significant trust gaps identified');

    collector.recordTask(
      'Critical Evaluation: Would I trust this for my company?',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: Executive browsing patterns', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Executive exploration patterns
    const explorationActions = [
      { action: 'checkURL', description: 'Evaluate URL credibility' },
      { action: 'searchGoogle', description: 'Note: Would search company name' },
      { action: 'checkFooter', description: 'Look for legal/company info in footer' },
      { action: 'assessProfessionalism', description: 'Overall professionalism check' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'checkURL':
            const url = page.url();
            notes.push(`URL: ${url}`);
            if (url.includes('.github.io')) {
              collector.note(
                'GitHub Pages hosting signals: small project, not enterprise infrastructure. ' +
                'Not necessarily bad, but sets expectations.',
                'Infrastructure'
              );
            }
            break;

          case 'searchGoogle':
            // Can't actually search, but note the behavior
            collector.note(
              'Executive behavior: Would Google the company/project name to check reputation, ' +
              'news, reviews, and any red flags.',
              'Due Diligence'
            );
            break;

          case 'checkFooter':
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await page.waitForTimeout(500);
            await collector.captureScreenshot(page, 'explore-ciso-footer', description);

            const footerContent = await page.locator('footer').textContent().catch(() => '');
            if (footerContent) {
              notes.push(`Footer content: ${footerContent.slice(0, 100)}...`);
              if (!footerContent.includes('©') && !footerContent.includes('copyright')) {
                collector.note('No copyright notice in footer', 'Legal');
              }
            }
            break;

          case 'assessProfessionalism':
            collector.note(
              'Overall professionalism assessment for vision model: ' +
              'Does this look like a credible compliance resource or a hobbyist project? ' +
              'Would I be comfortable presenting this to my board?',
              'Executive Impression'
            );
            break;
        }
      } catch (error) {
        notes.push(`${action} failed: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-ciso-complete',
      'Completed executive browsing exploration'
    );

    collector.recordTask(
      'Free Exploration: Executive browsing patterns',
      true,
      notes.join('; ')
    );
  });
});
