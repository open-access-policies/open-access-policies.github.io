import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Observation types for persona-driven testing.
 *
 * Standard types:
 * - confusion: Unclear what to do, feedback ambiguous
 * - frustration: Goal blocked, feature missing, error encountered
 * - success: Goal achieved smoothly, good UX discovered
 * - note: Neutral observation, small suggestion
 *
 * Critical evaluation types (for "nothing is sacred" philosophy):
 * - critique: Fundamental problem with design/approach
 * - missing: Something important that doesn't exist
 * - redesign: Bold suggestion for structural change
 */
export type ObservationType =
  | 'confusion'
  | 'frustration'
  | 'success'
  | 'note'
  | 'critique'
  | 'missing'
  | 'redesign';

export interface Observation {
  type: ObservationType;
  description: string;
  location: string;
  timestamp: string;
}

export interface Screenshot {
  name: string;
  filename: string;
  url: string;
  pageTitle: string;
  context: string;
  base64: string;
  timestamp: string;
}

export interface TaskResult {
  name: string;
  success: boolean;
  durationMs: number;
  notes: string;
  timestamp: string;
}

export interface SessionMetrics {
  startTime: string;
  endTime: string | null;
  pageLoadCount: number;
  clickCount: number;
  searchCount: number;
  backNavigationCount: number;
  consoleErrors: string[];
}

export interface Persona {
  name: string;
  role: string;
  background: string;
  goals: string[];
  behaviors: string[];
}

export interface ObservationReport {
  persona: Persona;
  metrics: SessionMetrics;
  taskResults: TaskResult[];
  observations: Observation[];
  screenshots: Screenshot[];
  generatedAt: string;
}

/**
 * ObservationCollector - Captures user journey data for persona-driven testing.
 *
 * This class tracks everything during test execution:
 * - Session metrics (timestamps, interactions, errors)
 * - Screenshots (PNG files + base64 for vision model analysis)
 * - Task results (success/failure, duration, notes)
 * - Observations categorized by type
 *
 * Output is saved as JSON for both automated analysis and vision model review.
 */
export class ObservationCollector {
  private persona: Persona;
  private outputDir: string;
  private screenshotDir: string;
  private metrics: SessionMetrics;
  private taskResults: TaskResult[] = [];
  private observations: Observation[] = [];
  private screenshots: Screenshot[] = [];
  private currentTaskStart: number | null = null;

  constructor(persona: Persona, baseOutputDir: string = 'tests/results') {
    this.persona = persona;
    const personaSlug = this.slugify(persona.name);
    this.outputDir = path.join(baseOutputDir);
    this.screenshotDir = path.join(baseOutputDir, 'screenshots', personaSlug);

    // Ensure directories exist
    fs.mkdirSync(this.outputDir, { recursive: true });
    fs.mkdirSync(this.screenshotDir, { recursive: true });

    // Initialize metrics
    this.metrics = {
      startTime: '',
      endTime: null,
      pageLoadCount: 0,
      clickCount: 0,
      searchCount: 0,
      backNavigationCount: 0,
      consoleErrors: [],
    };
  }

  /**
   * Start the observation session. Call this in beforeAll.
   */
  startSession(): void {
    this.metrics.startTime = new Date().toISOString();
  }

  /**
   * End the session and save all observations to JSON. Call this in afterAll.
   */
  endSession(): string {
    this.metrics.endTime = new Date().toISOString();
    return this.saveReport();
  }

  /**
   * Track a page load event.
   */
  trackPageLoad(): void {
    this.metrics.pageLoadCount++;
  }

  /**
   * Track a click event.
   */
  trackClick(): void {
    this.metrics.clickCount++;
  }

  /**
   * Track a search action.
   */
  trackSearch(): void {
    this.metrics.searchCount++;
  }

  /**
   * Track a back navigation (high counts indicate user confusion).
   */
  trackBackNavigation(): void {
    this.metrics.backNavigationCount++;
  }

  /**
   * Record a console error captured during testing.
   */
  recordConsoleError(error: string): void {
    this.metrics.consoleErrors.push(error);
  }

  /**
   * Capture a screenshot with context for vision model analysis.
   *
   * @param page - Playwright page object
   * @param name - Descriptive name for the screenshot
   * @param context - What the user was trying to do when this was captured
   */
  async captureScreenshot(
    page: Page,
    name: string,
    context: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const filename = `${this.slugify(name)}-${Date.now()}.png`;
    const filepath = path.join(this.screenshotDir, filename);

    // Capture screenshot
    const buffer = await page.screenshot({ fullPage: true });

    // Save to file
    fs.writeFileSync(filepath, buffer);

    // Convert to base64 for JSON output (vision model analysis)
    const base64 = buffer.toString('base64');

    // Get page info
    const url = page.url();
    const pageTitle = await page.title();

    this.screenshots.push({
      name,
      filename,
      url,
      pageTitle,
      context,
      base64,
      timestamp,
    });
  }

