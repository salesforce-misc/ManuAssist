# Experience Cloud — Limits and Gotchas

---

## Hard Limits

| Limit | Value |
|-------|-------|
| Max Experience Cloud sites per org (active + preview; archived don't count) | 100 |
| LWR site max routes | 500 (keep below 250 for best performance) |
| Trusted domains for inline framing — Experience Builder sites | 100 per site |
| Trusted domains for inline framing — Salesforce Tabs + Visualforce | 512 per site |
| Max file download size | 2 GB |
| Max API calls per day — Customer Community (member license) | 0 |
| Max API calls per day — Customer Community Plus (member license) | 200 per member |
| Max API calls per day — Partner Community (member license) | 200 per member |
| Max API calls per day — Customer Community Plus (login license) | 10 per member |
| Max API calls per day — Partner Community (login license) | 10 per member |

**Page View Allocations:**

| Edition | Max Sites | Max Page Views/Month |
|---------|-----------|---------------------|
| Enterprise | 100 | 500,000 |
| Unlimited / Performance | 100 | 1,000,000 |

**Bandwidth Allocations (per rolling 24-hour period, guest users only):**

| Edition | Production | Sandbox |
|---------|-----------|---------|
| Enterprise | 40 GB | 1 GB |
| Unlimited / Performance | 40 GB | 1 GB |
| Developer | 500 MB | N/A |

---

## Critical Irreversible Actions

| Action | Consequence |
|--------|-------------|
| **Enable Digital Experiences** | Cannot be disabled once enabled |
| **Enable Account Relationships** | Cannot be disabled once enabled |
| **Enable External Account Hierarchy** | Cannot be disabled once enabled |
| **Deploy an inbound change set** | Overwrites the Experience Cloud site in the target org |
| **Reset theme or "Replace and start fresh"** | Permanently deletes branding sets, theme regions, theme settings, custom theme layouts, and custom CSS |

---

## Deployment Gotchas

### Change Sets

1. **Profiles/permission sets referenced in Members are NOT automatic dependencies** — manually add them to the change set
2. **Custom list views for standard objects are NOT included as dependencies** — manually add them
3. **Deploying additional navigation menu items deletes translations** for existing menu items in the target environment
4. **Recommendation names** — updates to recommendation names aren't supported; if you rename a recommendation that was previously deployed, the target treats it as a new one
5. **Recommendation images** — not supported in change set deployments; must reconfigure manually
6. **Cannot deploy to an older API version** — source org must not be on a newer release than target
7. **Branding panel images** — not included; must manually reconfigure in target
8. **Administration settings NOT included:** Account field in Registration, Login options display, Settings area, Rich Publisher Apps
9. **Audience targeting** — not deployed; must reconfigure in target
10. **Partial deployment (Digital Experience type)** — available only for enhanced LWR sites (Winter '23+); target must have an existing site with the same name

### Metadata API

11. **Changing site name in sandbox** = API tries to create a new site (not update) when deploying — the URL path prefix is already taken and you'll get an error; the `picassoSite` and `site` attributes must match between source and target
12. **Network and Profile components** — must be deployed in **separate unlocked packages**
13. **NavigationLinkSet deprecated** in Winter '20 (API version 47.0); replaced by NavigationMenu
14. **ExperienceBundle and SiteDotCom conflict** — when deploying an Aura site with ExperienceBundle, ensure SiteDotCom is NOT in the manifest
15. **ExperienceBundle cannot be retrieved/deployed across different API versions** — upgrade must be done in two steps
16. **Component ID warnings** — Occasionally valid but worth verifying in target; invalid ID values from a different org context

---

## Framework Gotchas

### LWR Sites

17. **Max 500 routes** — More routes = worse performance; keep below 250; use dynamic record pages instead of individual pages per record
18. **Flows using Aura components are NOT supported** in LWR sites
19. **No CMS components** in LWR — use data binding instead
20. **No site-level CSS editor** — add CSS in head markup; use CSS class property per component
21. **Aura CSS overrides don't apply to LWR markup** — must rewrite CSS when migrating from Aura
22. **Language URL is a path, not a query parameter** (`/fr/page` not `?language=fr`) — breaks Aura-style language links when migrating
23. **Design tokens differ between LWR and Aura** — update tokens when migrating components

### Aura Sites

24. **Language selector not available in Partner Central** — cannot add a language selector to Partner Central
25. **Partner Central does not support default self-service features** (no topics, articles, search publisher out of the box)
26. **Partner Central cannot be exported as a Lightning Bolt solution** — can export individual pages, but not the entire site
27. **Topics in Aura** — When using Customer Service template with data categories, set data category visibility at the profile level for each category or articles won't appear

---

## Security Gotchas

28. **"Don't allow framing by any page" (most protection)** — Breaks Administration pages in Experience Workspaces for both Experience Builder and Salesforce Tabs + Visualforce sites. Use "Allow framing by the same origin only" (recommended) instead.

29. **Strict CSP is the default** for sites created in Spring '19 and later. Sites created before Spring '19 may use the legacy "Allow inline scripts and script access to any third-party host" setting — this was being removed in Spring '22.

30. **Lightning Locker is always ON** with "Allow inline scripts and any third-party host" security level and **cannot be disabled** for those sites.

31. **Turning off Lightning Locker** — Can prevent third-party Aura components from being available at design time and rendering at runtime; can cause security vulnerabilities. Disable only as a last resort.

32. **Encrypting the Account Name field** — Role names display account ID instead of account name (e.g., "001D000000IRt53 Customer User" instead of "Acme Customer User").

33. **Default Visualforce pages are publicly exposed** when a site is created (SiteLogin, SiteRegister, ForgotPassword, etc.). Review and restrict access to any pages not needed.

34. **Session cookies are set at the domain level** — Logging in as a different user during the same browser session replaces the existing session cookies, logging out the original user.

---

## SEO Gotchas

35. **SEO is NOT supported on sandbox or Developer Edition orgs** — test SEO configuration in production only.

36. **Making a site public before setting the preferred domain** — search engines may index `*.force.com` or `*.my.site.com` URLs, making them hard to remove from search results later.

37. **Multiple domains without a preferred domain** — the first custom domain alphabetically becomes the preferred domain; this can be unexpected.

38. **Two sites on the same custom domain with different path prefixes** — If preferred domains are set for both, site2 will use site1's preferred domain. Set Preferred Domain to None for both to avoid this.

39. **Knowledge articles in sitemap** — Articles only appear if they have at least one topic (navigational, featured, or content) assigned. Articles without topics are excluded from the sitemap.

40. **Sitemap scheduled jobs** — If the user who last published the site has their account deactivated, automatic sitemap refresh stops. Reassign the scheduled jobs to an active user.

41. **Snapshots are available in production only** — content snapshots for search engines don't work in sandbox.

---

## Guest User Gotchas

42. **Guest users cannot use Saved Sessions** (OmniScriptSavedSession) — security policy prevents guest users from owning records.

43. **Guest user case validation doesn't run before queue** — for Contact Support component submissions, validation runs only after the submission is queued, not at submission time. Write custom Apex `before insert` triggers to validate guest-created cases.

44. **Guest user profile permissions must be explicitly configured** — no permissions are granted by default. Use the guest user profile to control object, field, and page access.

45. **Opening an LWR site from Digital Experiences admin page** — You appear as an unauthenticated user; only data accessible to guest users is shown.

46. **Create New option for lookups** — NOT supported in Customer Service sites. Only authenticated external users (not guest users) can access asset lookup fields.

---

## Experience Builder Limitations

47. **Lookup fields** — Not supported for custom objects or in Experience Builder sites created before Spring '16.

48. **Opportunity products prompt** — Site users are NOT prompted to add products when saving an opportunity, even if "Prompt users to add products" is enabled. Only Tabs + Visualforce site users are prompted.

49. **Multilingual login pages** — Login pages appear in the default language in multilingual sites. Create custom Visualforce pages for login in other languages.

50. **Customer users cannot be added to account teams**.

51. **Default account teams** — Not available for Experience Cloud sites.

52. **Partner users cannot create account teams** or edit/delete members of an account shared with them by an internal user.

53. **Google reCAPTCHA** — Only works when Google web traffic is accessible. Consider requiring login to post if large segments of your users are blocked from Google traffic.

54. **Pinch-zoom on mobile preview** — Mobile users who pinch-zoom on Experience Cloud preview images zoom to center, not a specific area.

---

## Omnistudio on Experience Cloud (Specific Gotchas)

55. **Republish required after Flexcard change** — Every change to a Flexcard used on an LWR site requires a full Experience Site publish.

56. **Custom LWCs nested inside Flexcards on LWR sites** — Require a workaround: create a hidden page with the nested LWC components, or add them to the main page with an invisible condition (`User ID equals Invalid_User`).

57. **Style/Visibility tabs in LWR site builder** — Do NOT work with Omniscript elements embedded in Flexcards. Configure style within the Omnistudio designer.

58. **Omnistudio Runtime for Communities** — Required permission set for authenticated Experience Cloud users running Omniscripts/Flexcards.
