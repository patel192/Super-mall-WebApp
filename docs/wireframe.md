1. Purpose of Wireframe Document

This document defines the visual structure and layout planning of the SuperMall Web Application before implementation. It describes:

Screen layouts

UI components

Navigation flow

User interaction areas

It ensures that:

UI is consistent

Requirements are traceable to screens

Reviewers understand the system visually

2. Project Overview (UI Perspective)

SuperMall is a multi-role web platform with three interfaces:

User Panel (customers)

Merchant/Admin Panel (shop owners)

Super Admin Panel (platform controller)

Each panel has its own navigation and workflows.

3. Global UI Structure
Common UI Elements Across Pages

Top Navigation Bar

Sidebar (for dashboards)

Page Header

Content Sections

Footer

Notification Bell

Authentication Guard

4. Public Pages Wireframes
4.1 Landing Page (/index.html)
------------------------------------------------------
| LOGO | Home | Categories | Offers | Login | Signup |
------------------------------------------------------
|                                                      |
|   HERO SECTION                                        |
|   "Discover Shops & Best Deals"                        |
|   [Browse Shops]   [Explore Offers]                   |
|                                                      |
------------------------------------------------------
| Categories Section (Cards Grid)                       |
| [Fashion] [Electronics] [Food] [Books]                |
------------------------------------------------------
| Featured Offers Section                               |
| [Offer Card] [Offer Card] [Offer Card]                |
------------------------------------------------------
| Footer                                                |
------------------------------------------------------


Purpose:

Introduce platform

Allow user entry

SEO visibility

4.2 Login Page (/auth.html)
----------------------------------------
|              LOGIN FORM              |
| Email input                          |
| Password input                       |
| [Login Button]                       |
| Forgot password link                 |
----------------------------------------

5. User Panel Wireframes
5.1 User Dashboard (/user/User-Dashboard.html)
-------------------------------------------------
| Navbar: Logo | Shops | Offers | Profile | Bell |
-------------------------------------------------
| Welcome Message                                  |
-------------------------------------------------
| Quick Actions:                                    |
| [Browse Shops] [View Offers] [Compare Products]   |
-------------------------------------------------
| Recent Offers / Trending Products                |
-------------------------------------------------

5.2 Shops Listing (/user/Shops.html)
-----------------------------------------
| Shops Page                             |
-----------------------------------------
| Search Bar                             |
| Filter by Category                     |
-----------------------------------------
| [Shop Card]  [Shop Card]  [Shop Card]   |
| [Shop Card]  [Shop Card]  [Shop Card]   |
-----------------------------------------

5.3 Shop Details (/user/Shop-Details.html)
----------------------------------------
| Shop Name                             |
| Description                           |
| Location                              |
----------------------------------------
| Products Section                      |
| [Product Card] [Product Card]         |
----------------------------------------
| Offers Section                        |
| [Offer Card] [Offer Card]             |
----------------------------------------

5.4 Products Page (/user/Products.html)
-----------------------------------------
| Products Page                          |
-----------------------------------------
| Filters: Category | Price Range        |
-----------------------------------------
| [Product Card]  [Product Card]         |
| [Product Card]  [Product Card]         |
-----------------------------------------

5.5 Product Details (/user/Product-Details.html)
----------------------------------------
| Product Image                         |
| Product Name                          |
| Price                                 |
| Description                           |
----------------------------------------
| [Compare] Button                      |
----------------------------------------

5.6 Compare Products (/user/Compare.html)
------------------------------------------------
| Compare Two Products                          |
------------------------------------------------
| Product A         | Product B                 |
| Price             | Price                     |
| Category          | Category                  |
| Rating            | Rating                    |
------------------------------------------------
| Result: Best Choice Highlighted               |
------------------------------------------------

5.7 Categories Page (/user/Categories.html)
-----------------------------------------
| Categories Page                        |
-----------------------------------------
| [Category Card] [Category Card]        |
| [Category Card] [Category Card]        |
-----------------------------------------

6. Merchant (Admin) Panel Wireframes
6.1 Admin Dashboard (/admin/Admin-Dashboard.html)
------------------------------------------------------
| Sidebar | Dashboard | Products | Offers | Profile   |
------------------------------------------------------
| KPI Cards:                                           |
| Total Products | Total Offers | Views | CTR         |
------------------------------------------------------
| Charts: Product Trend / Offer Trend                  |
------------------------------------------------------
| Top Performing Products Table                       |
------------------------------------------------------

6.2 Products Management (/admin/Products.html)
----------------------------------------------
| Products Management                         |
----------------------------------------------
| [Add Product Button]                         |
----------------------------------------------
| Product Table:                               |
| Image | Name | Price | Views | Clicks | Edit |
----------------------------------------------

6.3 Offers Management (/admin/Offers.html)
---------------------------------------------
| Offers Management                          |
---------------------------------------------
| [Create Offer Button]                       |
---------------------------------------------
| Offers Table                                |
---------------------------------------------

7. Super Admin Panel Wireframes
7.1 Super Admin Dashboard
---------------------------------------------
| Sidebar | Dashboard | Floors | Approvals    |
---------------------------------------------
| Platform Overview KPIs                     |
---------------------------------------------

7.2 Floors Management (/super-admin/Floors.html)
----------------------------------------
| Floors Management                     |
----------------------------------------
| Add Floor Form                         |
----------------------------------------
| Floors Table                           |
----------------------------------------

7.3 Merchant Approvals (/super-admin/Merchant-Approvals.html)
----------------------------------------
| Pending Merchant Requests             |
----------------------------------------
| User | Shop | Approve | Reject         |
----------------------------------------

8. Navigation Flow Summary
Landing → Login → Role Check
       → User Dashboard
       → Admin Dashboard
       → Super Admin Dashboard

User Flow:
Dashboard → Shops → Shop Details → Products → Compare

Admin Flow:
Dashboard → Products → Offers → Analytics

Super Admin Flow:
Dashboard → Floors → Merchant Approvals

9. Tools Used

Wireframes derived from:

Live deployed UI

HTML layout structure

Navigation structure

Tailwind UI components

Functional JS flow

10. Conclusion

This wireframe document accurately reflects the implemented UI of the SuperMall Web Application. It supports future:

UI improvements

Feature extension

Team collaboration

Documentation review