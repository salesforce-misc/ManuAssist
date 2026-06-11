# Experience Cloud — Setup and Configure

---

## Step 1: Enable Digital Experiences

**Required permission:** Customize Application

1. Setup → Quick Find → `Digital Experiences` → **Digital Experiences | Settings**
2. Select **Enable Digital Experiences**
3. Your digital experiences domain is shown: `MyDomainName.my.site.com` (production)
4. Click **Save**

> **Warning:** Enabling Digital Experiences is **irreversible**. It cannot be disabled.

**Post-enable access notes:**
- External user contact records become visible to all external users associated with the same account, unless the default external access for contacts is set to Private.
- In orgs created before February 8, 2024 (with digital experiences enabled before Winter '26 enforcement): records were automatically shared with portal subordinates — use the **Convert External User Access Wizard** to secure these.
- In all orgs created on or after February 8, 2024: access is secure by default.

---

## Step 2: Configure Digital Experiences Settings

Setup → Quick Find → `Digital Experiences` → **Digital Experiences | Settings**

**Experience Management Settings:**

| Setting | Description |
|---------|-------------|
| Enable Experience Workspaces | On by default; use Workspaces to manage sites |
| Assign new records created by guest users to the default owner | Assigns guest-created records to a default owner; if none chosen, defaults to site owner |
| Display warning for unsupported browsers | Prompts Aura site users to update browser; LWR shows warnings by default |
| Enable ExperienceBundle Metadata API | Enables text-based programmatic migration of Aura sites; LWR uses ExperienceBundle by default |

**Role and User Settings:**

| Setting | Description |
|---------|-------------|
| Number of customer roles | Up to 3; increasing later doesn't apply to existing customer accounts |
| Number of partner roles | Partner User, Partner Manager, Partner Executive; increasing later doesn't apply to existing partner accounts |
| Allow editing of Partner Account field on opportunities and leads | Lets partner users edit the Partner Account field |
| Enable Partner Super User Access | Lets partner users with super user access see data owned by users with the same role or below; applies only to cases, leads, custom objects, and opportunities |
| Enable report options for external users | Partner Community and Customer Community Plus users with "Run Reports" permission get report run options |
| Require unique usernames for partners in this org | Orgs created after Winter '19 enforce this automatically |
| Allow using standard external profiles for self-registration | Allows external users to self-register and log in with default external profiles (not best practice; Salesforce recommends cloning the profile) |

**New User Email Settings:**

| Setting | Description |
|---------|-------------|
| Link expires in [x] days | Sets activation email validity period |

**Irreversible settings:**
- Enable Account Relationships — cannot be disabled after enabling
- Enable External Account Hierarchy — cannot be disabled after enabling

---

## Step 3: Create a Site

Setup → Quick Find → `Digital Experiences` → **All Sites** → **New**

1. Select a template (see Templates section)
2. Enter a site name and URL path prefix
3. Click **Create** → Experience Builder opens

---

## Step 4: Configure a Custom Domain

To serve your site from a branded URL (e.g., `https://www.example.com`):
- Set up a custom domain in Setup → **Domains**
- Custom domains support many-to-many relationships with sites (multiple sites can share one domain)
- Salesforce recommends using a CDN (Content Delivery Network) when serving on a custom domain
- Professional Edition with Marketing Cloud Account Engagement (Pardot) must use the Salesforce CDN

---

## Experience Workspaces Setup

Access: Setup → Digital Experiences → All Sites → **Workspaces** link next to your site.

**Admin workspace preferences (Workspaces → Administration → Preferences):**

| Setting | Description |
|---------|-------------|
| Show nicknames instead of full names | Protects member identity; especially useful for public sites |
| Enable Chatter messages | Secure private conversations (authenticated users only) |
| Enable direct messages | Private conversations in Customer Service template sites |
| Optimize cached images for guest users | Faster image loading; requires Salesforce CDN for Digital Experiences |
| Let guest users view asset files and CMS content | Asset files = topic images, recognition badges, site branding; enable if public pages use CMS collections |
| Allow guest users to access public APIs | Required for guest users to view CMS collections on LWR public pages |
| Show all settings in Workspaces | Overrides dynamic navigation; shows all settings regardless of template |
| Allow members to flag posts/comments/files | Community moderation; members can flag inappropriate content |
| Enable Upvotes and Downvotes | Members can vote on questions and answers; on by default for sites created Winter '18+ |
| Enable Reputation | Point system for rewarding member activity |
| Enable knowledgeable people | Discover who's knowledgeable on topics; allow topic endorsements |
| Maximum file upload size (MB) | Set max file upload size |
| Allowed file types for upload | Restrict file types allowed for upload |

---

## Contributor Roles (Role-Based Access to Builder)

Assign roles so different team members have appropriate access to the site builder.

| Role | Capabilities |
|------|-------------|
| **Experience admin** | Full access: Builder, contributor management, publish |
| **Publisher** | Builder + publish; cannot manage contributors |
| **Builder** | Builder only; cannot publish or manage contributors |
| **Viewer** | Read-only Builder access; cannot build, revise, or publish |

**To add contributors:**
Workspaces → Administration → Contributors tab → **Add Contributors** → search, add, assign role → Finish

**Notes:**
- Admins cannot update their own contributor role
- Contributors cannot upload images to Tile Menu or export templates/pages/themes
- To modify inactive sites, the contributor needs "Modify All Data"
- To limit build/publish ability, ensure the user does NOT have the "Create and Set Up Experiences" permission

---

## Activate Your Site

1. In Experience Builder or Workspaces → Administration → Settings → change **Status** to **Active**
2. Or: All Sites list → **Activate** action

When you activate a site:
- External users can access the site
- Welcome emails are sent to members (if configured)
- Sitemap generation begins (production orgs only)

---

## Manage Site Emails and Notifications

Experience Cloud sends several types of emails:
- **Welcome email** — When a new user is added to a site
- **Email verification** — One-time password or email address verification
- **Forgot password** — Password reset instructions
- **Change password** — Confirmation after password change
- **User lockout** — Notification when account is locked
- **Device activation** — Notification for new device login

All email templates can be customized in Workspaces → Administration → Emails.

**Email merge fields** are available for Experience Cloud sites, including site URL, member name, and organization details.

> **Note:** "Welcome emails" are sent when a user is added to the site (membership). Configuring email templates requires the "Manage Experiences" permission.

---

## Configure Login, Self-Registration, and Password Pages

Access: Workspaces → Administration → **Login & Registration**

Options for each page type:
- **Default** — Standard Salesforce-generated page
- **Designer** — Page built in Experience Builder (recommended for most sites)
- **Visualforce** — Custom VF page

**Self-registration:**
- Enable self-registration to allow new users to create accounts
- Configure the self-registration Apex controller to control who can self-register and how accounts are created
- By default, self-registration creates contacts/person accounts

**Login Discovery page:**
- Dynamic login flow based on user identifier (email or username)
- Users are routed to the appropriate login method based on their identity

---

## Administer Site Members

Access: Workspaces → Administration → **Members**

- Add profiles and permission sets to the site to control who can log in
- Add both internal (Salesforce user) and external (community user) profiles
- Permission sets can also grant site membership

> **Important:** Profiles and permission sets referenced in Members must be manually added to change sets — they are NOT included as automatic dependencies.

---

## Enable Other Salesforce Features

### Salesforce Knowledge
- Workspaces → Administration → **Preferences** → Enable Knowledge in your site (or via Setup → Knowledge settings)
- For articles to appear in topics, assign navigational, featured, or content topics to the articles
- Set data category visibility at the profile level for each category

### Case Management
- Enable **Question-to-Case** to escalate unanswered community questions to cases
- Enable **Site Case Feed** for discussions over customer cases

### Flows in Experience Builder
- Add the **Flow** component to a page; point to an active screen flow
- LWR: flows using Aura components are NOT supported
- Guest users: enable "Allow Guest Users to Access Flows" in the flow properties

### Chatter and Collaboration
- Chatter features (groups, feeds, topics) available in Aura sites
- LWR sites use different components; no Chatter feed component in LWR

---

## Omni Interaction Configuration Notes (for Omnistudio on Experience Cloud)

When Omnistudio components (Omniscripts, Flexcards) are embedded in Experience Cloud sites:
- Authenticated users need the **Omnistudio Runtime for Communities** permission set
- Guest users need a custom permission set with Read-only Omnistudio object permissions + criteria-based sharing rules
- After any change to a Flexcard on an LWR site, the site must be **republished**
- Custom LWCs nested inside Flexcards require a workaround on LWR sites (hidden page with components, or invisible condition)

---

## Site Setup Checklist

- [ ] Enable Digital Experiences (irreversible)
- [ ] Configure org settings: roles, sharing, sharing sets
- [ ] Create site (choose framework and template)
- [ ] Configure custom domain (optional but recommended before going public)
- [ ] Add members (profiles and permission sets)
- [ ] Configure login, self-registration, and password pages
- [ ] Set up email templates for welcome, verification, password emails
- [ ] Configure Administration preferences
- [ ] Set up guest user profile permissions (if public access needed)
- [ ] Enable Knowledge, Cases, or other features as needed
- [ ] Design pages in Experience Builder
- [ ] Set up branding and theme
- [ ] Configure navigation menu
- [ ] Set up SEO (preferred domain, page titles, robots.txt)
- [ ] Test in sandbox before deploying to production
- [ ] Activate and publish
