/*
 * config-loader.js
 * Carga, valida y provee la configuracion centralizada (config/portfolio.json).
 * Nunca propaga rutas o URLs peligrosas hacia el DOM.
 */

const CONFIG_VERSION = '2026-09-06-v2';

const DEFAULT_CONFIG = {
  site: {
    title: 'Mi Portfolio',
    language: 'es',
    theme: 'dark',
    description: 'Portfolio profesional.'
  },
  personal: {
    name: 'Nombre Apellido',
    role: 'Profesion',
    photo: '',
    description: 'Descripcion profesional no configurada.'
  },
  heroImage: {
    src: '',
    alt: '',
    borderColor: '#2563eb',
    borderWidth: 3,
    width: 320
  },
  cvDownload: {
    file: '',
    downloadName: 'CV.pdf'
  },
  about: {
    title: 'Sobre mi',
    description: '',
    details: []
  },
  experience: [],
  knowledge: {
    title: 'Conocimientos',
    items: []
  },
  projects: [],
  contact: {
    title: 'Contacto',
    subtitle: '',
    form: {
      enabled: false,
      provider: 'mailto',
      email: ''
    },
    socialLinks: []
  },
  texts: {}
};

const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getValue(obj, keys, fallback = '') {
  if (!isPlainObject(obj)) return fallback;
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return fallback;
    if (isPlainObject(current) && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }
  return current === undefined || current === null ? fallback : current;
}

function asString(obj, keys, fallback = '') {
  const value = getValue(obj, keys, fallback);
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(obj, keys, fallback = false) {
  const value = getValue(obj, keys, fallback);
  return typeof value === 'boolean' ? value : fallback;
}

function asArray(obj, keys) {
  const value = getValue(obj, keys, []);
  return Array.isArray(value) ? value : [];
}

/**
 * Normaliza un valor para que soporte el selector de idiomas:
 *  - un objeto { es, en } se conserva como tal,
 *  - un string se conserva como string (texto compartido en ambos idiomas),
 *  - cualquier otro valor se reduce a ''.
 */
function normalizeLocalized(value) {
  if (isPlainObject(value)) {
    return {
      es: asString(value, ['es'], ''),
      en: asString(value, ['en'], '')
    };
  }
  return typeof value === 'string' ? value : '';
}

/* Valida URLs para enlaces: https:, http:, mailto:, tel: */
function isSafeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed);
    return ALLOWED_URL_SCHEMES.includes(parsed.protocol);
  } catch (error) {
    return false;
  }
}

