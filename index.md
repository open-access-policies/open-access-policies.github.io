---
layout: page
hide_description: true
sitemap: true
---

<a href="#main-content" class="skip-nav">Skip to main content</a>

<div class="hero-section" id="main-content" role="main">
  <h1 class="hero-headline">Free, Open-Source Compliance Policies</h1>
  <p class="hero-subheadline">
    Production-ready policy templates for SOC2, HIPAA, HITRUST, and GDPR.
    Professionally written, audit-tested, and free to use under CC-BY-SA-4.0.
  </p>
  <p class="hero-audience">
    <strong>Built for:</strong> Startups pursuing compliance &bull; Compliance officers building programs &bull; Developers implementing security controls
  </p>
  <div style="margin-top: 1.5rem;">
    <a href="#policies" class="cta-button">Browse Policies</a>
    <a href="#getting-started" class="cta-button cta-secondary" style="margin-left: 1rem;">Getting Started</a>
  </div>
</div>

## Why Trust These Policies?
{: .text-center .mt-lg}

<div class="trust-section">
  <div class="trust-grid">
    <div class="trust-item">
      <h3>Created by a CISO</h3>
      <p>Written by <a href="#about">Sean Todd</a>, an experienced Chief Information Security Officer who has built and maintained compliance programs at multiple organizations.</p>
    </div>
    <div class="trust-item">
      <h3>Audit-Tested</h3>
      <p>These policies have been used in real SOC2, HIPAA, and HITRUST audits. They're designed to satisfy auditor expectations, not just check boxes.</p>
    </div>
    <div class="trust-item">
      <h3>Actively Maintained</h3>
      <p>Policies are updated when frameworks change. Each repository includes version history and clear documentation of changes.</p>
    </div>
    <div class="trust-item">
      <h3>Open Source</h3>
      <p>Licensed under <a href="#licensing">CC-BY-SA-4.0</a>. Use them commercially, modify them freely, and contribute improvements back to the community.</p>
    </div>
  </div>
</div>

