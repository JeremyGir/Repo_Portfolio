/*
 * ui.js
 * Interacciones generales: SEO basico, tema claro/oscuro, menu movil,
 * scrollspy, selector de idioma, carga de SVGs inline, helper de imagenes
 * con fallback y modal accesible para certificados.
 */

import { isSafeAssetPath } from './config-loader.js';
import { getLanguage, setLanguage, t, pickLang } from './content.js';

const THEME_STORAGE_KEY = 'portfolio-theme';

/* ---------- Helpers de DOM ---------- */

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null && text !== '') {
    element.textContent = text;
  }
  return element;
}

function placeholderDataUri(text) {
  const noImage = t('modal.noImage', 'Imagen no disponible');
  const safeText = (text || noImage).replace(/[<>&"]/g, '');
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#0f172a"/><text x="200" y="150" font-family="sans-serif" font-size="20" text-anchor="middle" fill="#64748b">' + safeText + '</text></svg>'
  );
}

/* Crea una imagen con alt, lazy loading opcional y fallback a placeholder. */
function makeImage({ src, alt, className, lazy = true }) {
  const img = document.createElement('img');
  if (className) img.className = className;
  if (alt) img.alt = alt;
  if (lazy) img.loading = 'lazy';

  const fallback = placeholderDataUri(t('modal.noImage', 'Imagen no disponible'));

  if (isSafeAssetPath(src)) {
    img.src = src;
  } else {
    console.warn('[ui] Ruta de imagen invalida, usando placeholder:', src);
    img.src = fallback;
  }

  img.addEventListener('error', () => {
    if (img.src !== fallback) {
      console.warn('[ui] Imagen no disponible:', src);
      img.src = fallback;
    }
  });

  return img;
}

/**
 * Carga un SVG estatico e lo inserta inline (para heredar currentColor).
 * Usa DOMParser en modo imagen SVG (no ejecuta scripts) y elimina cualquier
 * nodo <script>/<foreignObject> por seguridad.
 */
async function loadSvgInline(container, path) {
  if (!isSafeAssetPath(path)) {
    console.warn('[ui] Ruta SVG invalida:', path);
    return false;
  }
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svgNode = doc.documentElement;
    if (svgNode && (svgNode.nodeName === 'svg' || svgNode.localName === 'svg')) {
      const clone = document.importNode(svgNode, true);
      clone.querySelectorAll('script, foreignObject, object, embed, iframe').forEach((node) => node.remove());
      clone.setAttribute('class', 'icon tech-icon');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('focusable', 'false');
      container.appendChild(clone);
      return true;
    }
    console.warn('[ui] El archivo no es un SVG valido:', path);
  } catch (error) {
    console.warn('[ui] No se pudo cargar el SVG:', path, error.message || error);
  }
  return false;
}

/* ---------- SEO basico ---------- */

function applySeo(config) {
  const site = config.site || {};
  document.title = pickLang(site.title) || 'Mi Portfolio';

  const description = pickLang(site.description) || 'Portfolio profesional.';
  const setMeta = (name, content, property = null) => {
    const selector = property
      ? `meta[property="${property}"]`
      : `meta[name="${name}"]`;
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      else meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  };

  setMeta('description', description);
  setMeta(undefined, pickLang(site.title) || 'Portfolio', 'og:title');
  setMeta(undefined, description, 'og:description');

  const brand = document.querySelector('.brand');
  if (brand) {
    brand.textContent = (config.personal && config.personal.name) || 'Portfolio';
  }
}

/* ---------- Selector de idioma ---------- */

function initLanguageToggle() {
  const container = document.getElementById('lang-toggle');
  if (!container) return;

  const buttons = Array.from(container.querySelectorAll('.lang-btn'));
  const applyState = (lang) => {
    buttons.forEach((btn) => {
      const active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  };

  applyState(getLanguage());

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-lang');
      if (!next || next === getLanguage()) return;
      setLanguage(next);
      applyState(getLanguage());
      window.location.reload();
    });
  });
}

