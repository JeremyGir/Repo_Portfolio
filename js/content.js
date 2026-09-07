/*
 * content.js
 * Gestiona el idioma actual, almacena textos traducidos y provee la funcion
 * t() para resolver cadenas por clave. Persiste la preferencia en localStorage.
 */

const LANG_STORAGE_KEY = 'portfolio-lang';

let currentLang = 'es';
let texts = {};
let defaultLang = 'es';

function initContent(config) {
  defaultLang = (config.site && config.site.language) || 'es';
  texts = (config.texts) || {};

  let stored = null;
  try {
    stored = localStorage.getItem(LANG_STORAGE_KEY);
  } catch (_) {
    stored = null;
  }

  if (stored === 'es' || stored === 'en') {
    currentLang = stored;
  } else {
    currentLang = defaultLang;
  }

  applyLangAttribute();
}

function getLanguage() {
  return currentLang;
}

function setLanguage(lang) {
  if (lang !== 'es' && lang !== 'en') return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (_) {
    /* sin almacenamiento: la preferencia solo aplica a la sesion */
  }
  applyLangAttribute();
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  }
}

function applyLangAttribute() {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = currentLang;
  }
}

/**
 * Resuelve un valor del idioma actual partiendo de un valor que puede ser:
 *  - un string (se devuelve tal cual), o
 *  - un objeto de traduccion { es: "...", en: "..." }.
 * Si el idioma actual no existe, cae a defaultLang y despues a "es".
 */
function pickLang(value, lang) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const language = lang || currentLang;
    if (typeof value[language] === 'string' && value[language] !== '') return value[language];
    if (typeof value[defaultLang] === 'string' && value[defaultLang] !== '') return value[defaultLang];
    if (typeof value.es === 'string') return value.es;
    if (typeof value.en === 'string') return value.en;
  }
  return '';
}

/**
 * Devuelve el texto plano utilizable para busquedas de un valor bilingue:
 * strings directos o todas las variantes de un objeto { es, en }.
 */
function searchableText(value) {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    return Object.values(value)
      .filter((v) => typeof v === 'string')
      .join(' ');
  }
  return '';
}

/**
 * Resuelve una cadena de texto por su clave puntual.
 * Soporta claves con punto como separador, p.ej. "hero.greeting".
 * Si la clave es un objeto { es: "...", en: "..." }, devuelve el valor del idioma actual.
 * Si la clave es un string directo, lo devuelve tal cual.
 * Si no encuentra la clave, devuelve fallback o la clave misma.
 */
function t(key, fallback) {
  if (!key) return fallback || '';
  const keys = key.split('.');
  let current = texts;
  for (const k of keys) {
    if (current === null || current === undefined) return fallback || key;
    current = current[k];
  }
  if (current === null || current === undefined) return fallback || key;
  if (typeof current === 'string') return current;
  if (typeof current === 'object' && current[currentLang]) return current[currentLang];
  if (typeof current === 'object' && current[defaultLang]) return current[defaultLang];
  return fallback || key;
}

/**
 * Interpola placeholders en un texto.
 * P.ej. t interpolate("footer.copy", { year: 2025, name: "Jeremy" })
 * Busca {{key}} en el texto y los reemplaza.
 */
function tInterpolate(key, vars, fallback) {
  let text = t(key, fallback);
  if (!vars || typeof text !== 'string') return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, name) => {
    return vars[name] !== undefined ? String(vars[name]) : match;
  });
}

export { initContent, getLanguage, setLanguage, t, tInterpolate, pickLang, searchableText };