## Which Policy Set Is Right for You?
{: #comparison .text-center}

<div class="comparison-section">
  <table class="comparison-table">
    <thead>
      <tr>
        <th>Policy Set</th>
        <th>Best For</th>
        <th>Frameworks</th>
        <th>Complexity</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Minimal SOC2</strong></td>
        <td>Early-stage startups needing basic SOC2</td>
        <td><span class="badge badge-soc2">SOC2</span></td>
        <td>Low</td>
      </tr>
      <tr>
        <td><strong>Health Tech</strong></td>
        <td>Healthcare companies handling PHI</td>
        <td><span class="badge badge-soc2">SOC2</span> <span class="badge badge-hipaa">HIPAA</span></td>
        <td>Medium</td>
      </tr>
      <tr>
        <td><strong>Health Tech (HITRUST)</strong></td>
        <td>Healthcare companies seeking HITRUST certification</td>
        <td><span class="badge badge-hitrust">HITRUST</span> <span class="badge badge-hipaa">HIPAA</span></td>
        <td>High</td>
      </tr>
      <tr>
        <td><strong>Streaming</strong></td>
        <td>Media/streaming services with global users</td>
        <td><span class="badge badge-soc2">SOC2</span> <span class="badge badge-gdpr">GDPR</span> <span class="badge">COPPA</span> <span class="badge">DSA</span></td>
        <td>High</td>
      </tr>
    </tbody>
  </table>

  <p class="text-center" style="margin-top: 1rem; color: #666;">
    <strong>Not sure which to choose?</strong> Start with Minimal SOC2 if you're a B2B startup. Add Health Tech if you handle healthcare data.
  </p>
</div>

## Policy Sets
{: #policies}

{% include portfolio-grid.html %}

## Getting Started
{: #getting-started}

<div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; margin: 2rem 0;">

### 1. Choose Your Policy Set
Review the [comparison table](#comparison) above to find the right fit for your organization.

### 2. Clone or Fork the Repository
Each policy set is hosted on GitHub. Clone or fork the repository to your own organization:

```bash
git clone https://github.com/open-access-policies/health-tech.git
```

### 3. Customize for Your Organization
Replace placeholder text (like `[Company Name]`) with your organization's information. Modify policies to match your actual practices.

### 4. Implement and Document
Policies are only valuable if they're implemented. Use these as a foundation, then document how your organization actually follows them.

### 5. Keep Up to Date
Watch the repositories for updates. When frameworks change, we update the policies. Pull updates and merge them with your customizations.

<p style="margin-top: 1.5rem;">
  <a href="https://github.com/open-access-policies" class="cta-button">View on GitHub</a>
</p>

</div>

## Licensing FAQ
{: #licensing}

<div class="faq-section">
  <div class="faq-item">
    <p class="faq-question">Can I use these policies for my company?</p>
    <p class="faq-answer">Yes! These policies are licensed under CC-BY-SA-4.0, which allows commercial use. You can use them at your for-profit company without paying anything.</p>
  </div>

  <div class="faq-item">
    <p class="faq-question">Can I modify the policies?</p>
    <p class="faq-answer">Absolutely. In fact, you should modify them to match your organization's actual practices. Generic policies won't help you pass an audit - customized ones will.</p>
  </div>

  <div class="faq-item">
    <p class="faq-question">Do I need to give credit?</p>
    <p class="faq-answer">Yes, CC-BY-SA-4.0 requires attribution. A simple note in your internal documentation or policy footer is sufficient. You don't need to publicly display attribution.</p>
  </div>

  <div class="faq-item">
    <p class="faq-question">Can consultants use these with clients?</p>
    <p class="faq-answer">Yes. Consultants and compliance professionals can use these policies as templates for their clients. The same attribution and share-alike requirements apply.</p>
  </div>

  <div class="faq-item">
    <p class="faq-question">What does "share-alike" mean?</p>
    <p class="faq-answer">If you create derivative works and distribute them publicly, those derivatives must use the same CC-BY-SA-4.0 license. Internal company use doesn't require sharing your modifications.</p>
  </div>
</div>

## About the Author
{: #about}

<div class="about-section">
  <div class="author-card">
    <img src="/assets/img/logo.png" alt="Open Access Policies" class="author-avatar">
    <div class="author-info">
      <h3>Sean Todd</h3>
      <p>Sean is a Chief Information Security Officer with experience building compliance programs at healthcare technology, fintech, and SaaS companies. He's led organizations through successful SOC2, HIPAA, and HITRUST audits.</p>
      <p>These policies were created because compliance shouldn't be a barrier to building great products. Small companies deserve access to the same quality policies that enterprises pay consultants thousands of dollars to create.</p>
      <div class="author-links">
        <a href="https://github.com/descentintomael">GitHub</a>
        <a href="https://www.linkedin.com/in/seanmtodd/">LinkedIn</a>
        <a href="mailto:sean@openaccesspolicies.org">Contact</a>
      </div>
    </div>
  </div>
</div>

## Need Custom Policies?
{: .text-center}

<div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); border-radius: 8px; margin: 2rem 0;">
  <h3 style="color: #333; margin-bottom: 1rem;">Looking for something specific?</h3>
  <p style="color: #555; margin-bottom: 1.5rem;">Need policies tailored to your industry, custom framework mappings, or help implementing your compliance program?</p>
  <a href="mailto:sean@openaccesspolicies.org" class="cta-button" style="background: #333;">Get in Touch</a>
</div>

<footer role="contentinfo" style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e0e0e0; text-align: center; color: #666;">
  <p>&copy; {{ 'now' | date: "%Y" }} Open Access Policies. Content licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-SA-4.0</a>.</p>
  <p><a href="https://github.com/open-access-policies">GitHub</a> &bull; <a href="mailto:sean@openaccesspolicies.org">Contact</a></p>
</footer>
