# Guía de `config/portfolio.json`

Este archivo concentra **todo** el contenido editable del portfolio. Puedes cambiar textos, fotos, certificados, proyectos, enlaces y redes sociales **sin tocar HTML, CSS ni JavaScript**.

> **Regla de oro:** si quieres mostrar algo nuevo, escríbelo aquí y agrega el archivo correspondiente en `assets/`. No necesitas abrir ningún `.js`.

---

## Estructura general

```json
{
  "site":        { ... },   // Titulo, idioma por defecto, tema y descripcion SEO
  "personal":    { ... },   // Nombre, cargo, foto y descripcion breve
  "heroImage":   { ... },   // Imagen del hero + color/grosor del borde de silueta
  "cvDownload":  { ... },   // Boton "Descargar CV" (ruta y nombre del PDF)
  "about":       { ... },   // Seccion "Sobre mi"
  "experience":  [ ... ],   // Seccion "Experiencia" (parametrizable, ES/EN)
  "knowledge":   { ... },   // Certificados, cursos, titulos y tecnologias
  "projects":    [ ... ],   // Lista de proyectos
  "contact":     { ... },   // Formulario y redes sociales
  "texts":       { ... }    // Textos ES/EN de toda la interfaz (idiomas)
}
```

---

## 1. `site` — Titulo, idioma y tema

| Propiedad     | Que es                                        | Como llenarlo                    |
| ------------- | ---------------------------------------------- | -------------------------------- |
| `title`       | Titulo del sitio (aparece en la pestana).     | Texto, ej. `"Juan Perez Portfolio"` |
| `language`    | Idioma de la pagina (`lang`).                  | `"es"`, `"en"`, `"pt"`, etc.      |
| `theme`       | Tema inicial (`dark` o `light`).              | `"dark"` o `"light"`              |
| `description` | Descripcion para SEO / redes sociales.        | 1 o 2 frases profesionales.       |

```json
"site": {
  "title": "Ana Lopez — Portfolio",
  "language": "es",
  "theme": "light",
  "description": "Portfolio de Ana Lopez, disenadora UI/UX."
}
```

**Nota sobre el tema:** si el visitante usa el boton de tema, esa eleccion se guarda en `localStorage` y tiene prioridad sobre `site.theme`.

---

## 2. `personal` — Nombre, cargo y foto

| Propiedad    | Que es                                |
| ------------ | ------------------------------------- |
| `name`       | Tu nombre completo.                   |
| `role`       | Tu cargo o profesion.                 |
| `photo`      | Ruta a tu fotografia.                 |
| `description`| Descripcion breve (se usa en el inicio). |

```json
"personal": {
  "name": "Ana Lopez",
  "role": "Disenadora UI/UX",
  "photo": "assets/profile/foto.png",
  "description": "Diseno interfaces claras, accesibles y centradas en el usuario."
}
```

### Como cambiar la foto

1. Pon tu imagen en `assets/profile/` (por ejemplo `foto.png`).
2. Cambia la propiedad `photo` del JSON.
3. Listo. **Recomendado:** formato `jpg` o `webp`, proporcion cuadrada (por ejemplo 800x800 px), menos de 500 KB.

Si la foto no existe o la ruta esta mal, el sitio muestra un placeholder — nunca se rompe.

---

## 2.1 `heroImage` — Imagen del hero con borde de silueta

| Propiedad     | Que es                                                                    |
| ------------- | ------------------------------------------------------------------------- |
| `src`         | Ruta a la **imagen PNG** del hero (debe permitir transparencia).          |
| `alt`         | Texto alternativo accesible.                                              |
| `borderColor` | Color del borde que rodea la **silueta** (no un rectangulo).              |
| `borderWidth` | Grosor del borde en pixeles.                                              |
| `width`       | Ancho de la imagen en pixeles (el alto se ajusta automaticamente).        |

```json
"heroImage": {
  "src": "assets/profile/mi-foto.png",
  "alt": "Jeremy Giraldo Sanchez",
  "borderColor": "#2563eb",
  "borderWidth": 3,
  "width": 320
}
```

El borde **no** es un `border` normal: usa un filtro SVG (`feMorphology`) que detecta el canal alfa del PNG y dibuja el contorno solo alrededor del contenido visible (la silueta), respetando la transparencia. Funciona en navegadores modernos, es 100 % estatico y compatible con GitHub Pages.

> Si el PNG no existe o la ruta es invalida, la zona de imagen queda vacia (no se rompe la pagina).

---

## 2.2 `cvDownload` — Boton de descarga del CV (PDF)