/* Valida rutas de recursos estaticos: relativas, sin esquemas peligrosos. */
function isSafeAssetPath(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  const trimmed = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;
  if (trimmed.startsWith('//')) return false;
  if (/[<>"'`]/.test(trimmed)) return false;
  return true;
}

function mergeWithDefault(loaded) {
  const merged = deepClone(DEFAULT_CONFIG);
  if (!isPlainObject(loaded)) return merged;

  if (isPlainObject(loaded.site)) {
    merged.site.title = normalizeLocalized(loaded.site.title);
    merged.site.language = asString(loaded.site, ['language'], merged.site.language);
    merged.site.theme = ['dark', 'light'].includes(loaded.site.theme) ? loaded.site.theme : merged.site.theme;
    merged.site.description = normalizeLocalized(loaded.site.description);
  }

  if (isPlainObject(loaded.personal)) {
    merged.personal.name = asString(loaded.personal, ['name'], merged.personal.name);
    merged.personal.role = normalizeLocalized(loaded.personal.role);
    merged.personal.photo = asString(loaded.personal, ['photo'], merged.personal.photo);
    merged.personal.description = normalizeLocalized(loaded.personal.description);
  }

  if (isPlainObject(loaded.heroImage)) {
    merged.heroImage = {
      src: asString(loaded.heroImage, ['src'], ''),
      alt: normalizeLocalized(loaded.heroImage.alt),
      borderColor: asString(loaded.heroImage, ['borderColor'], '#2563eb'),
      borderWidth: Number(loaded.heroImage.borderWidth) || 3,
      width: Number(loaded.heroImage.width) || 320
    };
  }

  if (isPlainObject(loaded.cvDownload)) {
    merged.cvDownload = {
      file: asString(loaded.cvDownload, ['file'], ''),
      downloadName: asString(loaded.cvDownload, ['downloadName'], 'CV.pdf')
    };
  }

  if (isPlainObject(loaded.about)) {
    merged.about.title = loaded.about.title === undefined || loaded.about.title === null
      ? merged.about.title
      : normalizeLocalized(loaded.about.title);
    merged.about.description = loaded.about.description === undefined || loaded.about.description === null
      ? merged.about.description
      : normalizeLocalized(loaded.about.description);
    merged.about.details = asArray(loaded.about, ['details'])
      .map(normalizeLocalized)
      .filter((detail) => detail !== '');
  }

  merged.experience = asArray(loaded, ['experience'])
    .filter(isPlainObject)
    .map((item) => ({
      title: normalizeLocalized(item.title),
      company: normalizeLocalized(item.company),
      period: normalizeLocalized(item.period),
      description: normalizeLocalized(item.description)
    }));

  merged.texts = isPlainObject(loaded.texts) ? loaded.texts : {};

  if (isPlainObject(loaded.knowledge)) {
    merged.knowledge = {
      title: loaded.knowledge.title === undefined || loaded.knowledge.title === null
        ? merged.knowledge.title
        : normalizeLocalized(loaded.knowledge.title),
      items: asArray(loaded.knowledge, ['items'])
        .filter(isPlainObject)
        .map((item) => ({
          name: normalizeLocalized(item.name),
          description: normalizeLocalized(item.description),
          type: asString(item, ['type'], ''),
          institution: normalizeLocalized(item.institution),
          date: asString(item, ['date'], ''),
          keywords: asArray(item, ['keywords'])
            .map(normalizeLocalized)
            .filter((keyword) => keyword !== ''),
          certificateImage: asString(item, ['certificateImage'], '')
        }))
    };
  }

  merged.projects = asArray(loaded, ['projects'])
    .filter(isPlainObject)
    .map((item) => ({
      id: asString(item, ['id'], ''),
      name: normalizeLocalized(item.name),
      description: normalizeLocalized(item.description),
      images: asArray(item, ['images']).filter((p) => isSafeAssetPath(p)),
      technologies: asArray(item, ['technologies'])
        .filter(isPlainObject)
        .map((t) => ({
          name: normalizeLocalized(t.name),
          icon: asString(t, ['icon'], '')
        })),
      pdf: asString(item, ['pdf'], '')
    }));

  if (isPlainObject(loaded.contact)) {
    merged.contact = {
      title: loaded.contact.title === undefined || loaded.contact.title === null
        ? merged.contact.title
        : normalizeLocalized(loaded.contact.title),
      subtitle: loaded.contact.subtitle === undefined || loaded.contact.subtitle === null
        ? merged.contact.subtitle
        : normalizeLocalized(loaded.contact.subtitle),
      form: {
        enabled: asBoolean(loaded.contact, ['form', 'enabled'], false),
        provider: asString(loaded.contact, ['form', 'provider'], 'mailto'),
        email: asString(loaded.contact, ['form', 'email'], '')
      },
      socialLinks: asArray(loaded.contact, ['socialLinks'])
        .filter(isPlainObject)
        .map((link) => ({
          name: asString(link, ['name'], ''),
          icon: asString(link, ['icon'], ''),
          url: asString(link, ['url'], '')
        }))
    };
  }

  return merged;
}

async function loadConfig() {
  try {
    const response = await fetch(`config/portfolio.json?v=${CONFIG_VERSION}`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`No se pudo cargar config/portfolio.json (HTTP ${response.status}).`);
    }
    const data = await response.json();
    if (!isPlainObject(data)) {
      throw new Error('config/portfolio.json no contiene un objeto valido.');
    }
    const config = mergeWithDefault(data);
    console.info('[config-loader] Configuracion cargada correctamente.');
    return config;
  } catch (error) {
    console.error('[config-loader] Error al cargar la configuracion:', error.message || error);
    console.warn('[config-loader] Usando configuracion predeterminada (DEFAULT_CONFIG).');
    return deepClone(DEFAULT_CONFIG);
  }
}

export {
  loadConfig,
  mergeWithDefault,
  isSafeUrl,
  isSafeAssetPath,
  asString,
  asBoolean,
  asArray,
  isPlainObject,
  DEFAULT_CONFIG
};