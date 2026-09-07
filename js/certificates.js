/*
 * certificates.js
 * Renderiza la seccion de Conocimientos (certificados, cursos, titulos y
 * tecnologias), con filtros por tipo, busqueda por texto y modal.
 * Expone una funcion de renderizado re-utilizable para actualizar el idioma.
 */

import { makeElement, makeImage, openModal } from './ui.js';
import { t, pickLang, searchableText } from './content.js';

const FILTER_KEYS = ['Certificado', 'Curso', 'Titulo', 'Tecnologias'];

function getTypeLabel(type) {
  return t(`knowledge.filters.${type}`, type || '');
}

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getFileName(path) {
  const parts = String(path).split('/');
  return parts[parts.length - 1] || 'certificado';
}

function buildCard(item) {
  const card = document.createElement('article');
  card.className = 'knowledge-card';

  const nameText = pickLang(item.name);
  const institutionText = pickLang(item.institution);
  const typeLabel = getTypeLabel(item.type);
  const descriptionText = pickLang(item.description);
  const hasImage = Boolean(item.certificateImage);

  if (hasImage) {
    const button = makeElement('button', 'knowledge-card-img-btn');
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', `${t('knowledge.imageExpand')} ${nameText}`);
    button.addEventListener('click', () => {
      openModal({
        src: item.certificateImage,
        alt: `${t('knowledge.imageExpandedAlt')} ${nameText}`,
        caption: `${nameText}${institutionText ? ` — ${institutionText}` : ''}`,
        downloadUrl: item.certificateImage,
        fileName: getFileName(item.certificateImage)
      });
    });

    const img = makeImage({
      src: item.certificateImage,
      alt: `${t('knowledge.imageAlt')} ${nameText}`,
      className: 'knowledge-card-image'
    });
    button.appendChild(img);
    card.appendChild(button);
  } else {
    card.appendChild(makeElement('span', 'img-placeholder', t('knowledge.noImage', 'Imagen no disponible')));
  }

  const body = makeElement('div', 'knowledge-card-body');

  const top = makeElement('div', 'knowledge-card-top');
  top.appendChild(makeElement('h3', 'knowledge-card-name', nameText));
  if (typeLabel) {
    top.appendChild(makeElement('span', 'knowledge-card-badge', typeLabel));
  }
  body.appendChild(top);

  if (institutionText) {
    body.appendChild(makeElement('p', 'knowledge-card-institution', institutionText));
  }
  if (item.date) {
    body.appendChild(makeElement('p', 'knowledge-card-date', item.date));
  }

  if (descriptionText) {
    body.appendChild(makeElement('p', 'knowledge-card-description', descriptionText));
  }

  if (Array.isArray(item.keywords) && item.keywords.length > 0) {
    const tags = makeElement('ul', 'knowledge-card-tags');
    item.keywords.forEach((keyword) => {
      const keywordText = pickLang(keyword);
      if (keywordText) tags.appendChild(makeElement('li', 'knowledge-tag', keywordText));
    });
    body.appendChild(tags);
  }

  card.appendChild(body);
  return card;
}

function matchesSearch(item, query) {
  if (!query) return true;
  const q = normalizeText(query);
  return normalizeText(searchableText(item.name)).includes(q) ||
    normalizeText(searchableText(item.type)).includes(q) ||
    normalizeText(searchableText(item.institution)).includes(q) ||
    normalizeText(searchableText(item.description)).includes(q) ||
    (Array.isArray(item.keywords) && item.keywords.some((k) => normalizeText(searchableText(k)).includes(q)));
}

function initCertificates(config) {
  const knowledge = config.knowledge || {};
  const items = Array.isArray(knowledge.items) ? knowledge.items : [];
  const grid = document.getElementById('knowledge-grid');
  const title = document.getElementById('knowledge-title');
  const searchInput = document.getElementById('knowledge-search');
  const filtersContainer = document.getElementById('knowledge-filters');
  const status = document.getElementById('knowledge-status');

  if (!grid || !filtersContainer) return () => {};

  let activeFilterKey = null;
  let query = '';

  const filterKeys = [null];
  items.forEach((item) => {
    if (item.type && !filterKeys.includes(item.type)) filterKeys.push(item.type);
  });

  const render = () => {
    if (title) title.textContent = t('knowledge.title', 'Conocimientos');

    const searchLabel = document.getElementById('knowledge-search-label');
    if (searchLabel) searchLabel.textContent = t('knowledge.searchLabel', 'Buscar conocimientos');

    grid.replaceChildren();

    const visible = items.filter((item) => {
      const matchesType = !activeFilterKey || item.type === activeFilterKey;
      return matchesType && matchesSearch(item, query);
    });

    if (status) {
      const singular = t('knowledge.resultsCount.singular', 'elemento mostrado');
      const plural = t('knowledge.resultsCount.plural', 'elementos mostrados');
      status.textContent = `${visible.length} ${visible.length === 1 ? singular : plural}`;
    }

    if (visible.length === 0) {
      grid.appendChild(makeElement('p', 'knowledge-empty', t('knowledge.empty', 'No se encontraron resultados para tu búsqueda.')));
      return;
    }

    visible.forEach((item) => grid.appendChild(buildCard(item)));
  };

  const renderFilters = () => {
    filtersContainer.setAttribute('role', 'group');
    filtersContainer.setAttribute('aria-label', t('knowledge.filtersAria', 'Filtrar conocimientos por tipo'));

    filtersContainer.replaceChildren();
    filterKeys.forEach((key) => {
      const label = key === null ? t('knowledge.filterAll', 'Todos') : getTypeLabel(key);
      const button = makeElement('button', 'filter-btn', label);
      button.setAttribute('type', 'button');
      button.setAttribute('aria-pressed', String(activeFilterKey === key));
      button.addEventListener('click', () => {
        activeFilterKey = key;
        renderFilters();
        render();
      });
      filtersContainer.appendChild(button);
    });
  };

  renderFilters();

  if (searchInput) {
    searchInput.placeholder = t('knowledge.searchPlaceholder', 'Buscar...');

    let debounceTimer = null;
    searchInput.addEventListener('input', () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        query = searchInput.value || '';
        render();
      }, 120);
    });
  }

  render();

  return () => {
    if (searchInput) searchInput.placeholder = t('knowledge.searchPlaceholder', 'Buscar...');
    if (title) title.textContent = t('knowledge.title', 'Conocimientos');
    renderFilters();
    render();
  };
}

export { initCertificates };
