/*
 * projects.js
 * Renderiza la seccion de Proyectos con carrusel accesible (hasta 4 imagenes),
 * tecnologias con iconos SVG estaticos y boton de PDF.
 * Expone una funcion de renderizado re-utilizable para actualizar el idioma.
 */

import { makeElement, makeImage, loadSvgInline } from './ui.js';
import { isSafeAssetPath } from './config-loader.js';
import { t, pickLang } from './content.js';

function buildCarousel(images) {
  const wrap = makeElement('div', 'carousel');
  const track = makeElement('div', 'carousel-track');

  const validImages = (images || []).filter((src) => typeof src === 'string' && src.trim() !== '');
  const total = Math.min(validImages.length, 4);

  if (total === 0) {
    wrap.appendChild(makeElement('div', 'carousel-empty', t('projects.noImage', 'Imagen no disponible')));
    return { element: wrap };
  }

  validImages.slice(0, total).forEach((src, index) => {
    const slide = makeElement('figure', 'carousel-slide');
    const img = makeImage({
      src,
      alt: `${t('projects.imageAlt')} ${index + 1}`,
      lazy: true
    });
    slide.appendChild(img);
    track.appendChild(slide);
  });
  wrap.appendChild(track);

  if (total === 1) {
    return { element: wrap };
  }

  track.setAttribute('tabindex', '0');
  track.setAttribute('aria-label', t('projects.carouselLabel', 'Carrusel de imágenes del proyecto'));

  const prev = makeElement('button', 'carousel-btn carousel-prev');
  prev.setAttribute('type', 'button');
  prev.setAttribute('aria-label', t('projects.prevImage', 'Imagen anterior'));
  prev.innerHTML =
    '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-arrow-left"></use></svg>';
  const next = makeElement('button', 'carousel-btn carousel-next');
  next.setAttribute('type', 'button');
  next.setAttribute('aria-label', t('projects.nextImage', 'Imagen siguiente'));
  next.innerHTML =
    '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-arrow-right"></use></svg>';

  const dots = makeElement('div', 'carousel-dots');
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', t('projects.selectImage', 'Seleccionar imagen del carrusel'));

  const dotButtons = [];
  let current = 0;

  const goToSlide = (index, smooth = true) => {
    current = Math.max(0, Math.min(total - 1, index));
    const slide = track.children[current];
    if (slide) {
      const left = slide.offsetLeft || (current * (track.clientWidth || 1));
      if (smooth) {
        track.scrollTo({ left, behavior: 'smooth' });
      } else {
        track.scrollLeft = left;
      }
    }
    dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
  };

  for (let i = 0; i < total; i += 1) {
    const dot = makeElement('button', 'carousel-dot');
    dot.setAttribute('type', 'button');
    dot.setAttribute('aria-label', `${t('projects.goToImage')} ${i + 1}`);
    dot.setAttribute('aria-current', String(i === 0));
    dot.addEventListener('click', () => goToSlide(i));
    dots.appendChild(dot);
    dotButtons.push(dot);
  }

  prev.addEventListener('click', () => goToSlide(current - 1));
  next.addEventListener('click', () => goToSlide(current + 1));

  const syncFromScroll = () => {
    const width = track.clientWidth || 1;
    const index = Math.round(track.scrollLeft / width);
    if (index !== current) {
      current = index;
      dotButtons.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)));
    }
  };

  let scrollFrame = null;
  track.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      syncFromScroll();
      scrollFrame = null;
    });
  });

  window.addEventListener('resize', syncFromScroll);

  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToSlide(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToSlide(current + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goToSlide(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goToSlide(total - 1);
    }
  });

  wrap.appendChild(prev);
  wrap.appendChild(next);
  wrap.appendChild(dots);

  return { element: wrap };
}

function buildTechnologies(technologies) {
  const list = makeElement('ul', 'project-techs');
  (technologies || []).forEach((tech) => {
    const li = makeElement('li', 'project-tech');

    if (tech.icon) {
      const iconWrap = makeElement('span', 'tech-icon-wrap');
      iconWrap.setAttribute('aria-hidden', 'true');
      loadSvgInline(iconWrap, tech.icon);
      li.appendChild(iconWrap);
    }
    if (tech.name) {
      li.appendChild(makeElement('span', 'tech-name', pickLang(tech.name)));
    }
    list.appendChild(li);
  });
  return list;
}

function buildPdfButton(pdfPath) {
  if (!pdfPath || typeof pdfPath !== 'string' || pdfPath.trim() === '' || !isSafeAssetPath(pdfPath)) return null;

  const anchor = makeElement('a', 'btn btn-secondary');
  anchor.setAttribute('href', pdfPath);
  anchor.setAttribute('target', '_blank');
  anchor.setAttribute('rel', 'noopener noreferrer');
  anchor.textContent = t('projects.docBtn', 'Ver documentación');
  anchor.appendChild(document.createTextNode(' \u2197'));
  return anchor;
}

function buildProject(project) {
  const headingId = `project-title-${project.id || 'generic'}`;
  const card = makeElement('article', 'project-card');
  card.setAttribute('aria-labelledby', headingId);

  const header = makeElement('header', 'project-header');
  const heading = makeElement('h3', 'project-name', pickLang(project.name));
  heading.setAttribute('id', headingId);
  header.appendChild(heading);
  const projectDescription = pickLang(project.description);
  if (projectDescription) {
    header.appendChild(makeElement('p', 'project-description', projectDescription));
  }
  card.appendChild(header);
  card.appendChild(buildCarousel(project.images || []).element);

  const body = makeElement('div', 'project-body');
  body.appendChild(buildTechnologies(project.technologies || []));

  const pdfButton = buildPdfButton(project.pdf);
  if (pdfButton) {
    const actions = makeElement('div', 'project-actions');
    actions.appendChild(pdfButton);
    body.appendChild(actions);
  }

  card.appendChild(body);
  return card;
}

function initProjects(config) {
  const projects = Array.isArray(config.projects) ? config.projects : [];
  const list = document.getElementById('projects-list');
  const title = document.getElementById('projects-title');

  if (!list) return () => {};

  const render = () => {
    if (title) title.textContent = t('projects.title', 'Proyectos');

    list.replaceChildren();
    if (projects.length === 0) {
      list.appendChild(makeElement('p', 'knowledge-empty', t('projects.empty', 'Aun no hay proyectos publicados.')));
      return;
    }

    projects.forEach((project) => list.appendChild(buildProject(project)));
  };

  render();
  return render;
}

export { initProjects };
