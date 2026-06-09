# Experience Cloud — Users, Security, and Access

---

## User Types and Licenses

### Guest Users (Unauthenticated)
- Access the site without logging in
- Always use the **guest user profile** for permissions
- Can view public pages, CMS content, and knowledge articles (if sharing is configured)
- **Cannot** use Saved Sessions (OmniScriptSavedSession) — security policy
- Cannot own records by default; records created by guest users are assigned to a default owner
- Guest user sharing rules required to provide access to specific records
- Enable **Allow guest users to access public APIs** in Workspaces → Administration → Preferences for LWR CMS collections

### External Users (Authenticated)
- Log in with Experience Cloud credentials
- Governed by Experience Cloud licenses (Customer Community, Customer Community Plus, Partner Community, etc.)
- Profiles and permission sets control data and feature access
- Added to a site via Workspaces → Administration → Members

### Internal Users
- Full Salesforce license holders (org employees)
- Added to a site as members to gain site-specific roles and contributor access
- Experience Cloud site managers must be internal users

---

## Profiles and Permission Sets for External Users

### Key Setup Steps

1. **Clone a default profile** (Salesforce best practice — do not use default profiles directly)
   - Example: Clone "Customer Community User" → "Acme Customer Community User"
2. **Add the required permissions** to the cloned profile
3. **Assign the profile to new or existing contacts** to create Experience Cloud users
4. **Add the profile to the site's member list** (Workspaces → Administration → Members)

### Permission Set Approach
- Use permission sets (in addition to profiles) to grant specific feature access
- Assign permission sets to site members for granular control

---

## Guest User Profile Permissions

The guest user profile is automatically created for each site. Configure it carefully.

**To access the guest user profile:**
1. Setup → Digital Experiences → All Sites → **Workspaces** → Administration → Pages → **Go to Force.com**
2. Or: Setup → Sites → click the site → Guest User Profile link

**What to configure:**
- Object permissions (Read access only — guest users should generally have read access, not write)
- Field-level security (visible fields for guest users)
- Sharing sets and sharing rules to expose records
- Enabled Apex classes and Visualforce pages (if using custom code)

