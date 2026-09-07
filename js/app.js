/*
 * app.js
 * Punto de entrada: carga la configuracion, inicializa el sistema de idiomas
 * y coordina los modulos de renderizado.
 */

import { loadConfig, isSafeAssetPath } from './config-loader.js';
import {
  applySeo,
  initTheme,
  initLanguageToggle,
  initMobileMenu,
  initScrollSpy,
  initGlobalModal,
  makeImage,
  makeElement
} from './ui.js';
import { initCertificates } from './certificates.js';
import { initProjects } from './projects.js';
import { bindContact } from './contact.js';
import { initContent, t, tInterpolate, pickLang } from './content.js';

let config = null;

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

function renderHero() {
  const personal = config.personal || {};
  setText('hero-greeting', t('hero.greeting', 'Hola, soy'));
  setText('hero-title', personal.name || 'Mi Nombre');
  setText('hero-role', pickLang(personal.role) || '');
  setText('hero-description', pickLang(personal.description) || '');

  const projectsBtn = document.querySelector('.hero-actions .btn-primary');
  if (projectsBtn) projectsBtn.textContent = t('hero.ctaProjects', 'Ver proyectos');
  const contactBtn = document.querySelector('.hero-actions .btn-secondary');
  if (contactBtn) contactBtn.textContent = t('hero.ctaContact', 'Contactarme');

  renderHeroImage();
  renderHeroCv();
}

function renderHeroImage() {
  const heroImage = config.heroImage || {};
  const wrap = document.getElementById('hero-image-wrap');
  if (!wrap) return;

  wrap.replaceChildren();

  const src = heroImage.src;
  if (!src || !isSafeAssetPath(src)) return;

  const figure = makeElement('figure', 'hero-image');
  const img = makeImage({
    src,
    alt: pickLang(heroImage.alt) || pickLang(config.personal && config.personal.name) || t('hero.photoAlt', 'Foto de perfil'),
    lazy: false
  });

  img.style.width = `${Number(heroImage.width) || 320}px`;
  img.style.height = 'auto';

  figure.appendChild(img);
  wrap.appendChild(figure);

  const flood = document.getElementById('hero-border-flood');
  if (flood) {
    flood.setAttribute('flood-color', heroImage.borderColor || '#2563eb');
  }
  const morph = document.getElementById('hero-border-morph');
  if (morph) {
    morph.setAttribute('radius', String(Number(heroImage.borderWidth) || 3));
  }
}

function renderHeroCv() {
  const cv = config.cvDownload || {};
  const btn = document.getElementById('hero-cv-btn');
  if (!btn) return;

  const file = cv.file;
  if (!file || !isSafeAssetPath(file)) {
    btn.classList.add('is-hidden');
    return;
  }

  btn.href = file;
  btn.setAttribute('download', cv.downloadName || 'CV.pdf');
  btn.textContent = t('hero.downloadCv', 'Descargar CV');
  btn.classList.remove('is-hidden');
}

function renderAbout() {
  const personal = config.personal || {};
  const about = config.about || {};

  setText('about-title', pickLang(about.title) || 'Sobre mi');
  setText('about-name', personal.name || '');
  setText('about-role', pickLang(personal.role) || '');
  setText('about-description', pickLang(about.description) || '');

  const photoFigure = document.getElementById('about-photo');
  if (photoFigure) {
    photoFigure.replaceChildren();
    const photo = makeImage({
      src: personal.photo || '',
      alt: `${t('about.photoAlt')} ${personal.name || ''}`
    });
    photoFigure.appendChild(photo);
  }

  const detailsList = document.getElementById('about-details');
  if (detailsList) {
    detailsList.replaceChildren();
    (Array.isArray(about.details) ? about.details : []).forEach((detail) => {
      const text = pickLang(detail);
      if (text) detailsList.appendChild(makeElement('li', '', text));
    });
  }
}

