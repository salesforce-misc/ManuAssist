# Experience Cloud — Deployment and SEO

---

## Deployment Overview

Always build and test in sandbox before deploying to production. Two deployment mechanisms:

| Method | Best For | Skill Level |
|--------|----------|-------------|
| **Change Sets** | Point-and-click teams; standard ALM | Admin/no-code |
| **Metadata API / Salesforce CLI** | Complex changes; version control; multiple work streams | Developer |

> **Lightning Bolt Solutions** are NOT for deploying Experience Cloud sites between orgs. Use them for sharing/selling on AppExchange or implementing a site with a turnkey solution.

---

## Required Metadata Types by Site Type

| Metadata Type | Enhanced LWR | LWR | Aura | Visualforce |
|---------------|--------------|-----|------|-------------|
| **Network** | ✅ | ✅ | ✅ | ✅ |
| **CustomSite** | ✅ | ✅ | ✅ | ✅ |
| **DigitalExperienceBundle** | ✅ | | | |
| **DigitalExperienceConfig** | ✅ | | | |
| **ExperienceBundle** | | ✅ | ✅ (recommended over SiteDotCom) | |
| **SiteDotCom** | | | ❌ (use ExperienceBundle) | ✅ |

**What each type represents:**
- **Network** — Site administration settings: page overrides, email templates, membership
- **CustomSite** — Domain and page settings: indexPage, siteAdmin, URL definitions
- **ExperienceBundle** — Site pages, components, themes, and settings (text-based, human-readable)
- **DigitalExperienceBundle + DigitalExperienceConfig** — Enhanced LWR version of ExperienceBundle; supports partial deployment

---

## Deploy with Change Sets

### Full Site Deployment

1. In sandbox: Setup → **Outbound Change Sets** → New change set
2. Add component: type = **Network**, select your site
3. Click **View/Add Dependencies** → Select all dependencies
4. **Upload** to target org (production)
5. In production: Setup → **Inbound Change Sets** → Validate → Deploy

> **Warning:** Deploying an inbound change set **overwrites** the target site.

### Partial Site Deployment (Enhanced LWR Only)