**Creating records as guest users:**
- Enable "Assign new records created by guest users to the default owner" in Digital Experiences Settings
- Write Apex triggers or custom validation for guest-created records (form validation doesn't run before queuing for guest users in Contact Support component)

---

## Data Access Patterns for External Users

### Organization-Wide Defaults (OWD)
- External users use a separate external OWD setting (not the same as internal)
- Default external access for contacts: set to **Private** to prevent cross-account contact visibility

### Sharing Sets
A sharing set grants external users access to records that have a lookup relationship to their account or contact.

**Configuration:**
1. Setup → Digital Experiences → Settings → **Create a sharing set**
2. Define the sharing set: select a license, choose objects, map the access path (lookup from object to Account/Contact on the user)
3. Save

### Sharing Rules
- Standard criteria-based and owner-based sharing rules apply
- **Guest user sharing rules** — must explicitly create sharing rules for guest users to access specific records
- Criteria-based sharing rules recommended for guest users (based on record field values)

### Partner Super User Access
- Partner Community users with super user access can see data owned by users with the same role or a role below them
- Applies only to: Cases, Leads, Custom Objects, Opportunities
- Enable in Digital Experiences Settings → Role and User Settings

---

## Clickjack Protection

Clickjacking tricks users into clicking hidden elements. Configure protection levels in Experience Builder:

| Level | Description | Impact |
|-------|-------------|--------|
| **Allow framing by any page (no protection)** | No restrictions | Any domain can frame your site |
| **Allow framing of site pages on external domains (good protection)** | Trusted external domains only | Specify trusted domains |
| **Allow framing by the same origin only (recommended)** | Default level; same protocol and domain | Most use cases covered |
| **Don't allow framing by any page (most protection)** | No framing allowed | **WARNING:** Breaks Administration pages in Experience Workspaces |

**Enable for Experience Builder sites:**
Experience Builder → Settings → **Security & Privacy** → Clickjack Protection Level

**Trusted Domains:**
- Experience Builder sites: up to **100** trusted domains per site
- Visualforce sites: up to **512** trusted domains per site

---

## CSP (Content Security Policy) and Lightning Locker

### Security Levels

| Level | Description | Default? |
|-------|-------------|---------|
| **Strict CSP** | Blocks all inline scripts; blocks remote JavaScript unless allowlisted; Lightning Locker ON by default (can be turned off) | Default for new sites (Spring '19+) |
| **Relaxed CSP** | Allows inline scripts; allows remote JavaScript if allowlisted; Lightning Locker ON by default (can be turned off) | Not default; choose for Google Tag Manager etc. |
| **Allow inline scripts and any third-party host** | No security added; Lightning Locker ON (cannot be disabled) | Legacy only; being removed Spring '22 |

**Configure:** Experience Builder → Settings → **Security & Privacy** → Script Security Level

### Strict CSP Impacts
- Blocks all inline `<script>` elements and inline event handlers
- Blocks all remote JavaScript files unless explicitly allowlisted
- Blocks non-script remote resources (images, fonts, stylesheets) unless allowlisted
- **Recommendation:** Upload JavaScript libraries as Salesforce static resources; reference via relative URL

### Lightning Locker
- Isolates third-party components and custom code by namespace
- Prevents cross-namespace DOM access
- Enforces supported API usage only
- **Default:** ON for all sites (can be turned off with Strict or Relaxed CSP)
- **Turning it off:** Can cause security flaws and prevent Aura components from rendering at design time

### Allowlisting Third-Party Hosts

| Resource Type | Where to Allowlist |
|--------------|-------------------|
| Non-script resources (images, fonts, stylesheets, media) | Setup → Trusted URLs (applies to all Experience Builder sites) |
| Script resources (JavaScript) | Experience Builder → Settings → Security & Privacy → Trusted Sites for Scripts (per-site) |

**Auto-allowlisted:**
- All Salesforce-hosted data and files
- Google Analytics required domains (when GA ID is added)
- YouTube and Vimeo image/frame URLs for Rich Content Editor video

---

## Authentication Options

### Default Authentication
- External users log in with Salesforce-assigned username and password
- Internal users use their Salesforce org credentials

### SAML Single Sign-On (SSO)

**Hub-and-spoke architecture:**
- Identity Provider (IdP) at the center authenticates users
- Service Providers (SPs) = orgs or sites that rely on the IdP

**Configure SAML SSO between Salesforce orgs/sites:**
1. Enable Identity Provider in the IdP org (Setup → Identity Provider → Enable)
2. Download the IdP certificate
3. In each service provider, set up SAML SSO settings using IdP metadata URL or XML file
4. Set Identity Type = "Assertion contains the Federation ID from the User object"
5. Create a Connected App in the IdP for each service provider
6. Map Federation ID between test users in IdP and SP
7. Test with an incognito browser

**SAML login endpoint for sites:** Use the site's Login URL (not the org's Login URL) under "For Communities" in SSO settings.

### Authentication Providers (OAuth SSO)

Users log in with third-party credentials (Google, Facebook, LinkedIn, custom OAuth 2.0):
1. Setup → Auth. Providers → New
2. Select provider type (Salesforce, Open ID Connect, custom)
3. Configure app credentials from the third-party
4. Add the auth provider to the site's login page in My Domain settings

### Login Discovery Page
- Dynamically routes users to appropriate authentication method based on their identifier
- Enable in Workspaces → Administration → Login & Registration
- Customize the Apex controller to control discovery logic

---

## Encrypt Experience Cloud Site Data

- Salesforce Shield Platform Encryption applies to Experience Cloud sites
- Encrypted fields maintain functionality but display differently in some contexts:
  - If **Account Name** is encrypted: user role names show the account ID instead of the account name (e.g., "001D000000IRt53 Customer User" instead of "Acme Customer User")
- Data encryption does not affect the user experience
- Classic Encryption still masks data in encrypted custom fields

---

## Visualforce Pages Security

When you create an Experience Cloud site, Salesforce automatically creates default Visualforce pages (SiteLogin, SiteRegister, ForgotPassword, etc.) that are **publicly accessible by default**.

**Check which pages are exposed:**
Append `/SiteLogin` (without `/s`) to your Experience Cloud site URL and verify what appears.

**Publicly exposed by default:**
`BandwidthExceeded`, `CommunitiesLanding`, `CommunitiesLogin`, `CommunitiesSelfReg`, `CommunitiesSelfRegConfirm`, `CommunitiesTemplate`, `Exception`, `FileNotFound`, `ForgotPassword`, `ForgotPasswordConfirm`, `InMaintenance`, `SiteLogin`, `SiteRegister`, `SiteRegisterConfirm`, `UnderConstruction`

**Review and secure:**
Workspaces → Administration → Pages → Go to Force.com → Edit the Site Visualforce Pages section

**Rule:** If you're using Experience Builder pages for login and registration, do NOT expose `SiteLogin`, `ForgotPassword`, `SiteRegister`, or `CommunitiesSelfReg` publicly.

---

## Role-Based Access Summary

### Site Contributor Roles (Builder/Workspaces)

| Role | Build | Publish | Manage Contributors |
|------|-------|---------|---------------------|
| Experience admin | ✅ | ✅ | ✅ |
| Publisher | ✅ | ✅ | ❌ |
| Builder | ✅ | ❌ | ❌ |
| Viewer | Read-only | ❌ | ❌ |

### Site Manager vs Moderator vs Admin

| Role | Primary Focus |
|------|--------------|
| **Site Manager** | Engagement: welcomes members, monitors adoption, sets up reputation/gamification |
| **Site Moderator** | Content: reviews flagged posts, removes inappropriate content, enforces community standards |
| **Site Admin** | Analytics: ROI, KPI, reporting, site health; manages setup and configuration |

**Assign site manager:** Requires "Manage Experiences" permission. Must be an internal user and site member.

---

## Gamification

### Reputation
- Point system rewarding members for activity (posting, commenting, liking, etc.)
- Enable: Workspaces → Administration → Preferences → Enable Reputation
- Configure point levels and thresholds in Workspaces → Gamification → Reputation
- Members see reputation on their profile; progress triggers level changes

### Recognition Badges
- Visual badges assigned to members for achievements
- Enable: Workspaces → Gamification → Recognition Badges
- Configure who can create badges, who can assign badges
- Requires WDC (Work.com) Thanks to be enabled (Aura sites only; not in Lightning Experience)
- Display badges on member profiles using the Recognition Badges component

---

## Moderation

### Moderation Tools
- **Flagging** — Members flag posts, comments, files as inappropriate
- **Moderation Rules** — Auto-moderate content matching criteria (keywords, links, etc.)
- **Review Queue** — Moderators review flagged items in Experience Workspaces → Moderation

### Moderation Settings
- "Moderation applies to all feed posts regardless of where they are visible" — applies to cross-site visible posts
- "Moderation rules can be configured for internal users' feed posts on records" — extends moderation to internal user posts

### Apex Triggers for Moderation
Custom Apex triggers can automate moderation actions (auto-remove, auto-escalate) based on flagged content.
