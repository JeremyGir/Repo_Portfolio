/*
 * contact.js
 * Renderiza la seccion de Contacto: botones de redes sociales y formulario
 * con validacion HTML + JavaScript. Proveedor inicial: mailto.
 * Expone una funcion de renderizado re-utilizable para actualizar el idioma.
 */

import { makeElement, loadSvgInline } from './ui.js';
import { isSafeUrl } from './config-loader.js';
import { t } from './content.js';

const FORM_FIELDS = [
  {
    name: 'nombre',
    labelKey: 'contact.fields.nombre.label',
    type: 'text',
    required: true,
    autocomplete: 'name',
    maxLength: 80
  },
  {
    name: 'empresa',
    labelKey: 'contact.fields.empresa.label',
    type: 'text',
    required: true,
    autocomplete: 'organization',
    maxLength: 80
  },
  {
    name: 'correo',
    labelKey: 'contact.fields.correo.label',
    type: 'email',
    required: true,
    autocomplete: 'email',
    maxLength: 120
  },
  {
    name: 'telefono',
    labelKey: 'contact.fields.telefono.label',
    type: 'tel',
    required: false,
    autocomplete: 'tel',
    maxLength: 20
  },
  {
    name: 'asunto',
    labelKey: 'contact.fields.asunto.label',
    type: 'text',
    required: true,
    autocomplete: 'off',
    maxLength: 150
  }
];

function buildSocialButtons(socialLinks) {
  const container = document.getElementById('social-links');
  if (!container) return;

  container.replaceChildren();
  const validLinks = (socialLinks || []).filter((link) => isSafeUrl(link.url));

  if (validLinks.length === 0) {
    container.appendChild(makeElement('p', 'contact-form-empty', t('contact.noSocial', 'No hay redes sociales configuradas.')));
    return;
  }

  validLinks.forEach((link) => {
    const button = makeElement('a', 'social-btn');
    button.setAttribute('href', link.url);
    button.setAttribute('target', '_blank');
    button.setAttribute('rel', 'noopener noreferrer');
    button.setAttribute('aria-label', link.name || t('contact.socialLabel', 'Red social'));

    if (link.icon) {
      const iconWrap = makeElement('span', 'tech-icon-wrap');
      iconWrap.setAttribute('aria-hidden', 'true');
      loadSvgInline(iconWrap, link.icon);
      button.appendChild(iconWrap);
    }
    button.appendChild(makeElement('span', 'social-btn-name', link.name || t('contact.socialLink', 'Enlace')));
    container.appendChild(button);
  });
}

function httpBuildQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function buildContactForm(formConfig) {
  const wrap = document.getElementById('contact-form-wrap');
  if (!wrap) return;

  wrap.replaceChildren();

  if (!formConfig.enabled) {
    wrap.appendChild(
      makeElement('p', 'contact-form-empty', t('contact.formDisabled', 'El formulario de contacto está deshabilitado.'))
    );
    return;
  }

  const form = makeElement('form', 'contact-form');
  form.setAttribute('novalidate', 'true');
  form.setAttribute('aria-label', t('contact.formLabel', 'Formulario de contacto'));

  const fieldMap = new Map();

  FORM_FIELDS.forEach((field) => {
    const fieldWrap = makeElement('div', 'form-field');

    const label = makeElement('label');
    label.setAttribute('for', `contact-${field.name}`);
    label.textContent = t(field.labelKey, 'Campo');
    if (field.required) {
      const mark = makeElement('span', 'required-mark');
      mark.textContent = ' *';
      mark.setAttribute('aria-hidden', 'true');
      label.appendChild(mark);
    }
    fieldWrap.appendChild(label);

    const input = document.createElement('input');
    input.id = `contact-${field.name}`;
    input.name = field.name;
    input.type = field.type;
    input.autocomplete = field.autocomplete;
    input.maxLength = field.maxLength;
    if (field.required) input.required = true;
    if (field.name === 'correo' && field.type === 'email') input.setAttribute('aria-describedby', 'contact-correo-hint');

    const error = makeElement('p', 'field-error');
    error.id = `contact-${field.name}-error`;
    fieldWrap.appendChild(input);
    fieldWrap.appendChild(error);

    if (field.name === 'correo') {
      const hint = makeElement('p', 'form-hint');
      hint.id = 'contact-correo-hint';
      hint.textContent = t('contact.emailHint', 'Ejemplo: nombre@dominio.com');
      fieldWrap.appendChild(hint);
    }

    form.appendChild(fieldWrap);
    fieldMap.set(field.name, { input, error, required: field.required });
  });

  const submitWrap = makeElement('div', 'form-actions');
  const submit = makeElement('button', 'btn btn-primary');
  submit.setAttribute('type', 'submit');
  submit.textContent = t('contact.submitBtn', 'Enviar mensaje');
  submitWrap.appendChild(submit);
  form.appendChild(submitWrap);

  const status = makeElement('p', 'form-status');
  status.id = 'contact-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.appendChild(status);

  const setFieldError = (name, message) => {
    const field = fieldMap.get(name);
    if (!field) return;
    field.error.textContent = message;
    fieldWrapInvalidState(field, Boolean(message));
  };

  const clearAllErrors = () => {
    fieldMap.forEach((field) => {
      field.error.textContent = '';
      fieldWrapInvalidState(field, false);
    });
  };

  const validateField = (name) => {
    const field = fieldMap.get(name);
    if (!field) return true;
    const value = field.input.value.trim();

    if (field.required && value === '') {
      setFieldError(name, t('contact.validation.required', 'Este campo es obligatorio.'));
      return false;
    }

    if (name === 'correo' && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setFieldError(name, t('contact.validation.invalidEmail', 'Introduce un correo válido.'));
      return false;
    }

    if (value.length > field.input.maxLength) {
      setFieldError(name, `${t('contact.validation.maxChars', 'Máximo')} ${field.input.maxLength} ${t('contact.validation.chars', 'caracteres.')}`);
      return false;
    }

    setFieldError(name, '');
    return true;
  };

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      setFieldError(input.name, '');
    });
    input.addEventListener('blur', () => {
      validateField(input.name);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearAllErrors();

    let firstInvalid = null;
    let valid = true;

    fieldMap.forEach((field, name) => {
      const fieldValid = validateField(name);
      if (!fieldValid) {
        valid = false;
        if (!firstInvalid) firstInvalid = field.input;
      }
    });

    if (!valid) {
      status.textContent = t('contact.validation.fixFields', 'Por favor, corrige los campos marcados.');
      status.className = 'form-status error';
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const values = {};
    fieldMap.forEach((field, name) => {
      values[name] = field.input.value.trim();
    });

    const email = formConfig.email || '';
    if (formConfig.provider === 'mailto' && email) {
      const subject = `[Portfolio] ${values.asunto || t('contact.mailto.subject', 'Contacto')}`;
      const body = [
        t('contact.mailto.intro', 'Hola, te contacto a través de tu portfolio.'),
        '',
        `${t('contact.mailto.fieldName', 'Nombre')}: ${values.nombre}`,
        `${t('contact.mailto.fieldCompany', 'Empresa')}: ${values.empresa}`,
        `${t('contact.mailto.fieldEmail', 'Correo')}: ${values.correo}`,
        values.telefono ? `${t('contact.mailto.fieldPhone', 'Teléfono')}: ${values.telefono}` : '',
        '',
        values.asunto,
        ''
      ]
        .filter((line) => line !== '')
        .join('\n');

      const mailto = `mailto:${email}?${httpBuildQuery({ subject, body })}`;
      window.location.href = mailto;

      status.textContent = t('contact.validation.mailtoSuccess', 'Se abrió tu aplicación de correo con el mensaje listo para enviar.');
      status.className = 'form-status success';
    } else {
      status.textContent = t('contact.validation.noProvider', 'El formulario no tiene un proveedor de envío configurado.');
      status.className = 'form-status error';
    }
  });

  wrap.appendChild(form);
}

function fieldWrapInvalidState(field, invalid) {
  const wrapEl = field.input.closest('.form-field');
  if (!wrapEl) return;
  wrapEl.classList.toggle('is-invalid', invalid);
  field.input.setAttribute('aria-invalid', String(invalid));
}

function bindContact(config) {
  const contact = config.contact || {};

  const render = () => {
    const title = document.getElementById('contact-title');
    const subtitle = document.getElementById('contact-subtitle');
    const socialTitle = document.querySelector('.contact-social-title');

    if (title) title.textContent = t('contact.title', 'Contacto');
    if (subtitle) subtitle.textContent = t('contact.subtitle', '');
    if (socialTitle) socialTitle.textContent = t('contact.socialTitle', 'Redes sociales');

    buildSocialButtons(contact.socialLinks);
    buildContactForm({
      enabled: Boolean(contact.form && contact.form.enabled),
      provider: (contact.form && contact.form.provider) || 'mailto',
      email: (contact.form && contact.form.email) || ''
    });
  };

  render();
  return render;
}

export { bindContact, buildSocialButtons, buildContactForm };