  /**
   * Start timing a task. Call this at the beginning of each task test.
   */
  startTask(): void {
    this.currentTaskStart = Date.now();
  }

  /**
   * Record the result of a completed task.
   *
   * @param name - Task name/description
   * @param success - Whether the task was completed successfully
   * @param notes - Additional observations about how the task went
   */
  recordTask(name: string, success: boolean, notes: string): void {
    const durationMs = this.currentTaskStart
      ? Date.now() - this.currentTaskStart
      : 0;

    this.taskResults.push({
      name,
      success,
      durationMs,
      notes,
      timestamp: new Date().toISOString(),
    });

    this.currentTaskStart = null;
  }

  /**
   * Add an observation during testing.
   *
   * @param type - Type of observation (confusion, frustration, success, note, critique, missing, redesign)
   * @param description - What was observed
   * @param location - Where it occurred (page, element, etc.)
   */
  addObservation(
    type: ObservationType,
    description: string,
    location: string
  ): void {
    this.observations.push({
      type,
      description,
      location,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Convenience method for adding a confusion observation.
   */
  noteConfusion(description: string, location: string): void {
    this.addObservation('confusion', description, location);
  }

  /**
   * Convenience method for adding a frustration observation.
   */
  noteFrustration(description: string, location: string): void {
    this.addObservation('frustration', description, location);
  }

  /**
   * Convenience method for adding a success observation.
   */
  noteSuccess(description: string, location: string): void {
    this.addObservation('success', description, location);
  }

  /**
   * Convenience method for adding a general note.
   */
  note(description: string, location: string): void {
    this.addObservation('note', description, location);
  }

  /**
   * Convenience method for adding a fundamental critique.
   * Use for problems with the overall design/approach.
   */
  critique(description: string, location: string): void {
    this.addObservation('critique', description, location);
  }

  /**
   * Convenience method for noting something important that's missing.
   */
  noteMissing(description: string, location: string): void {
    this.addObservation('missing', description, location);
  }

  /**
   * Convenience method for suggesting a bold redesign.
   */
  suggestRedesign(description: string, location: string): void {
    this.addObservation('redesign', description, location);
  }

  /**
   * Get current metrics (useful for assertions in tests).
   */
  getMetrics(): SessionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get all observations (useful for analysis within tests).
   */
  getObservations(): Observation[] {
    return [...this.observations];
  }

  /**
   * Get observations filtered by type.
   */
  getObservationsByType(type: ObservationType): Observation[] {
    return this.observations.filter((o) => o.type === type);
  }

  /**
   * Get task results.
   */
  getTaskResults(): TaskResult[] {
    return [...this.taskResults];
  }

  /**
   * Save the complete observation report to JSON.
   * Returns the path to the saved file.
   */
  private saveReport(): string {
    const report: ObservationReport = {
      persona: this.persona,
      metrics: this.metrics,
      taskResults: this.taskResults,
      observations: this.observations,
      screenshots: this.screenshots,
      generatedAt: new Date().toISOString(),
    };

    const filename = `${this.slugify(this.persona.name)}-observations.json`;
    const filepath = path.join(this.outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));

    return filepath;
  }

  /**
   * Convert a string to a URL-safe slug.
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

/**
 * Helper function to attach console error listener to a page.
 * Call this in beforeEach for each test.
 */
export function attachConsoleErrorListener(
  page: Page,
  collector: ObservationCollector
): void {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      collector.recordConsoleError(msg.text());
    }
  });
}

/**
 * Helper function to wrap page navigation with tracking.
 */
export async function navigateWithTracking(
  page: Page,
  url: string,
  collector: ObservationCollector
): Promise<void> {
  await page.goto(url);
  collector.trackPageLoad();
}

/**
 * Helper function to wrap clicks with tracking.
 */
export async function clickWithTracking(
  page: Page,
  selector: string,
  collector: ObservationCollector
): Promise<void> {
  await page.click(selector);
  collector.trackClick();
}

/**
 * Helper function to go back with tracking.
 */
export async function goBackWithTracking(
  page: Page,
  collector: ObservationCollector
): Promise<void> {
  await page.goBack();
  collector.trackBackNavigation();
}
