# Experience Cloud — Templates and Building

---

## Template Comparison

| Template | Framework | Best For | Key Features |
|----------|-----------|----------|--------------|
| **Customer Service** | Aura | Self-service support portals | Knowledge articles, case creation, Chatter Questions, community feed, topics, leaderboard, recommendations |
| **Partner Central** | Aura | Partner/channel relationship management | Lead distribution, deal registration, channel marketing, Market Development Funds, Enablement pages, dashboards |
| **Customer Account Portal** | Aura | Customer self-service account management | Invoice payment, account info update, knowledge base, dashboards |
| **Help Center** | Aura | Public-access knowledge base only | Article browsing, low-friction self-service; no community feed |
| **Build Your Own (Aura)** | Aura | Custom sites with standard pages | Minimal defaults; add pages and components as needed |
| **Build Your Own (LWR)** | Enhanced LWR | Developer-built custom sites and portals | Pixel-perfect design, LWC, data binding, fastest performance |
| **Microsite (LWR)** | Enhanced LWR | Landing pages, event pages, special-purpose sites | Quick spin-up and teardown; Lead Form component; LWR-based |
| **Salesforce Tabs + Visualforce** | Visualforce | Full platform access with developer control | Most standard and custom objects; no Experience Builder |

**Template notes:**
- Partner Central: requires at least one Partner Community license
- Aloha: App Launcher template — not a site; used for SSO app launch
- Koa and Kokua: **Retired** — migrate to Customer Service or Help Center

---

## Experience Builder Overview

Experience Builder is used to design and customize all LWR and Aura sites.

**Access:** Workspaces → Builder tile, or All Sites → Builder link

### Key Builder Areas

| Area | Location | Purpose |
|------|----------|---------|
| Pages panel | Left panel icon | Manage, create, delete, and configure pages |
| Components panel | Left panel icon | Drag-and-drop components onto the canvas |
| Theme panel | Top settings | Manage colors, fonts, images, branding sets, and CSS |
| Settings | Gear icon | General, theme, languages, navigation, SEO, security, developer, advanced settings |
| Preview | Top button | Preview site as logged-in user or guest user |
| Publish | Top button | Publish changes to make them live |

### Publish vs Activate
- **Activate** — Makes the site live (changes status from Preview to Active)
- **Publish** — Pushes Builder changes to the live site (Activate only needed once; Publish required for every subsequent change)

---

## LWR vs Aura Component Approach

| Concept | LWR | Aura |
|---------|-----|------|
| Components | General-purpose components (Banner, Tile, Grid, Record List, Flow, etc.) | Feature-specific components (Case Deflection, Global Search Box, Feed Publisher, etc.) |
| Data binding | Used to populate components with CMS or CRM data dynamically | Specific components for specific data types |
| CSS | No site-level CSS editor; add in head markup; CSS class per component | CSS overrides via theme, or component-level CSS |
| Custom LWC | Standard LWC development model | Aura + LWC (coexist and interoperate) |
| Performance | Significantly faster (LWR engine, publish-time freezing, HTTP caching) | Standard Aura rendering |

---

## Standard LWR Components

Key components available in Build Your Own (LWR) and Microsite (LWR):

| Component | Purpose |
|-----------|---------|
| **Actions Bar** | User actions on Salesforce records from an LWR site |
| **Banner** | Image + text + button layout; supports data binding |
| **Button** | Call-to-action button linking to pages or external URLs |
| **Card** | Flexible rectangular container |
| **Embedded Messaging** | Messaging for Web (chat) component |
| **Flow** | Screen flows in LWR site pages (Aura-based flows NOT supported) |
| **Grid** | Collections or list views; supports CMS collections in enhanced LWR |
| **HTML Editor** | Custom HTML content; supports data binding in orgs with active community license |
| **Image** | Image display; supports data binding |
| **List** | Dynamic list from CMS or CRM data |
| **Navigation Menu** | Desktop + mobile navigation menus (External URL, Menu Label, Salesforce Object, Site Page types) |
| **Record List (LWR)** | View, search, and sort records in LWR; admin-defined access; does NOT support Task object |
| **Rich Content Editor** | Formatted text + images + videos |
| **Search Bar** | Combined with Results Layout for CMS content search and CRM search |
| **Tabs** | Up to 5 horizontal or vertical tabs |
| **Text Block** | Plain text; inherits branding settings |
| **Tile** | Image + text + button layout for tile navigation |
| **Video** | Video embed |

