# Experience Cloud — Concepts and Architecture

---

## What Is Experience Cloud

Salesforce Experience Cloud (formerly Community Cloud) is a digital experience platform for building CRM-powered online sites. You can create branded digital experiences — portals, help forums, partner sites, corporate websites, and mobile apps — for customers, partners, and employees.

Key toolset:
- **Experience Builder** — Point-and-click site design using templates and components
- **Experience Workspaces** — Admin and management command center for a site
- **Salesforce CMS** — Content creation, management, and publishing system
- **Mobile Publisher** — Create and distribute branded mobile apps from your site

Available in: Enterprise, Performance, Unlimited, and Developer Editions.

---

## Three Site Frameworks

| Framework | Built with | Templates | Notes |
|-----------|-----------|-----------|-------|
| **LWR (Lightning Web Runtime)** | Lightning Web Components | Build Your Own (LWR), Microsite (LWR) | Fastest performance; requires developer familiarity with LWC, Salesforce DX |
| **Enhanced LWR** | LWC on enhanced sites platform | All LWR templates (Winter '23+) | LWR sites created Winter '23+ are automatically enhanced; adds partial deployment, site content search |
| **Aura** | Aura framework (SSJ) | Customer Service, Partner Central, Customer Account Portal, Help Center, Build Your Own (Aura) | Mostly low-code; supports LWC + Aura components together |
| **Visualforce** | Visualforce (VF) | Salesforce Tabs + Visualforce | Requires developer; full platform access; NOT built in Experience Builder |

**Key framework rule:** You cannot switch a site between LWR and Aura after creation. LWR is forward direction for all new builds.

---

## Templates

| Template | Framework | Primary Use Case |
|----------|-----------|-----------------|
| **Customer Service** | Aura | Self-service portal: knowledge, case creation, Chatter Questions, community feed |
| **Partner Central** | Aura | Partner relationship management (PRM): lead distribution, deal registration, channel marketing |
| **Customer Account Portal** | Aura | Customer self-service: invoices, account information, knowledge base |
| **Help Center** | Aura | Public-access knowledge base; reduces support load |
| **Build Your Own (Aura)** | Aura | Flexible starting point; all standard pages included |
| **Build Your Own (LWR)** | LWR/Enhanced LWR | Custom, pixel-perfect sites; developer-focused |
| **Microsite (LWR)** | LWR/Enhanced LWR | Small, special-purpose sites: landing pages, event pages |
| **Aloha** | Aura | App Launcher only (not a site) |
| **Salesforce Tabs + Visualforce** | Visualforce | Full platform access; developer-only; not Experience Builder |

**Retired templates:** Koa and Kokua are retired; migrate to Customer Service or Help Center.

---

## Building Blocks of a Site

Every Experience Cloud site is composed of layered elements:

1. **Salesforce Platform** — Your org's data, users, profiles, records. All objects, flows, Apex, and platform services are available for use with the site.
2. **Salesforce CMS** — Content repository (articles, images, banners). Created in the Digital Experiences app and pushed to sites.
3. **Security** — Settings managed in three places: Experience Builder settings, user permissions in Setup, and overall Digital Experiences settings in Setup.
4. **Presentation** — Experience Builder templates and components; defines what users see.
5. **Analytics** — Dashboard tile in Experience Workspaces; reports and dashboards. Google Analytics or third-party scripts recommended for deep analytics.

---

## Three Primary Management Areas

### Salesforce Setup
- Enable Digital Experiences
- Create/delete sites
- Manage user permissions and profiles
- Configure org-wide settings (roles, sharing, domains)
- Access: Setup → Digital Experiences → All Sites

### Experience Workspaces
Seven workspace tiles accessed from the Workspaces link next to a site in All Sites:

| Workspace | Purpose |
|-----------|---------|
| **Builder** | Design and customize pages, components, navigation |
| **Moderation** | Monitor flagged posts, comments, files; set moderation rules |
| **Content Management** | Add CMS content; manage Topics and Recommendations |
| **Gamification** | Recognition Badges and Reputation setup |
| **Dashboards** | Reports, dashboards, and engagement insights |
| **Administration** | Branding, membership, preferences, email, login settings, URL redirects |
| **Guided Setup** | Step-by-step configuration of site features |

### Experience Builder
- Design pages visually
- Add and configure components
- Set themes and branding
- Manage page-level properties
- Configure security and SEO settings
- Preview and publish the site

---

## User Types

| User Type | Description | Login |
|-----------|-------------|-------|
| **Internal User** | Salesforce org employee; full license | Yes — Salesforce credentials |
| **External User** | Customer or partner; uses Experience Cloud license | Yes — community credentials |
| **Guest User** | Anonymous visitor; no login | No (unauthenticated) |

External user licenses:
- **Customer Community** — Basic access; limited object access and sharing
- **Customer Community Plus** — More access; reports and dashboards
- **Partner Community** — Highest external access; leads, opportunities, dashboards; first-class ticket analogy
- **External Identity** — Identity/SSO only; minimal Salesforce data access
- **External Apps** — Custom application access
- **Channel Account** — For channel account partner management

Key license rule: In Enterprise/Performance/Unlimited editions, you can create up to **100 Experience Cloud sites** without buying community licenses. But some features (like Partner Central template) **require at least one Partner Community license**.

---

## Glossary of Key Terms

| Term | Definition |
|------|-----------|
| **Experience Cloud Site** | An online space for connecting with customers, partners, or employees; built on Salesforce |
| **Community** | Old term for Experience Cloud site; still used in some APIs and permission names |
| **Enhanced Sites and Content Platform** | New platform (Winter '23+) combining CMS and LWR sites; enables partial deployment and content search |
| **Enhanced LWR Site** | LWR site on the enhanced platform; recognized by absence of `/s` in URL |
| **Experience Bundle** | Metadata type representing an Aura or non-enhanced LWR site's pages, components, and settings |
| **DigitalExperienceBundle** | Metadata type for enhanced LWR sites; allows text-based partial deployment |
| **Network** | Metadata type representing the site's admin settings (membership, email, page overrides) |
| **CustomSite** | Metadata type for domain and page settings |
| **CMS Workspace** | Container for content created in the Digital Experiences app |
| **CMS Connect** | Embed content from an external CMS into an Experience Builder site |
| **Contributor Roles** | Role-based access inside the Builder and Workspaces (Experience admin, Publisher, Builder, Viewer) |
| **Sharing Set** | Mechanism to grant guest or external users access to records based on a lookup relationship |

---

## Site Lifecycle States

| Status | Description |
|--------|-------------|
| **Preview** | Site is building; visible only to site members logged in via `/login?startURL=...`; not publicly accessible |
| **Active (Live)** | Site is published and accessible to all intended users |
| **Inactive** | Visible to admins only; external users see a "Site Under Construction" page |
| **Archived** | Site is deactivated and can't be reactivated without contacting Salesforce; does **not** count against the 100-site limit |

---

## Site URL Structure

| Framework | Default URL Format |
|-----------|-------------------|
| Aura site | `https://MyDomainName.my.site.com/urlPathPrefix/s/` |
| Enhanced LWR site | `https://MyDomainName.my.site.com/urlPathPrefix/` (no `/s`) |
| Custom domain | `https://www.example.com/` (any path) |

Domain formats: `MyDomainName.my.site.com` (production), `MyDomainName--sandbox.sandbox.my.site.com` (sandbox).

---

## Site Limits

| Limit | Value |
|-------|-------|
| Max sites per org (published + preview) | 100 (archived sites don't count) |
| LWR site max routes | 500 (keep below 250 for best performance) |
| Enterprise Edition page views | 500,000/month |
| Unlimited/Performance Edition page views | 1,000,000/month |
| Page view overage calculation | 12-month look-back average |

**Bandwidth allocations per 24-hour rolling period:**

| Edition | Production | Sandbox |
|---------|-----------|---------|
| Enterprise | 40 GB | 1 GB |
| Unlimited/Performance | 40 GB | 1 GB |
| Developer | 500 MB | N/A |

Bandwidth and page views apply to **non-authenticated (guest) users only**.