/* ---------- Tema claro / oscuro ---------- */

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
  const use = document.querySelector('.theme-toggle use');
  if (use) {
    use.setAttribute('href', theme === 'light' ? '#icon-sun' : '#icon-moon');
  }
  const label = document.querySelector('.theme-toggle');
  if (label) {
    label.setAttribute('aria-label', theme === 'dark' ? t('theme.darkLabel', 'Activar modo claro') : t('theme.lightLabel', 'Activar modo oscuro'));
  }
}

function initTheme(config) {
  let stored = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    stored = null;
  }

  let theme;
  if (stored === 'dark' || stored === 'light') {
    theme = stored;
  } else {
    theme = config.site && config.site.theme === 'light' ? 'light' : 'dark';
  }
  applyTheme(theme);

  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (error) {
      /* sin almacenamiento: la preferencia solo aplica a la sesion */
    }
  });
}

/* ---------- Menu movil ---------- */

function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const closeMenu = (focusToggle = false) => {
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', t('menu.open', 'Abrir menú'));
    if (focusToggle) toggle.focus();
  };

  const openMenu = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', t('menu.close', 'Cerrar menú'));
  };

  toggle.addEventListener('click', () => {
    if (menu.hidden) openMenu();
    else closeMenu();
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
  });

  const mediaQuery = window.matchMedia('(min-width: 769px)');
  const handleResize = (event) => {
    if (event.matches) {
      menu.hidden = false;
      menu.removeAttribute('aria-hidden');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      menu.hidden = true;
    }
  };
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleResize);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(handleResize);
  }
  handleResize(mediaQuery);
}

/* ---------- Scrollspy ---------- */

function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('#nav-menu .nav-link'));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (sections.length === 0 || !('IntersectionObserver' in window)) return;

  const setCurrent = (id) => {
    links.forEach((link) => {
      const isCurrent = link.getAttribute('href') === `#${id}`;
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length > 0) {
        setCurrent(visible[0].target.id);
      }
    },
    { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.5, 1] }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Modal de imagen ---------- */

let currentDownload = null;

function openModal({ src, alt, caption, downloadUrl, fileName }) {
  const dialog = document.getElementById('image-modal');
  const image = document.getElementById('modal-image');
  const captionEl = document.getElementById('modal-caption');
  const download = document.getElementById('modal-download');
  const close = document.getElementById('modal-close');
  if (!dialog || !image || !captionEl || !download || !close) return;

  if (isSafeAssetPath(src)) {
    image.src = src;
  } else {
    image.src = placeholderDataUri(t('modal.noImage', 'Imagen no disponible'));
  }
  image.alt = alt || caption || '';
  const modalFallback = placeholderDataUri(t('modal.noImage', 'Imagen no disponible'));
  image.onerror = () => {
    if (image.src !== modalFallback) {
      image.src = modalFallback;
    }
  };
  captionEl.textContent = caption || '';

  if (downloadUrl && isSafeAssetPath(downloadUrl) && fileName) {
    currentDownload = {
      url: downloadUrl,
      fileName
    };
    download.hidden = false;
  } else {
    currentDownload = null;
    download.hidden = true;
  }

  close.hidden = false;

  dialog.showModal();
  close.focus();
}

function performDownload() {
  if (!currentDownload) return;
  const anchor = document.createElement('a');
  anchor.href = currentDownload.url;
  anchor.download = currentDownload.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function initGlobalModal() {
  const dialog = document.getElementById('image-modal');
  const close = document.getElementById('modal-close');
  const download = document.getElementById('modal-download');
  if (!dialog || !close || !download) return;

  close.addEventListener('click', () => dialog.close());
  download.addEventListener('click', performDownload);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dialog.open) {
      dialog.close();
    }
  });
}

export {
  makeElement,
  makeImage,
  loadSvgInline,
  applySeo,
  initTheme,
  initLanguageToggle,
  initMobileMenu,
  initScrollSpy,
  openModal,
  initGlobalModal
};