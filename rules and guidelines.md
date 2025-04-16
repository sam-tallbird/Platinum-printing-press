
Area	Rule
Components	Must be reusable, modular, and placed in /components/
Pages	Contain layout and structure only — logic/UI in components
Routing	Use file-based routing with kebab-case file names
Typography	Use Tailwind’s text-base, text-lg, text-xl — max 3 sizes
Spacing	Use Tailwind spacing only (p-4, mt-8, etc.) — no inline padding
Language	Support for ar and en, with language switcher in Navbar
4️⃣ Pages & Content Rules
Each page must be structured for internationalization and layout consistency.

Required Pages:

File	Path	Language Routes	Description
index.jsx	/	/en, /ar	Home
about.jsx	/about	/en/about, etc.	About Us
services.jsx	/services	/en/services, etc.	Services
products.jsx	/products	/en/products, etc.	Products
contact.jsx	/contact	/en/contact, etc.	Contact Us
our-work.jsx	/our-work	/en/our-work, etc.	Our Work
Each Page Must Include:
<main> container

Translated <h1> using i18n key

Neutral placeholder paragraph (e.g., t('content.placeholder'))

Mobile-responsive padding

No logic or interactivity in MVP

5️⃣ Global UI Elements
🧭 Navbar
Must appear on all pages via _app.jsx

Includes:

Links to all pages (translated)

LanguageSwitcher (AR/EN)

ThemeToggle (🌙/☀️)

Responsive layout: horizontal on desktop, vertical or hamburger on mobile

Active link should be visually distinguished

🦶 Footer
Appears globally via _app.jsx

Centered neutral text (translated)

e.g., © 2025 Company Name. All rights reserved.

Switches direction for RTL languages

Responsive and minimal styling