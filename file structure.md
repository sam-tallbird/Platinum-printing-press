/printing-service-next
├── public/
│   ├── locales/
│   │   ├── en/                 # English translations
│   │   │   └── common.json
│   │   └── ar/                 # Arabic translations
│   │       └── common.json
│   └── favicon.ico
│
├── src/
│   ├── pages/
│   │   ├── index.jsx
│   │   ├── about.jsx
│   │   ├── services.jsx
│   │   ├── products.jsx
│   │   ├── contact.jsx
│   │   ├── our-work.jsx
│   │   └── _app.jsx
│
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── LanguageSwitcher.jsx
│
│   ├── context/
│   │   └── ThemeContext.jsx
│
│   ├── styles/
│   │   └── globals.css
│
│   ├── constants/
│   │   └── navLinks.js         # Route definitions & i18n keys
│
│   ├── utils/
│   │   └── i18n.js             # i18n configuration (next-i18next)
│
│   └── hooks/ (optional)       # Custom reusable hooks
│
├── next.config.js              # Includes i18n configuration
├── tailwind.config.js          # Includes dark mode setup
└── package.json