| Propiedad       | Que es                                                        |
| --------------- | ------------------------------------------------------------- |
| `file`          | Ruta relativa al PDF dentro del repositorio.                  |
| `downloadName`  | Nombre con el que se descargara el archivo en el navegador.   |

```json
"cvDownload": {
  "file": "assets/docs/cv.pdf",
  "downloadName": "Jeremy-Giraldo-Sanchez-CV.pdf"
}
```

- Coloca tu PDF en `assets/docs/` (crea la carpeta si no existe).
- El boton usa el atributo `download` del navegador; no hay backend.
- El texto del boton se traduce con ES/EN (`hero.downloadCv` en `texts`).
- Si el PDF no existe, el boton se oculta automaticamente.

---

## 3. `about` — Sobre mi

| Propiedad    | Que es                                              |
| ------------ | --------------------------------------------------- |
| `title`      | Titulo de la seccion (normalmente "Sobre mi").      |
| `description`| Tu historia personal y profesional (parrafo largo). |
| `details`    | Lista de puntos destacados.                         |

```json
"about": {
  "title": "Sobre mi",
  "description": "Trabajo desde hace 6 anios en productos digitales...",
  "details": [
    "Diseno de interfaces accesibles.",
    "Prototipado y testing con usuarios."
  ]
}
```

Puedes quitar `details` o dejarlo vacio si no lo necesitas.

---

## 3.1 `experience` — Experiencia (parametrizable, ES/EN)

Es un **array**. Cada experiencia admite titulo, empresa, periodo y descripcion. Para soportar el selector de idiomas, cada campo puede ser un objeto con claves `es` y `en`:

```json
"experience": [
  {
    "title": {
      "es": "Desarrollador Full Stack",
      "en": "Full Stack Developer"
    },
    "company": {
      "es": "Empresa XYZ",
      "en": "XYZ Company"
    },
    "period": {
      "es": "Ene 2022 — Actualidad",
      "en": "Jan 2022 — Present"
    },
    "description": {
      "es": "Descripcion en espanol.",
      "en": "Description in English."
    }
  }
]
```

- **Agregar** una experiencia: copia un bloque `{ ... }` dentro del array y editalo.
- **Eliminar** una: borra el bloque completo (deja la coma correcta).
- **Cambiar textos**: edita `es` y `en` de cada campo.
- Tambien puedes usar texto plano (una cadena) en lugar de `{ es, en }` si no necesitas traduccion.
- En desktop se muestran 2 tarjetas por fila; en tablet/movil pasa a una columna.

---

## 4. `knowledge` — Conocimientos, certificados, titulos

Cada elemento de `items` es una tarjeta. Campos soportados:

| Propiedad         | Obligatorio | Que es                                                    |
| ----------------- | ----------- | --------------------------------------------------------- |
| `name`            | si          | Nombre del conocimiento/curso/certificado (puede ser `{ es, en }`). |
| `description`     | opcional    | Descripcion corta del curso/certificado (puede ser `{ es, en }`). |
| `type`            | si          | `Certificado`, `Curso`, `Titulo` o `Tecnologias`.         |
| `institution`     | opcional    | Institucion que lo otorgo (puede ser `{ es, en }`).       |
| `date`            | opcional    | Anio o fecha, ej. `"2025"` o `"Enero 2025"`.              |
| `keywords`        | opcional    | Lista de palabras clave para la busqueda (cada una puede ser un string o `{ es, en }`). |
| `certificateImage`| opcional    | Ruta de la imagen/certificado.                            |

```json
{
  "name": {
    "es": "Arquitectura de Software",
    "en": "Software Architecture"
  },
  "description": {
    "es": "Formacion en diseno de sistemas: principios SOLID, patrones de arquitectura y decisiones de diseno.",
    "en": "Training in systems design: SOLID principles, architecture patterns and design decisions."
  },
  "type": "Titulo",
  "institution": {
    "es": "Universidad Nacional",
    "en": "National University"
  },
  "date": "2024",
  "keywords": ["arquitectura", "patrones", { "es": "diseno", "en": "design" }],
  "certificateImage": "assets/certificates/arquitectura.svg"
}
```

> La **descripcion** es opcional pero muy recomendada: se muestra dentro de la tarjeta y tambien participa en la busqueda y los filtros. Si un campo debe traducirse, usa `{ es, en }`; si es un nombre propio (marca) o un valor identico en ambos idiomas, basta con un string. Los campos `name`, `description`, `institution` y `keywords` soportan ambos formatos.

