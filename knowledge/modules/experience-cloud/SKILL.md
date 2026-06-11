# Experience Cloud Skill

## Purpose

> **Category: Platform Skill** — applies org-wide across all Salesforce clouds; not specific to Manufacturing Cloud, but relevant for customer-facing quoting portals, partner storefronts, and self-service billing pages built on Experience Cloud.

Provides authoritative Experience Cloud domain knowledge for Manufacturing Cloud engineers: concepts, frameworks, site setup, templates, user management, security, deployment, and limits.

## When to Invoke

Invoke this skill when the user mentions:
- Experience Cloud, Community Cloud, Community, digital experience, Experience Builder, Experience Workspaces
- LWR site, Aura site, Visualforce site, enhanced LWR site, enhanced sites and content platform
- Experience Cloud templates: Customer Service, Partner Central, Customer Account Portal, Help Center, Build Your Own, Microsite
- Enable Digital Experiences, digital experiences settings, Experience Cloud org setup
- Experience Cloud licenses: Customer Community, Customer Community Plus, Partner Community, External Identity, External Apps, Channel Account
- External user, guest user, authenticated user, Experience Cloud user profiles
- Partner site, partner portal, partner relationship management in Experience Cloud
- Experience Builder, drag-and-drop site building, Experience Cloud components
- LWC in Experience Cloud, Aura components in Experience Cloud, custom Lightning components in sites
- CSP, Content Security Policy, Lightning Locker, clickjack protection in Experience Cloud
- SAML SSO for Experience Cloud, authentication provider SSO, Experience Cloud login
- Salesforce CMS, CMS Connect, CMS workspace, CMS content in Experience Cloud
- Deploy Experience Cloud site, change sets for Experience Cloud, Metadata API for Experience Cloud
- Network metadata type, ExperienceBundle, DigitalExperienceBundle, DigitalExperienceConfig
- SEO for Experience Builder, sitemap.xml, robots.txt, content snapshots, preferred domain
- Aura to LWR migration, migrate Experience Cloud site
- Experience Cloud limits, page views, bandwidth allocation, site URL routes
- Agentforce for Experience Builder, Experience Builder agent
- Topics, navigational topics, featured topics, content topics in Experience Cloud
- Gamification, reputation, recognition badges in Experience Cloud
- Google Analytics in Experience Cloud, experience pulse, reporting on Experience Cloud sites
- Contributor roles in Experience Cloud (Experience admin, Publisher, Builder, Viewer)
- Guest user profile, guest user sharing rules, guest user data access
- Sharing sets, sharing rules for Experience Cloud
- Audience targeting, personalization, page variations in Experience Cloud
- Multilingual Experience Cloud site, language selector, multilingual LWR site
- Performance optimization for Experience Cloud, progressive rendering, browser caching
- Mobile Publisher for Experience Cloud, branded mobile app

## Phase Protocol

### Phase 1 — Classify the request

Determine which area applies:
- **Concepts / Architecture** → `concepts-and-architecture.md`
- **Setup / Configuration** → `setup-and-configure.md`
- **Templates / Building** → `templates-and-building.md`
- **Users / Data Access / Security** → `users-security-and-access.md`
- **Deployment / SEO** → `deployment-and-seo.md`
- **Limits / Gotchas** → `limits-and-gotchas.md`

### Phase 2 — Framework distinction

Before answering:
1. Clarify which framework (LWR / enhanced LWR / Aura / Visualforce) if the question is framework-specific.
2. If the user doesn't specify, note differences between frameworks when they matter.
3. Flag Aura-only or LWR-only behaviors explicitly.

### Phase 3 — Answer

- Cite specific permission names, metadata types, and setting paths.
- For deployment questions, always specify the correct metadata types per site type (Network, CustomSite, ExperienceBundle vs DigitalExperienceBundle).
- For security questions, distinguish between CSP levels (Strict vs Relaxed) and note that Strict CSP is the default.
- For template questions, identify whether the template is LWR-based or Aura-based.

### Phase 4 — Verify against gotchas

Cross-check against `limits-and-gotchas.md`:
- Enabling Digital Experiences is irreversible.
- Deploying an inbound change set overwrites the target site.
- Custom list views are not included as change set dependencies.
- Navigation menu translations are deleted when deploying with additional menu items.
- LWR sites support max 500 routes; keep below 250 for best performance.
- SEO is not supported on sandbox or Developer Edition orgs.
- `Allow framing by any page (most protection)` breaks Administration pages in Experience Workspaces.

## Quality Standards

- Never confuse LWR and Aura component availability — many components are Aura-only.
- Always specify the correct metadata type per site type in deployment guidance.
- For SEO setup, always note: make your site public first, identify preferred domain before going public.
- For security: Strict CSP is default for new sites (Spring '19+); old sites may still use relaxed CSP.
- Guest users are always unauthenticated; they cannot log in.
