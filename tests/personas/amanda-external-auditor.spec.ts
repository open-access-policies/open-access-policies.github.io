import { test, expect, Page } from '@playwright/test';
import {
  ObservationCollector,
  attachConsoleErrorListener,
  navigateWithTracking,
  Persona,
} from '../utils/observation-collector';

/**
 * Persona: Amanda - External Auditor
 *
 * Background: Third-party auditor reviewing companies' compliance programs
 * Goals: Verify policy completeness, check for gaps vs frameworks, assess quality
 * Behaviors: Methodical, detail-oriented, compares against known control requirements
 *
 * Critical Evaluation: Does this site provide enough detail to evaluate quality?
 * What documentation is missing? Should there be downloadable samples, control mappings,
 * or audit reports?
 */
const persona: Persona = {
  name: 'Amanda',
  role: 'External Auditor',
  background:
    'Senior auditor at a mid-tier accounting firm specializing in SOC2, HIPAA, and ISO 27001 audits. ' +
    'Reviews 20+ companies per year. Has seen every quality level from excellent to disastrous.',
  goals: [
    'Identify what compliance frameworks are covered',
    'Assess completeness of policy offerings',
    'Compare Health Tech vs HITRUST offerings',
    'Find specific control mapping information',
    'Evaluate quality indicators (versioning, updates)',
    'Check licensing for client usability',
  ],
  behaviors: [
    'Methodical and thorough',
    'Compares against known control requirements',
    'Looks for evidence of rigor and professionalism',
    'Wants to see policy document structure and format',
    'Evaluates whether policies would pass audit scrutiny',
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

  test('Task 1: Identify compliance frameworks covered', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'auditor-framework-scan',
      'Auditor scanning for compliance framework coverage'
    );

    const pageContent = await page.textContent('body');

    // Frameworks an auditor would look for
    const frameworks = {
      'SOC 2 Type I': false,
      'SOC 2 Type II': false,
      'SOC 1': false,
      'HIPAA': false,
      'HITRUST CSF': false,
      'ISO 27001': false,
      'ISO 27017': false,
      'ISO 27018': false,
      'PCI DSS': false,
      'GDPR': false,
      'CCPA': false,
      'NIST CSF': false,
      'NIST 800-53': false,
      'FedRAMP': false,
      'StateRAMP': false,
      'CMMC': false,
    };

    for (const framework of Object.keys(frameworks)) {
      if (pageContent?.toLowerCase().includes(framework.toLowerCase())) {
        frameworks[framework as keyof typeof frameworks] = true;
      }
    }

    const covered = Object.entries(frameworks).filter(([_, found]) => found).map(([name]) => name);
    const notCovered = Object.entries(frameworks).filter(([_, found]) => !found).map(([name]) => name);

    notes.push(`Frameworks identified: ${covered.join(', ') || 'none'}`);

    if (covered.length > 0) {
      success = true;
      collector.noteSuccess(`Found ${covered.length} frameworks mentioned`, 'Coverage');
    } else {
      collector.noteConfusion(
        'Cannot quickly identify which frameworks are covered',
        'Homepage'
      );
    }

    // Auditor expects detailed framework info
    collector.noteMissing(
      'Framework version numbers. SOC 2? Which TSC version? HITRUST? Which CSF version? ' +
      'Frameworks evolve and version matters for audits.',
      'Framework Details'
    );

    collector.critique(
      'Auditor perspective: Vague framework references aren\'t useful. ' +
      'I need to know exactly which controls are addressed for each framework.',
      'Precision'
    );

    collector.recordTask(
      'Identify compliance frameworks covered',
      success,
      notes.join('; ')
    );
  });

  test('Task 2: Assess completeness of policy offerings', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'auditor-completeness-check',
      'Assessing completeness of policy offerings'
    );

    const pageContent = await page.textContent('body');

    // Policies an auditor expects for SOC2
    const expectedPolicies = [
      'Information Security',
      'Access Control',
      'Change Management',
      'Risk Assessment',
      'Incident Response',
      'Business Continuity',
      'Disaster Recovery',
      'Vendor Management',
      'Data Classification',
      'Acceptable Use',
      'Password',
      'Encryption',
      'Physical Security',
      'HR Security',
      'Asset Management',
    ];

    const foundPolicies: string[] = [];
    for (const policy of expectedPolicies) {
      if (pageContent?.toLowerCase().includes(policy.toLowerCase())) {
        foundPolicies.push(policy);
      }
    }

    notes.push(`Policies mentioned: ${foundPolicies.length}/${expectedPolicies.length}`);

    if (foundPolicies.length >= 5) {
      success = true;
      collector.noteSuccess(`Found ${foundPolicies.length} policy types mentioned`, 'Completeness');
    }

    // Critical completeness assessment
    collector.noteMissing(
      'Policy inventory list. As an auditor, I need to see: ' +
      '"This package includes X policies covering Y controls." ' +
      'A simple list with policy names is essential.',
      'Documentation'
    );

    collector.noteMissing(
      'Control mapping document. Which policies address which specific controls? ' +
      'Without this, I cannot assess audit readiness.',
      'Control Mapping'
    );

    collector.critique(
      'Completeness is impossible to verify without a policy list. ' +
      'How do I know if this covers all SOC2 common criteria?',
      'Audit Readiness'
    );

    collector.recordTask(
      'Assess completeness of policy offerings',
      success,
      notes.join('; ')
    );
  });

  test('Task 3: Compare Health Tech vs HITRUST offerings', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'auditor-comparing-offerings',
      'Comparing Health Tech and HITRUST offerings'
    );

    const pageContent = await page.textContent('body');

    // Look for both offerings
    const hasHealthTech = pageContent?.toLowerCase().includes('health tech') ||
                         pageContent?.toLowerCase().includes('healthcare');
    const hasHitrust = pageContent?.toLowerCase().includes('hitrust');
    const hasHipaa = pageContent?.toLowerCase().includes('hipaa');

    notes.push(`Health Tech: ${hasHealthTech}, HITRUST: ${hasHitrust}, HIPAA: ${hasHipaa}`);

    if (hasHealthTech && hasHitrust) {
      success = true;
      collector.noteSuccess('Both Health Tech and HITRUST offerings visible', 'Offerings');
    } else if (hasHealthTech || hasHitrust) {
      success = true;
      notes.push('Only one healthcare-related offering found');
    } else {
      collector.noteConfusion('Cannot identify healthcare-specific offerings', 'Content');
    }

    // Auditor comparison needs
    collector.noteMissing(
      'Comparison matrix: Health Tech (HIPAA) vs HITRUST CSF. ' +
      'What additional controls does HITRUST require? ' +
      'What should a client choose and when?',
      'Decision Support'
    );

    collector.critique(
      'Healthcare compliance is complex. HIPAA != HITRUST. ' +
      'Clients need guidance on: "If you\'re a healthcare startup, you need X. ' +
      'If you\'re pursuing HITRUST certification, you need X + Y + Z."',
      'Healthcare Clarity'
    );

    collector.suggestRedesign(
      'Create a healthcare compliance guide: ' +
      '"HIPAA Basics" vs "HITRUST Ready" vs "HITRUST Certified" ' +
      'with clear policy requirements for each level.',
      'Healthcare Section'
    );

    collector.recordTask(
      'Compare Health Tech vs HITRUST offerings',
      success,
      notes.join('; ')
    );
  });

  test('Task 4: Find control mapping information', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'auditor-looking-for-mappings',
      'Looking for control mapping documentation'
    );

    const pageContent = await page.textContent('body');

    // Look for mapping indicators
    const hasMapping = pageContent?.toLowerCase().includes('mapping') ||
                      pageContent?.toLowerCase().includes('control') ||
                      pageContent?.toLowerCase().includes('criteria') ||
                      pageContent?.toLowerCase().includes('crosswalk');

    if (hasMapping) {
      success = true;
      notes.push('Control mapping language found');
      collector.noteSuccess('Control mapping terminology present', 'Documentation');
    } else {
      collector.noteFrustration(
        'No control mapping information visible. This is critical for audit preparation.',
        'Documentation'
      );
      notes.push('No control mapping found');
    }

    // Detailed mapping requirements
    collector.noteMissing(
      'SOC 2 TSC (Trust Services Criteria) mapping. ' +
      'Which policies address CC1.1, CC1.2, etc.?',
      'SOC 2 Mapping'
    );

    collector.noteMissing(
      'HIPAA control mapping. Which policies address the Privacy Rule? Security Rule? ' +
      '45 CFR 164.308? 164.310? 164.312?',
      'HIPAA Mapping'
    );

    collector.noteMissing(
      'HITRUST CSF control mapping. Which policies address which HITRUST control domains?',
      'HITRUST Mapping'
    );

    collector.suggestRedesign(
      'Auditors need a downloadable control mapping document (Excel/PDF). ' +
      'Columns: Policy Name, SOC2 Control, HIPAA Control, HITRUST Control. ' +
      'This is standard in the GRC industry.',
      'Documentation'
    );

    collector.recordTask(
      'Find control mapping information',
      success,
      notes.join('; ')
    );
  });

  test('Task 5: Evaluate quality indicators', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'auditor-quality-evaluation',
      'Evaluating quality indicators - versioning, updates, professionalism'
    );

    const pageContent = await page.textContent('body');

    // Quality indicators an auditor looks for
    const qualityChecks = {
      hasVersion: pageContent?.toLowerCase().includes('version') ||
                 pageContent?.match(/v\d+\.\d+/) !== null,
      hasDate: pageContent?.match(/\d{4}/) !== null,
      hasLastUpdated: pageContent?.toLowerCase().includes('updated') ||
                     pageContent?.toLowerCase().includes('last modified'),
      hasReviewCycle: pageContent?.toLowerCase().includes('review') ||
                     pageContent?.toLowerCase().includes('annual'),
      hasOwnership: pageContent?.toLowerCase().includes('owner') ||
                   pageContent?.toLowerCase().includes('maintained by'),
    };

    const qualityScore = Object.values(qualityChecks).filter(Boolean).length;
    notes.push(`Quality indicators: ${qualityScore}/5`);

    if (qualityScore >= 2) {
      success = true;
      collector.noteSuccess('Some quality indicators present', 'Quality');
    } else {
      collector.noteFrustration(
        'Quality indicators missing. No version numbers, dates, or update information.',
        'Quality'
      );
    }

    // Specific quality requirements
    collector.noteMissing(
      'Version control. Policies should have version numbers (e.g., v2.1) ' +
      'and effective dates. This is required for audit trails.',
      'Versioning'
    );

    collector.noteMissing(
      'Change history. What changed between versions? ' +
      'Auditors need to understand policy evolution.',
      'Change Management'
    );

    collector.noteMissing(
      'Review cycle commitment. "Policies reviewed annually" or ' +
      '"Updated when frameworks change" - shows maintenance commitment.',
      'Maintenance'
    );

    collector.critique(
      'Policies without version control and change history are audit risks. ' +
      'They suggest an immature document management process.',
      'Document Control'
    );

    collector.recordTask(
      'Evaluate quality indicators',
      success,
      notes.join('; ')
    );
  });

  test('Task 6: Check licensing for client usability', async () => {
    collector.startTask();
    let success = false;
    const notes: string[] = [];

    await collector.captureScreenshot(
      page,
      'auditor-checking-licensing',
      'Checking licensing for client usability'
    );

    const pageContent = await page.textContent('body');

    // License information
    const hasLicense = pageContent?.toLowerCase().includes('license') ||
                      pageContent?.includes('CC-BY') ||
                      pageContent?.toLowerCase().includes('creative commons') ||
                      pageContent?.toLowerCase().includes('open source');

    if (hasLicense) {
      success = true;
      notes.push('License information found');
      collector.noteSuccess('Licensing information present', 'Legal');
    } else {
      collector.noteFrustration(
        'Licensing unclear. Can my clients legally use these policies?',
        'Legal'
      );
      notes.push('No license information found');
    }

    // Auditor-specific licensing concerns
    collector.critique(
      'Auditor concern: If a client uses these policies, can they represent them as their own? ' +
      'Or do they need to attribute? This affects how policies appear during audits.',
      'Attribution'
    );

    collector.noteMissing(
      'License FAQ for common use cases: ' +
      '"Can I modify these policies?" "Do I need to credit the source?" ' +
      '"Can I use these for commercial purposes?" "Can consultants use these with clients?"',
      'License FAQ'
    );

    collector.suggestRedesign(
      'Make licensing crystal clear for the GRC community: ' +
      '"Use these policies as-is, modify them, rebrand them - ' +
      'just attribute under CC-BY-SA" (or whatever the terms are).',
      'License Communication'
    );

    collector.recordTask(
      'Check licensing for client usability',
      success,
      notes.join('; ')
    );
  });

  test('Critical Evaluation: Audit-readiness assessment', async () => {
    collector.startTask();
    const notes: string[] = [];

    await navigateWithTracking(page, '/', collector);

    await collector.captureScreenshot(
      page,
      'auditor-final-evaluation',
      'Final auditor evaluation: Are these policies audit-ready?'
    );

    // Comprehensive auditor assessment
    collector.critique(
      'AUDITOR VERDICT: NEEDS WORK. These policies may be a good starting point, ' +
      'but lack the documentation auditors need: ' +
      '(1) No control mappings, ' +
      '(2) No version control visible, ' +
      '(3) No policy inventory, ' +
      '(4) No implementation guidance.',
      'Audit Readiness'
    );

    collector.suggestRedesign(
      'To be auditor-friendly, add: ' +
      '(1) Downloadable control mapping spreadsheet, ' +
      '(2) Policy document templates with version headers, ' +
      '(3) Implementation guide for each policy type, ' +
      '(4) Sample evidence collection guidance.',
      'Auditor Experience'
    );

    collector.suggestRedesign(
      'Consider creating an "Auditor Resources" section: ' +
      '"Use these materials when preparing for SOC2/HIPAA audits" with ' +
      'readiness checklists, control matrices, and evidence guides.',
      'Auditor Section'
    );

    collector.noteMissing(
      'Sample policy documents. As an auditor, I want to preview format, ' +
      'structure, and depth before recommending to clients.',
      'Previews'
    );

    collector.noteMissing(
      'Evidence collection templates. Policies are only part of audit readiness. ' +
      'Evidence of policy implementation is equally important.',
      'Evidence Templates'
    );

    collector.noteMissing(
      'Gap analysis tool. "Upload your current policies and see what\'s missing ' +
      'for SOC2 compliance." This would be incredibly valuable.',
      'Gap Analysis'
    );

    notes.push('Auditor evaluation complete - significant documentation gaps');

    collector.recordTask(
      'Critical Evaluation: Audit-readiness assessment',
      true,
      notes.join('; ')
    );
  });

  test('Free Exploration: Auditor deep-dive patterns', async () => {
    collector.startTask();
    const notes: string[] = [];

    // Auditor exploration patterns
    const explorationActions = [
      { action: 'checkDownloads', description: 'Look for downloadable materials' },
      { action: 'seekSamples', description: 'Search for sample documents' },
      { action: 'evaluateDepth', description: 'Evaluate content depth' },
      { action: 'assessProfessionalism', description: 'Assess professional rigor' },
    ];

    for (const { action, description } of explorationActions) {
      try {
        switch (action) {
          case 'checkDownloads':
            const downloadLinks = await page.locator('a[href*=".pdf"], a[href*=".doc"], a[href*=".xlsx"], a:has-text("download")').count();
            notes.push(`Downloadable resources: ${downloadLinks}`);
            if (downloadLinks === 0) {
              collector.noteMissing(
                'No downloadable resources (PDF, Excel, Word). ' +
                'Auditors expect materials they can share with clients.',
                'Downloads'
              );
            }
            break;

          case 'seekSamples':
            const pageContent = await page.textContent('body');
            const hasSamples = pageContent?.toLowerCase().includes('sample') ||
                              pageContent?.toLowerCase().includes('example') ||
                              pageContent?.toLowerCase().includes('template');
            if (!hasSamples) {
              collector.noteMissing(
                'No sample or template documents visible. ' +
                'I want to see what I\'m getting before recommending to clients.',
                'Samples'
              );
            }
            notes.push(`Has samples/templates: ${hasSamples}`);
            break;

          case 'evaluateDepth':
            // Scroll and capture various sections
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.33));
            await page.waitForTimeout(500);
            await collector.captureScreenshot(
              page,
              'explore-auditor-depth-1',
              'Evaluating content depth - section 1'
            );

            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.66));
            await page.waitForTimeout(500);
            await collector.captureScreenshot(
              page,
              'explore-auditor-depth-2',
              'Evaluating content depth - section 2'
            );
            break;

          case 'assessProfessionalism':
            collector.note(
              'Professional rigor assessment for vision model: ' +
              'Does this look like it was created by compliance professionals? ' +
              'Does the level of detail match what auditors expect?',
              'Professionalism'
            );
            break;
        }
      } catch (error) {
        notes.push(`${action} failed: ${error}`);
      }
    }

    await collector.captureScreenshot(
      page,
      'explore-auditor-complete',
      'Completed auditor deep-dive exploration'
    );

    collector.recordTask(
      'Free Exploration: Auditor deep-dive patterns',
      true,
      notes.join('; ')
    );
  });
});