### Como agregar un certificado/titulo

1. Copia un bloque `{ ... }` completo dentro del array `items`.
2. Cambia todos los valores.
3. Guarda, recarga. Aparece de inmediato.

### Como agregar palabras clave

Agrega mas valores al array `keywords`. La busqueda los usa (ej. buscar "poo" encuentra "Java Fundacional").

### Como eliminar un certificado

Borra el bloque `{ ... }` completo del array `items` (debe quedar una coma en el valor anterior).

### Los filtros y tipos

Los filtros son: `Certificados`, `Cursos`, `Titulos`, `Tecnologias`. El tipo de cada tarjeta se define con el campo `type`. Para que el filtro "Titulos" agrupe, usa exactamente `"Titulo"` como tipo. La busqueda funciona sobre el nombre, el tipo, la institucion y las palabras clave, sin distinguir mayusculas/minusculas.

---

## 5. `projects` — Proyectos

Es un **array** de proyectos. Cada proyecto:

| Propiedad     | Obligatorio | Que es                                                     |
| ------------- | ----------- | ---------------------------------------------------------- |
| `id`          | si          | Identificador unico (por ejemplo `"proyecto-03"`).         |
| `name`        | si          | Nombre del proyecto.                                       |
| `description` | si          | Descripcion del proyecto.                                  |
| `images`      | opcional    | Hasta 4 rutas de imagenes para el carrusel.                 |
| `technologies`| opcional    | Array de tecnologias con `name` e `icon`.                  |
| `pdf`         | opcional    | Ruta del PDF de documentacion.                             |

```json
{
  "id": "proyecto-03",
  "name": "App de Finanzas",
  "description": "Aplicacion para control de gastos personales.",
  "images": [
    "assets/projects/proyecto-03/image-01.jpg",
    "assets/projects/proyecto-03/image-02.jpg"
  ],
  "technologies": [
    { "name": "Java",  "icon": "assets/icons/java.svg" },
    { "name": "MySQL", "icon": "assets/icons/mysql.svg" }
  ],
  "pdf": "assets/projects/proyecto-03/proyecto.pdf"
}
```

### Como copiar un proyecto existente para crear uno nuevo

1. Crea la carpeta del proyecto en `assets/projects/`, por ejemplo `mkassets/projects/proyecto-03/`.
2. Copia el bloque completo de un proyecto en el JSON (dentro de `projects`, con su coma al final), y pegalo despues del ultimo proyecto **antes de la llave de cierre `]`**.
3. Cambia `id` a `"proyecto-03"`.
4. Cambia `name`, `description`, etc.
5. Coloca tus archivos (imagenes y PDF) dentro de `assets/projects/proyecto-03/`.
6. Asegurate de que las rutas en el JSON coincidan exactamente.

### Como agregar imagenes al carrusel

- **Hasta 4 imagenes.** El carrusel muestra los controles solo si hay 2 o mas imagenes.
- Si no pones imagenes, se muestra un placeholder.
- Las carpetas sugeridas por proyecto usan `image-01`, `image-02`, `image-03`, `image-04`.

### Como agregar tecnologias

Agrega objetos `{ "name": "...", "icon": "..." }` al array `technologies`. El SVG se carga desde `assets/icons/` (la ruta del JSON). Si el icono no existe o esta mal, se muestra solo el nombre.

### Como agregar un PDF

1. Pon el PDF dentro de la carpeta del proyecto.
2. Agrega `"pdf": "assets/projects/proyecto-03/proyecto.pdf"`.
3. Si no quieres PDF, elimina esa propiedad o dejala vacia: el boton no aparece.

---

## 6. `contact` — Formulario y redes sociales

| Propiedad  | Que es                                                   |
| ---------- | -------------------------------------------------------- |
| `title`    | Titulo de la seccion.                                    |
| `subtitle` | Texto de apoyo debajo del titulo.                        |
| `form`     | Configuracion del formulario.                            |
| `socialLinks` | Array de botones de redes sociales.                   |

### Formulario

| Propiedad | Que es                                                       |
| --------- | ------------------------------------------------------------ |
| `enabled` | `true` muestra el formulario, `false` lo oculta.             |
| `provider`| `"mailto"` (opcion inicial).                                |
| `email`   | Correo al que se enviara el mensaje (en `mailto`).           |

```json
"form": {
  "enabled": true,
  "provider": "mailto",
  "email": "correo@example.com"
}
```

