# Carpeta `assets/docs`

Coloca aqui tu **CV en PDF** para que el boton "Descargar CV" del hero funcione.

1. Copia tu archivo PDF a esta carpeta, por ejemplo `cv.pdf`.
2. Configura la ruta y el nombre de descarga en `config/portfolio.json`:

```json
"cvDownload": {
  "file": "assets/docs/cv.pdf",
  "downloadName": "Jeremy-Giraldo-Sanchez-CV.pdf"
}
```

- `file`: ruta relativa al PDF dentro del repositorio.
- `downloadName`: nombre con el que se descargara el archivo en el navegador.

El boton se oculta automaticamente si el PDF no existe o la ruta es invalida.