function renderExperience() {
  setText('experience-title', t('experience.title', 'Experiencia'));

  const grid = document.getElementById('experience-grid');
  if (!grid) return;

  grid.replaceChildren();

  const items = Array.isArray(config.experience) ? config.experience : [];
  if (items.length === 0) return;

  items.forEach((item) => {
    const card = makeElement('article', 'experience-card');

    const header = makeElement('div', 'experience-card-header');
    header.appendChild(makeElement('h3', 'experience-card-title', pickLang(item.title)));
    if (item.period) {
      header.appendChild(makeElement('span', 'experience-card-period', pickLang(item.period)));
    }
    card.appendChild(header);

    if (item.company) {
      card.appendChild(makeElement('p', 'experience-card-company', pickLang(item.company)));
    }
    if (item.description) {
      card.appendChild(makeElement('p', 'experience-card-description', pickLang(item.description)));
    }

    grid.appendChild(card);
  });
}

function renderNav() {
  document.querySelectorAll('#nav-menu .nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    const map = {
      '#home': 'nav.home',
      '#about': 'nav.about',
      '#experience': 'nav.experience',
      '#knowledge': 'nav.knowledge',
      '#projects': 'nav.projects',
      '#contact': 'nav.contact'
    };
    if (map[href]) link.textContent = t(map[href], link.textContent);
  });
}

function renderFooter() {
  const personal = config.personal || {};
  const copy = document.getElementById('footer-copy');
  if (!copy) return;
  const year = new Date().getFullYear();
  const name = personal.name || '';
  const role = pickLang(personal.role) || '';
  copy.textContent = tInterpolate('footer.copy', { year, name, role })
    .replace(/\{\{year\}\}/g, year)
    .replace(/\{\{name\}\}/g, name)
    .replace(/\{\{role\}\}/g, role);
}

/* Traduce textos estaticos de la interfaz (modal, menu, tema, skip, etc.) */
function applyStaticTranslations() {
  const skip = document.querySelector('.skip-link');
  if (skip) skip.textContent = t('skip.link', 'Saltar al contenido');

  const brandLink = document.querySelector('.brand');
  if (brandLink) brandLink.setAttribute('aria-label', t('nav.brandAria', 'Ir al inicio'));

  const mainNav = document.querySelector('.nav');
  if (mainNav) mainNav.setAttribute('aria-label', t('nav.mainAria', 'Navegación principal'));

  const modalDownload = document.getElementById('modal-download');
  if (modalDownload) modalDownload.textContent = t('modal.download', 'Descargar');
  const modalClose = document.getElementById('modal-close');
  if (modalClose) {
    modalClose.textContent = t('modal.close', 'Cerrar');
    modalClose.setAttribute('aria-label', t('modal.close', 'Cerrar'));
  }
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.textContent = t('modal.title', 'Vista ampliada');

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? t('theme.darkLabel', 'Activar modo claro') : t('theme.lightLabel', 'Activar modo oscuro'));
  }

  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-label', expanded ? t('menu.close', 'Cerrar menú') : t('menu.open', 'Abrir menú'));
  }

  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) langToggle.setAttribute('aria-label', t('langToggle.label', 'Cambiar idioma'));
}

function renderAll() {
  renderNav();
  renderHero();
  renderAbout();
  renderExperience();
  renderCertificates();
  renderProjects();
  renderContact();
  renderFooter();
  applyStaticTranslations();
}

/* Lazy wrappers decouple language refresh from module initialization */
let certificatesRender;
let projectsRender;
let contactRender;

function renderCertificates() {
  if (typeof certificatesRender === 'function') certificatesRender();
}

function renderProjects() {
  if (typeof projectsRender === 'function') projectsRender();
}

function renderContact() {
  if (typeof contactRender === 'function') contactRender();
}

async function initApp() {
  initGlobalModal();

  config = await loadConfig();

  initContent(config);
  applySeo(config);
  initTheme(config);
  initLanguageToggle();
  initMobileMenu();
  initScrollSpy();

  renderNav();
  renderHero();
  renderAbout();
  renderExperience();

  certificatesRender = initCertificates(config);
  projectsRender = initProjects(config);
  contactRender = bindContact(config);

  renderFooter();
  applyStaticTranslations();

  document.addEventListener('langchange', () => {
    renderAll();
  });
}

initApp();