Available for enhanced LWR sites (Winter '23+) only.

1. In sandbox: Setup → **Outbound Change Sets** → New change set
2. Add component: type = **Digital Experience**, select individual components
3. Component name format: `sfdc_cms__<contentType>/<contentName>` (e.g., `sfdc_cms__brandingSet/Build_Your_Own_LWR`)
4. Upload to target org → Validate → Deploy

> **Note:** Deploying a Digital Experience component also adds all its variations (e.g., all language translations of a view).

### Change Set Requirements and Gotchas

**You must manually add:**
- New or modified profiles/permission sets referenced in Administration → Members
- Navigation menus (not automatically included as dependencies)
- Custom list views for standard objects (not included as dependencies)

**What change sets cannot handle (configure manually in target):**
- Navigational and featured topics
- Audience targeting
- Dashboards and engagement metrics
- Recommendation images
- Branding panel images in Experience Builder
- Administration settings: Account field in Registration, Login options display, Rich Publisher Apps settings

**Additional rules:**
- Change sets can't deploy to a target org on an earlier API version
- Deploying with additional navigation menu items deletes existing translation for that menu
- Changing the site template in source must be done in target before deploying
- For sites created in sandbox before Summer '17: resave administration settings before migration

---

## Deploy with Metadata API / Salesforce CLI

### Retrieve an Experience Cloud Site

```xml
<!-- package.xml for an Aura or LWR site -->
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types><members>*</members><name>Network</name></types>
    <types><members>*</members><name>CustomSite</name></types>
    <types><members>*</members><name>ExperienceBundle</name></types>
    <types><members>*</members><name>CustomTab</name></types>
    <types><members>*</members><name>CustomObject</name></types>
    <types><members>*</members><name>ApexClass</name></types>
    <types><members>*</members><name>Profile</name></types>
    <version>46.0</version>
</Package>
```

For enhanced LWR sites, replace `ExperienceBundle` with `DigitalExperienceBundle` and add `DigitalExperienceConfig`.

### Key Deployment Tips

- Before migrating, **enable digital experiences in the destination org** and use the same domain name as the sandbox to avoid errors
- Network component name = site name; if site name changes in sandbox, API tries to create a new site (not update existing)
- Include guest user profile changes in the migration
- When migrating user profiles, welcome emails are sent to members in the production org
- Ensure `NavigationMenu` developer name matches in source and target
- When deploying with `ExperienceBundle`, ensure `SiteDotCom` is NOT in the manifest (they conflict)
- Deploy `Network` and `Profile` components in separate unlocked packages (cannot be in the same package)
- Do NOT deploy to a target org on an earlier API version

### Common Deployment Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Duplicate component IDs in DigitalExperienceBundle | Two components in a view have the same ID | Retrieve from both orgs; find matching IDs; alter a few characters to make unique |
| `devName` of existing route can't be changed | Route's API name was altered in ExperienceBundle | Revert devName to original value, or use SiteDotCom instead |
| `We couldn't validate property in file.json` | Source/target site configurations don't match | Ensure source and target sites use same configuration (theme names, component names) |
| `isLockerServiceEnabled` property missing | Missing from config/mainAppPage.json | Add `"isRelaxedCSPLevel" : false` to the config file |
| Route type error | Discrepancy between enabled features/permissions in source vs target | Enable the relevant permission in source, re-retrieve, redeploy |

---

## SEO for Experience Builder Sites

### Prerequisites
- Site must be **public** (guest access enabled)
- Must be a **production org** (SEO not supported on sandbox or Developer Edition)
- Supported: Enterprise, Performance, and Unlimited Editions

### SEO Setup Workflow

1. **Identify preferred domain** (before going public)
   - Experience Builder → Settings → General → **Preferred Domain**
   - Must be HTTPS
   - If not set, the site's first alphabetical custom domain is used
   - Two sites on the same domain with different path prefixes should both set Preferred Domain to None

2. **Make the site public**
   - Experience Builder → Settings → General → Check "Public can access the site"
   - Or enable guest access at the page level for specific pages

3. **Set SEO page properties**
   - Experience Builder → Pages icon → Select page → Properties panel
   - Configure: Title, Description, `noindex` flag

4. **Create a custom robots.txt (optional)**
   - Experience Builder → SEO settings → Custom robots.txt
   - Controls which areas crawlers can access
   - Default robots.txt allows all crawlers

5. **Make objects available for SEO**
   - Experience Builder → SEO settings → Search Engine Indexing
   - Select objects and fields to make readable by crawlers
   - Exposed through guest user profile read access

6. **Enable GEO (Generative Engine Optimization) (optional)**
   - Allows AI bots (like Googlebot for AI answers) to request content snapshots
   - Experience Builder → SEO → Enable GEO

7. **Activate and Publish the site**

8. **Generate manual sitemap refresh (if needed)**
   - Experience Builder → SEO settings → Generate Sitemap
   - Once per 24 hours maximum
   - Auto-refresh: every Sunday; partial refresh every 24 hours

9. **Provide content snapshots (if needed)**
   - For time-sensitive content (e.g., flash sale prices), take a manual snapshot
   - Once per 24 hours

### Sitemap Details
- Location: `https://<site_URL>/s/sitemap.xml` (Aura) or `https://<site_URL>/sitemap.xml` (LWR)
- Contains: public pages + objects/fields with guest user read access
- Knowledge articles: only appear if at least one topic is assigned to the article
- Multi-language sites: sitemap includes an entry per supported language
- If the user who last published the site has their account deactivated, automatic sitemap refresh stops — reassign the scheduled jobs

---

## Network Metadata Type Sample

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Network xmlns="http://soap.sforce.com/2006/04/metadata">
    <allowInternalUserLogin>true</allowInternalUserLogin>
    <allowMembersToFlag>true</allowMembersToFlag>
    <allowedExtensions>txt,png,jpg,jpeg,pdf,doc,csv</allowedExtensions>
    <caseCommentEmailTemplate>unfiled$public/ContactFollowUpSAMPLE</caseCommentEmailTemplate>
    <changePasswordTemplate>unfiled$public/CommunityChangePasswordEmailTemplate</changePasswordTemplate>
    <enableDirectMessages>true</enableDirectMessages>
    <enableGuestChatter>true</enableGuestChatter>
    <enableNicknameDisplay>true</enableNicknameDisplay>
    <enableReputation>true</enableReputation>
    <forgotPasswordTemplate>unfiled$public/CommunityForgotPasswordEmailTemplate</forgotPasswordTemplate>
    <maxFileSizeKb>51200</maxFileSizeKb>
    <networkMemberGroups>
        <permissionSet>MyCommunity_Permissions</permissionSet>
        <profile>Admin</profile>
    </networkMemberGroups>
    <networkPageOverrides>
        <changePasswordPageOverrideSetting>VisualForce</changePasswordPageOverrideSetting>
        <forgotPasswordPageOverrideSetting>Designer</forgotPasswordPageOverrideSetting>
        <homePageOverrideSetting>Designer</homePageOverrideSetting>
        <loginPageOverrideSetting>Designer</loginPageOverrideSetting>
    </networkPageOverrides>
    <picassoSite>MyCommunity1</picassoSite>
    <selfRegistration>true</selfRegistration>
    <sendWelcomeEmail>true</sendWelcomeEmail>
    <site>MyCommunity</site>
    <status>Live</status>
    <urlPathPrefix>mycommunity</urlPathPrefix>
    <welcomeTemplate>unfiled$public/CommunityWelcomeEmailTemplate</welcomeTemplate>
</Network>
```

**Critical fields:**
- `picassoSite` + `site` — Must match between source and target if site is renamed; update both when renaming
- `status` — `Live`, `UnderConstruction`, or `DownForMaintenance`
- `urlPathPrefix` — URL path after the domain

---

## Deploying Profiles

When deploying an Experience Cloud site:
- Include the **guest user profile** if there are any guest user permission changes
- When profiles are deployed, users are added to the site and welcome emails are sent
- Deploy Network and Profile components in **separate unlocked packages**

---

## ExperienceBundle API Version Upgrades

If upgrading ExperienceBundle metadata from an earlier API version to a later one (e.g., 48.0 → 49.0):

1. Set API version in package.xml to **48.0** and deploy
2. Set API version in package.xml to **49.0**
3. Retrieve the package to get the latest ExperienceBundle updates

ExperienceBundle does NOT support cross-version retrieve/deploy directly.