**Limitacion importante:** un sitio 100 % estatico no puede enviar correos por si mismo. El proveedor `mailto` abre el cliente de correo del visitante con el mensaje pre-cargado. Para envio real necesitas un servicio externo (Formspree, una API propia, etc.). Si integras uno, **nunca** pongas claves o API keys en JavaScript del frontend.

### Como agregar una red social

Cada boton es un objeto del array `socialLinks`:

| Propiedad | Que es                          |
| --------- | ------------------------------- |
| `name`    | Nombre visible + tooltip.       |
| `icon`    | Ruta al SVG en `assets/icons/`. |
| `url`     | URL correcta `https://...`.     |

```json
"socialLinks": [
  { "name": "GitHub",   "icon": "assets/icons/github.svg",   "url": "https://github.com/tuusuario" },
  { "name": "LinkedIn", "icon": "assets/icons/linkedin.svg", "url": "https://linkedin.com/in/tuusuario" }
]
```

Para agregar otra red (X/Twitter, portafolio, etc.): copia un objeto, cambia `name`, pega un SVG en `assets/icons/` y actualiza `url`. Los enlaces se abren en pestana nueva con `rel="noopener noreferrer"`.

### Como cambiar una URL

Solo reemplaza el valor de `url` con una URL absoluta que empiece por `https://`. El sitio ignora enlaces peligrosos (`javascript:`, `data:`).

---

## 7. Formatos de archivo recomendados

| Contenido        | Formato                  | Notas                              |
| ---------------- | ------------------------ | ---------------------------------- |
| Foto de perfil   | `jpg` / `webp`           | Cuadrada, menos de 500 KB.         |
| Capturas / imagenes | `jpg` / `webp`        | Menos de 300 KB cada una.          |
| Certificados     | `jpg` / `webp` / `svg`   | Apaisado u vertical, proporcion normal. |
| Iconos           | `svg`                    | Sin fondo, color `currentColor` para heredar. |
| Documentacion    | `pdf`                    | Preferiblemente comprimido.        |

> Rutas: usa siempre barras normales `/` y respeta mayusculas/minusculas exactas del nombre de archivo (GitHub Pages usa Linux).

---

## 8. `texts` y selector de idioma ES / EN

El portfolio incluye un **selector de idiomas ES / EN** en la cabecera. Al hacer clic, guarda la eleccion en `localStorage`, **refresca la pagina** y carga toda la interfaz en el idioma elegido: navbar, inicio, botones, sobre mi, experiencia, conocimientos (filtros, busqueda, nombres y descripciones de cursos), proyectos, contacto, formulario, footer, textos del modal y accesibilidad.

- **Idioma por defecto:** se define con `site.language` (`"es"` o `"en"`). Es un unico punto de configuracion.
- **persistencia:** la eleccion del visitante se guarda en `localStorage`. Si no esta disponible, se usa el idioma por defecto.
- **Textos traducibles:** viven en `texts` dentro del JSON. Cada clave apunta a un objeto `{ "es": "...", "en": "..." }`.
- **Contenido bilingue:** los campos mostrados de `personal`, `about`, `experience`, `knowledge` (nombre, descripcion, institucion y palabras clave) y `projects` (nombre y descripcion) aceptan tanto un string como un objeto `{ es, en }`.

```json
"site": { "language": "es" },

"texts": {
  "nav": {
    "home": { "es": "Inicio", "en": "Home" }
  },
  "hero": {
    "greeting": { "es": "Hola, soy", "en": "Hi, I'm" },
    "downloadCv": { "es": "Descargar CV", "en": "Download CV" }
  }
}
```

Para cambiar un texto a otro idioma, solo edita el objeto `{ es, en }` correspondiente en `texts`. No hace falta tocar HTML ni JavaScript.

> El contenido personal (nombre, descripcion, experiencia, proyectos, etc.) tambien puede traducirse: en `experience` los campos usan `{ es, en }`. El nombre y la profesion se toman de `personal` (un solo valor compartido).

---

## Preguntas frecuentes

**P: ¿Donde esta el contenido del HTML?**  
R: Todo se genera desde `config/portfolio.json`. El HTML solo define la estructura vacia.

**P: ¿Necesito tocar JavaScript para agregar un proyecto?**  
R: No. Solo JSON + archivos en `assets/`.

**P: ¿Que pasa si cometo un error en el JSON?**  
R: El sitio intenta cargar un JSON predeterminado, muestra un aviso amigable y registra el error en la consola. No se rompe.

**P: ¿Los filtros y la busqueda funcionan juntos?**  
R: Si. Filtro por tipo + texto de busqueda se combinan automaticamente.