> **Note:** To enable guest user access to LWR components, enable **Allow guest users to access public APIs** in Workspaces → Administration → Preferences.

---

## Pages in Experience Builder

### Page Types

| Page Type | Description |
|-----------|-------------|
| **Standard page** | A custom page you create in Experience Builder |
| **Object page** | A page for displaying records of a specific Salesforce object (e.g., Account detail) |
| **CMS detail page** | A page for displaying CMS content items |
| **Login page** | The authentication/login page |
| **Error page** | Displayed when an error occurs |

### Create a Page
1. In Experience Builder, click the Pages icon → **+ New Page**
2. Select page type (Standard, Object, CMS Detail)
3. Enter page name and URL
4. Choose a layout
5. Add components and save

### Page Variations (Aura)
- Create variations of a page for different audiences
- Each variation applies to users who match the audience criteria
- Users not in the audience see the default page

### Expression-Based Visibility (Enhanced LWR)
- Show or hide components dynamically based on data values or user attributes
- No audience record required; uses expressions directly on components

---

## Themes and Branding

### Theme Components
A theme consists of:
- **Layouts** — Structural arrangement (login layout, default layout)
- **Styles** — Colors, fonts, images

### Prebuilt Themes
Available in Customer Service, Partner Central, Customer Account Portal, and Build Your Own (Aura) templates. Each prebuilt theme has multiple layouts.

### Change a Theme
Experience Builder → Settings → **Theme** → Change Theme

**Warning:** Reset and "Replace and start fresh" permanently delete:
- Branding sets
- Theme regions
- Theme settings
- Custom theme layouts and assignments
- Custom CSS overrides

### Branding Sets
Bundled collections of colors, fonts, and images. Can be applied on an audience basis for targeted branding.

**Note:** Branding sets do NOT affect header and hero areas in prebuilt themes.

### Custom CSS
- Add custom CSS in Experience Builder → Settings → **Advanced** → Edit Head Markup
- LWR: CSS Class property per component; no dedicated site-level CSS editor
- LWR static resource stylesheet (if CSS is in a zip archive):
  ```html
  <link type="text/css" rel="stylesheet" href="{ basePath }/resource/<apiName>/<stylesheetFileName>.css?{ versionKey }" />
  ```
- LWR static resource stylesheet (if CSS is a single file):
  ```html
  <link type="text/css" rel="stylesheet" href="{ basePath }/resource/<apiName>?{ versionKey }" />
  ```

---

## Navigation Menu

Configure in Experience Builder → Settings → **Navigation**.

Menu item types:
- **External URL** — Link to any URL
- **Menu Label** — Non-clickable label (group header)
- **Salesforce Object** — List view of a Salesforce object
- **Site Page** — Link to an internal Experience Builder page

> **LWR Note:** We recommend against using custom CSS with the Navigation Menu component, as it can cause CSS failures. Use the supported branding tokens instead.

**Navigation menu and deployments:**
- Deploying with additional menu items **deletes all translations** applied to existing items in the target environment
- Custom list views for standard objects are NOT included as dependencies in change sets

---

## Multilingual Sites

### Aura Sites
1. Experience Builder → Settings → **Languages** → Add languages
2. Create page variations for each language
3. Translate navigation menu items
4. URL construct uses query parameter: `?language=fr`

### LWR Sites
- Language URL is a path, not a query parameter: `/fr/page-name`
- Use `Create a Multilingual LWR Site` guide for setup
- Language selector component available in LWR for user language switching

---

## SEO Configuration

