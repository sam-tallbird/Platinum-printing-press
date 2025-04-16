 Multilingual Support (AR / EN)
Using next-i18next

Pages auto-render based on locale in URL (/en, /ar)

Locale files (common.json) store all translatable text

UI elements (nav links, page titles, etc.) use t('key') from translation files

🔒 Rules:
No hardcoded text — all strings must be translatable

Translation keys must follow the format: section.key (e.g., nav.home)

Arabic version must support RTL layout using Tailwind’s dir="rtl"

🌗 Light / Dark Theme Toggle
Using Tailwind’s dark mode + custom ThemeContext

Global state for dark/light mode stored in ThemeContext

<html class="dark"> toggled based on user preference

Toggle switch in the Navbar via ThemeToggle component

🔒 Rules:
Theme must persist via localStorage

All colors must use Tailwind’s theme classes (bg-white, bg-gray-900, etc.)

Custom colors must be defined in tailwind.config.js, not inline