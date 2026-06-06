/**
 * Language Context
 *
 * Languages:
 *   • Public site, customer/auth pages: EN + RU
 *   • Admin / Manager / Team-lead / Customer cabinets: EN + RU
 *
 * Russian (RU) is the second supported language across the WHOLE platform.
 * Bulgarian (BG) and Ukrainian (UK) have been fully removed.
 *
 * Default behaviour:
 *   • If user has a stored preference → use it.
 *   • Else if browser locale starts with 'ru' → RU
 *   • Else → EN.
 *
 * Persistence: localStorage["bibi_lang"].
 * Toggle order on click: EN → RU → EN.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

// Full set of languages supported across the platform.
export const LANGUAGES = [
  { code: 'en', label: 'ENG', flag: '🇬🇧', name: 'English' },
  { code: 'ru', label: 'RU',  flag: '🇷🇺', name: 'Русский' },
];

// Public site + customer auth — EN and RU are available.
export const PUBLIC_LANGUAGES = LANGUAGES;

// Customer cabinet — EN + RU.
export const CUSTOMER_LANGUAGES = LANGUAGES;

// Staff (admin / manager / team-lead) cabinets — EN + RU.
export const STAFF_LANGUAGES = LANGUAGES;

const SUPPORTED = LANGUAGES.map((l) => l.code);
const PUBLIC_SUPPORTED = PUBLIC_LANGUAGES.map((l) => l.code);
const DEFAULT_LANG = 'ru';

/**
 * Detect the user's preferred language from the browser, restricted to the
 * languages the platform supports (EN, RU).
 */
const detectBrowserLang = () => {
  if (typeof navigator === 'undefined') return DEFAULT_LANG;
  const langs = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ''];
  for (const raw of langs) {
    if (!raw) continue;
    const code = raw.toLowerCase().slice(0, 2);
    if (PUBLIC_SUPPORTED.includes(code)) return code; // EN or RU
  }
  return DEFAULT_LANG;
};

// Legacy aliases — any old stored 'bg' / 'uk' / 'ua' is mapped to RU
// (Slavic-language users get the closest replacement).
const normalizeLang = (raw) => {
  if (!raw) return null;
  if (raw === 'bg' || raw === 'uk' || raw === 'ua') return 'ru';
  return SUPPORTED.includes(raw) ? raw : null;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    let stored = null;
    try { stored = localStorage.getItem('bibi_lang'); } catch {}
    let initial = normalizeLang(stored);
    if (!initial) {
      initial = detectBrowserLang();
    }
    try { localStorage.setItem('bibi_lang', initial); } catch {}
    return initial;
  });

  // Persist language preference and reflect on <html lang="…">.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem('bibi_lang', lang); } catch {}
    try { document.documentElement.setAttribute('lang', lang); } catch {}
    try { document.body && document.body.setAttribute('data-app-lang', lang); } catch {}
  }, [lang]);

  // Translation lookup — current language first, then EN fallback, then the
  // key itself as a last resort.
  const t = (key) => (
    translations[lang]?.[key]
    ?? translations.en?.[key]
    ?? key
  );

  // Toggle between EN ↔ RU.
  const toggleLang = () => {
    const idx = LANGUAGES.findIndex((l) => l.code === lang);
    const next = LANGUAGES[(idx + 1) % LANGUAGES.length];
    setLang(next.code);
  };

  // Set specific language. Unknown / legacy codes (bg, uk, ua) are coerced to RU.
  const changeLang = (newLang) => {
    const normalized = normalizeLang(newLang);
    if (!normalized) return;
    setLang(normalized);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang: changeLang,
        t,
        toggleLang,
        changeLang,
        languages: LANGUAGES,
        publicLanguages: PUBLIC_LANGUAGES,
        customerLanguages: CUSTOMER_LANGUAGES,
        staffLanguages: STAFF_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      t: (key) => translations[DEFAULT_LANG]?.[key] || key,
      toggleLang: () => {},
      changeLang: () => {},
      languages: LANGUAGES,
      publicLanguages: PUBLIC_LANGUAGES,
      customerLanguages: CUSTOMER_LANGUAGES,
      staffLanguages: STAFF_LANGUAGES,
    };
  }
  return context;
};

export default LanguageContext;