### Quick Steps
1. Identify your **Preferred Domain** before going public (Settings → General → Preferred Domain)
2. Make the site **public** (enables SEO settings tab in Experience Builder)
3. Set **SEO page properties** (title, description, noindex) for individual pages
4. Optionally, create a custom `robots.txt` file
5. Make objects and fields readable for the guest user profile (for object pages to be indexed)
6. Optionally, enable **GEO** (Generative Engine Optimization) for AI-powered search engines
7. **Activate** and **Publish** the site
8. Generate a manual **sitemap refresh** if needed

### Sitemap
- Automatically generated every Sunday; partial refresh every 24 hours
- Available only in production orgs (not sandbox, not Developer Edition)
- Location: `https://<site_URL>/s/sitemap.xml` (Aura) or `https://<site_URL>/sitemap.xml` (LWR)
- Knowledge articles appear in sitemap only if they have at least one topic assigned

### robots.txt
- Automatically generated; allows all crawlers by default
- Unique per domain (sites sharing a domain share a robots.txt)
- Location: `https://<site_URL>/robots.txt`

### Content Snapshots
- Salesforce takes snapshots for search engine crawlers (dynamic rendering)
- Manual snapshots: once every 24 hours via SEO settings tab
- Enables GEO: AI bots can request content snapshots for AI-powered search

### Preferred Domain
- Must be HTTPS
- If multiple domains exist without a preferred domain set, the site's first custom domain alphabetically becomes the preferred domain
- Do NOT set preferred domains on two LWR/Aura sites that use the same custom domain with different path prefixes

---

## Google Analytics Integration

1. In Experience Builder, go to **Settings** → **Google Analytics**
2. Enter your Google Analytics tracking ID (UA-XXXXXX or G-XXXXXX)
3. Automatically allowlisted domains:
   - `https://www.google-analytics.com`
   - `https://stats.g.doubleclick.net`
   - `https://www.googletagmanager.com/gtag/js`
4. Additional domains from your GA configuration may need manual allowlisting

**Migrating from Aura to LWR:** If LWR site uses the Aura site's domain, you can use the same GA ID.

---

## Performance Optimization

Key tools for high-traffic sites:

| Tool | Purpose |
|------|---------|
| **Progressive Rendering** | Prioritize component display order; show critical components first |
| **Browser Caching** | Cache static assets in user browsers |
| **Apex Caching on Salesforce CDN** | Cache Apex responses on CDN |
| **High-Volume Self-Registration** | Micro-batching for sites with high registration volume |
| **Micro-Batching (Experience Builder)** | Configure batch size for high-volume record creation |

**Evaluate your site if:**
- You expect a large number of users
- You expect high traffic or transactions
- Your site requires many roles
- You're customizing the standard Salesforce experience
- You're using additional services at scale

---

## Flow Component in Experience Builder

### Aura Sites
- Drag the **Flow** component onto a page
- Select an active screen flow
- Configure input variable prefill

### LWR Sites
- Use the **Flow** component (available in standard LWR components)
- Flows using **Aura components are NOT supported** in LWR
- For guest user access, enable **Allow Guest Users to Access Flows** in the flow properties (accessible from the flow's settings in Experience Builder)

---

## Aura to LWR Migration Considerations

Key planning items when migrating:
1. **Custom Aura components** → Must be replaced with LWCs
2. **CSS** → Aura CSS overrides don't apply to LWR markup; rewrite CSS
3. **URL structure** → Aura uses `/s/` prefix; LWR uses root path; set up redirects
4. **Topics** → In LWR, replace Chatter topics with custom objects (`Topic__c`, `Topic_Assignment__c`)
5. **Navigation** → Use same base URLs in LWR as Aura for easier redirect setup
6. **CMS** → No CMS components in LWR; use data binding
7. **Multilingual** → Language URL is now a path (not a query parameter)
8. **Visualforce pages** → URL structure changes in LWR (served at different path)
9. **Guest user** → New guest user profile created; copy permissions and sharing rules from Aura site guest user
10. **Mobile Publisher** → LWR support is beta

Required redirects:
- `/s` → `/` (home page)
- `/s/sitemap.xml` → `/sitemap.xml`
- `/s/(customPage)` → `/(customPage)` (all pages)
- `/s/article/(alias)` → `/article/(alias)` (knowledge articles)
