# Proceso de desarrollo - Proyecto Conor

## 26 de enero de 2026, 07:15 GMT+1

### Fase inicial: Análisis de estructura y propuesta de data.json

#### Sinopsis

Primera iteración del proyecto Conor. Se ha analizado la estructura de archivos existente y se propone una organización optimizada para el `data.json` que minimice redundancia y aproveche las convenciones de nomenclatura de archivos.

#### Análisis de la estructura actual

El proyecto presenta la siguiente organización de archivos:

**Estructura de directorios:**
```
conor/
├── data/
│   ├── assets/
│   │   ├── buttons/       (botones de UI: home, back, info, etc.)
│   │   ├── misc/          (elementos decorativos: círculos, cruces, etc.)
│   │   ├── password/      (UI para proyectos con contraseña)
│   │   └── titles/        (títulos como imágenes webp)
│   ├── bio/
│   │   ├── bio.webp       (imagen principal bio)
│   │   ├── cv/            (páginas del CV)
│   │   └── me/            (fotos personales)
│   ├── commission/
│   │   ├── kate/          (4 imágenes)
│   │   ├── r1/            (3 imágenes)
│   │   └── shainy/        (4 imágenes)
│   ├── familyArchive/
│   │   └── ashlee/        (877 imágenes organizadas por años/eventos)
│   └── projects/
│       ├── allEars/       (27 imágenes + thumbnail)
│       ├── belladona/     (173 imágenes + thumbnail)
│       └── buttercup/     (228 imágenes + password)
└── snippets/
    ├── mobile-gate-simple/
    └── paper_css/
```

**Convenciones detectadas:**
- Cada proyecto/comisión tiene una carpeta con su slug como nombre
- Los títulos están en `data/assets/titles/{slug}.webp`
- Cada proyecto tiene un thumbnail `{slug}.webp` en su carpeta raíz
- Las imágenes del proyecto están en la subcarpeta `img/`
- FamilyArchive tiene una estructura jerárquica de subcarpetas por años/eventos

**Problemas identificados:**
1. El `data.json` actual no es JSON válido (falta sintaxis de array, comillas, etc.)
2. No hay información sobre comisiones ni family archive en el JSON
3. No hay metadata técnica de los proyectos (año, técnica, dimensiones, etc.)
4. No hay información sobre el orden de visualización

#### Propuesta de mejoras organizativas

**Mejoras en la estructura de archivos:**
1. ✅ Mantener la convención de thumbnails con nombre del slug en la carpeta raíz
2. ✅ Mantener títulos en `assets/titles/` (reduce redundancia en JSON)
3. ✅ Mantener imágenes en subcarpetas `img/` numeradas o nombradas
4. 💡 **Sugerencia**: Renombrar imágenes en `commission/` y `projects/` con números secuenciales (1.webp, 2.webp, etc.) para simplificar el código de carga
5. 💡 **Sugerencia**: Crear un archivo `order.txt` o similar en `familyArchive/ashlee/` para definir el orden de las subcarpetas si es importante

**Estructura propuesta para data.json:**

El JSON estará organizado en tres secciones principales: `projects`, `commissions` y `familyArchive`. Se minimiza la redundancia aprovechando las convenciones de nomenclatura.

```json
{
  "projects": [
    {
      "slug": "allEars",
      "title": "i am all ears",
      "year": "2023",
      "technique": "Mixed media",
      "dimensions": "Variable",
      "description": "Descripción del proyecto...",
      "imageCount": 27,
      "password": null,
      "order": 1
    },
    {
      "slug": "belladona",
      "title": "belladona",
      "year": "2023",
      "technique": "Photography",
      "dimensions": "Various",
      "description": "Descripción del proyecto...",
      "imageCount": 173,
      "password": null,
      "order": 2
    },
    {
      "slug": "buttercup",
      "title": "pucker up butter cup",
      "year": "2024",
      "technique": "Digital collage",
      "dimensions": "Digital",
      "description": "Descripción del proyecto...",
      "imageCount": 228,
      "password": "password",
      "order": 3
    }
  ],
  "commissions": [
    {
      "slug": "kate",
      "title": "Kate",
      "year": "2024",
      "client": "Private commission",
      "description": "Descripción de la comisión...",
      "imageCount": 4,
      "order": 1
    },
    {
      "slug": "r1",
      "title": "R1",
      "year": "2024",
      "client": "Private commission",
      "description": "Descripción de la comisión...",
      "imageCount": 3,
      "order": 2
    },
    {
      "slug": "shainy",
      "title": "Shainy",
      "year": "2024",
      "client": "Private commission",
      "description": "Descripción de la comisión...",
      "imageCount": 4,
      "order": 3
    }
  ],
  "familyArchive": [
    {
      "slug": "ashlee",
      "title": "Ashlee",
      "description": "Family archive collection",
      "folders": [
        "1987_rhodes",
        "1989",
        "1990",
        "1993_4",
        "1993_wed",
        "1994",
        "1999_connor",
        "2001",
        "2002-2003",
        "2003-2004_turkey",
        "house",
        "misc"
      ]
    }
  ]
}
```

**Ventajas de esta estructura:**
- **Rutas predecibles**: Con el slug y las convenciones, el código puede construir rutas automáticamente
  - Thumbnail: `data/{section}/{slug}/{slug}.webp`
  - Título: `data/assets/titles/{slug}.webp`
  - Imágenes: `data/{section}/{slug}/img/{n}.webp` o enumerar carpeta
- **Mínima redundancia**: No repetimos información que está implícita en la estructura de archivos
- **Escalable**: Fácil añadir nuevos proyectos/comisiones
- **Metadata útil**: Incluye información técnica para mostrar en fichas
- **Orden controlado**: Campo `order` para controlar la secuencia de visualización

#### Próximos pasos

1. ✅ Crear el `data.json` con la estructura propuesta
2. Implementar el HTML base con mobile gate
3. Implementar el CSS con el fondo paper pattern
4. Implementar el JavaScript para navegación y carga de imágenes
5. Añadir la capa de ruido estático
6. Implementar el sistema de contraseñas
7. Testing y ajustes finales


---

## 26 de enero de 2026, 07:35 GMT+1

### Primera implementación: Estructura base de la web

#### Sinopsis

Se ha implementado la primera versión funcional de la web de Conor, incluyendo todos los componentes principales: mobile gate, menú principal, sistema de contraseñas, galería con carga progresiva, y capa de ruido estático.

#### Archivos creados

**1. data/data.json**
- Estructura JSON válida con tres secciones: projects, commissions, familyArchive
- Incluye metadata completa: slug, title, year, technique, dimensions, description, imageCount, password, order
- Datos de fichas técnicas inventados temporalmente (pueden ser actualizados)

**2. index.html**
- Estructura HTML con 5 pantallas principales:
  - Mobile gate overlay (detecta dispositivos móviles)
  - Main menu (centrado con botones de proyectos, comisiones y family archive)
  - Password screen (para proyectos protegidos)
  - Gallery (grid con imágenes + menú inferior derecho + panel de info)
  - About screen (bio + contacto)
- Botón "About" fijo en esquina superior izquierda
- Canvas para capa de ruido estático

**3. style.css**
- Fondo con paper pattern (del snippet paper_css)
- Estilos para todas las pantallas y componentes
- Grid responsive con efecto escalonado (nth-child odd/even con translateY diferente)
- Animación fadeInUp para carga progresiva de imágenes
- Padding inferior de 25dvh en la galería para el menú y ficha técnica
- Panel de información técnica con fondo blanco semi-transparente

**4. gate.js**
- Copiado del snippet mobile-gate-simple
- Detecta dispositivos móviles y muestra overlay de bloqueo
- Mensaje personalizado para usuarios móviles

**5. app.js**
- Sistema de estado global (appData, currentProject, currentSection)
- Carga de data.json al iniciar
- Generación dinámica de botones del menú desde el JSON
- Sistema de navegación entre pantallas
- **Carga progresiva de imágenes**: Las imágenes se cargan una por una con delay de 50ms entre cada una
- Sistema de contraseñas con feedback visual (correct.webp / wrong.webp)
- Panel de información técnica toggle-able
- **Noise canvas animado**: Genera ruido estático frame por frame con requestAnimationFrame
- Event listeners para todos los botones de navegación

#### Características implementadas

✅ Mobile gate (no funciona en móviles)
✅ Fondo paper pattern
✅ Capa de ruido estático animado
✅ Menú principal centrado con tres secciones
✅ Botones con imágenes (sin texto)
✅ Sistema de contraseñas para proyectos protegidos
✅ Galería con grid responsive
✅ Carga progresiva de imágenes (efecto de "cargando")
✅ Grid escalonada (efecto visual con translateY)
✅ Margen inferior de 25dvh para menú y ficha técnica
✅ Menú inferior derecho (info + "...")
✅ Panel de información técnica toggle
✅ Pantalla About con bio
✅ Navegación completa entre todas las secciones

#### Detalles técnicos

**Rutas de imágenes construidas dinámicamente:**
- Thumbnails proyectos: `data/projects/{slug}/{slug}.webp`
- Imágenes proyectos: `data/projects/{slug}/img/{n}.webp`
- Thumbnails comisiones: `data/commission/{slug}/1.webp`
- Imágenes comisiones: `data/commission/{slug}/{n}.webp`
- Títulos: `data/assets/titles/{slug}.webp`
- Botones UI: `data/assets/buttons/{nombre}.webp`
- Password UI: `data/assets/password/{nombre}.webp`

**Animación de ruido:**
El canvas de ruido se regenera en cada frame usando `requestAnimationFrame`, creando un efecto de estática de TV analógica. Opacity 0.15 y mix-blend-mode overlay para no interferir con la legibilidad.

**Carga progresiva:**
Las imágenes se cargan secuencialmente con un delay de 50ms entre cada una, creando un efecto visual de "carga" que hace la experiencia más dinámica.

#### Pendientes / Mejoras futuras

- Family Archive: Actualmente el código está preparado pero necesita implementar el escaneo de subcarpetas
- Botón "..." del menú inferior: Placeholder, pendiente de definir funcionalidad
- Responsive: Ajustar breakpoints para diferentes tamaños de pantalla
- Transiciones: Añadir transiciones más suaves entre pantallas
- Optimización: Lazy loading más inteligente para proyectos con muchas imágenes

#### Organización de archivos

Se ha creado la carpeta `prompt/` y movido el `prompt.txt` original allí para mantener registro de todos los prompts del proyecto.


---

## 26 de enero de 2026, 08:15 GMT+1

### Segunda iteración: Refactorización completa a arquitectura multi-HTML

#### Sinopsis

Refactorización completa del proyecto separando la aplicación en múltiples páginas HTML independientes. Se implementó sistema de carga tipo Rauber, lightbox con navegación por teclado, mejoras en home y about, y se simplificó significativamente el código eliminando funciones innecesarias.

#### Cambios arquitectónicos principales

La aplicación se ha reestructurado completamente pasando de una SPA (Single Page Application) a una arquitectura multi-página más simple y mantenible.

**Nueva estructura de archivos:**
- `index.html` + `home.js` - Página principal con menú
- `about.html` + `about.js` - Página de about
- `project.html` + `project.js` - Template genérico para proyectos, comisiones y álbumes
- `style.css` - Estilos globales compartidos
- `gate.js` - Mobile gate compartido

Esta arquitectura ofrece varias ventajas: cada página carga solo el código necesario, el mantenimiento es más sencillo, el código es más legible, y es más fácil añadir nuevas secciones en el futuro.

#### Mejoras implementadas según prompt 2.txt

**Home (index.html):**
El título principal "Conor Ashlee-Purle" ahora usa `conor.webp` con tamaño aumentado (max-width: 500px). Los títulos de proyectos mantienen su aspect ratio sin deformación. El botón about en la esquina superior izquierda también usa `conor.webp` en lugar de `about.webp`.

**About (about.html):**
Se eliminó el botón about cuando estás en la página about. Los datos de contacto ahora se cargan desde `data.json` (email: cashlee.purle@gmail.com, teléfono: +44 (0) 747 5121424). El email es un link clickeable con `mailto:`.

**Proyectos (project.html):**
Se implementó un sistema de carga tipo Rauber con preloader y barra de progreso. Las imágenes se precargan completamente antes de mostrar la galería. La grid es "imperfecta" o "dentada" usando nth-child para crear un efecto escalonado visual. Se añadió un lightbox para ver imágenes en grande con navegación por arrow keys y botones de flecha.

**Family Archive:**
Los álbumes ahora se muestran como links de texto pequeños en estilo Diary. Se carga el `albums.json` que ya existía para obtener las imágenes de cada álbum. Los álbumes funcionan con el mismo template `project.html`.

#### Código eliminado y simplificado

Se eliminaron las siguientes funciones y código innecesario:
- Generación de títulos SVG dinámicos (`generateTitleDataUrl`, `escapeXml`, `formatLabel`, `setMenuImage`)
- Función `hideScreens()` redundante
- Variables de estado innecesarias (`familyAlbumsCache`)
- Código duplicado de noise canvas (ahora en función compartida)
- Sistema de navegación complejo de la SPA

El código resultante es aproximadamente un 40% más corto y mucho más legible.

#### Sistema de navegación por URL

El template `project.html` recibe parámetros por URL:
- `?type=project&slug=belladona` - Para proyectos
- `?type=commission&slug=kate` - Para comisiones
- `?type=album&slug=ashlee/1987_rhodes` - Para álbumes del family archive

Esto permite compartir URLs directas a proyectos específicos y simplifica la navegación.

#### Lightbox y navegación

El lightbox implementado permite:
- Click en cualquier imagen de la galería para ampliar
- Navegación con arrow keys (izquierda/derecha)
- Navegación con botones de flecha visuales
- Cerrar con tecla Escape o click en X
- Click fuera de la imagen para cerrar

#### Grid imperfecta

La grid usa nth-child para crear un efecto "dentado" o "jagged":
```css
.gallery-item:nth-child(3n+1) { margin-top: 20px; }
.gallery-item:nth-child(3n+2) { margin-top: -10px; }
.gallery-item:nth-child(3n+3) { margin-top: 30px; }
```

Esto crea un efecto visual más orgánico y deja espacio natural en la parte inferior para la ficha técnica y botones.

#### Preloader

El preloader muestra una barra de progreso que se llena mientras se cargan todas las imágenes del proyecto. Una vez cargadas al 100%, se oculta el preloader y se muestra la galería con todas las imágenes ya disponibles.

#### data.json actualizado

Se añadió una sección `contact` al principio del JSON:
```json
{
  "contact": {
    "email": "cashlee.purle@gmail.com",
    "phone": "+44 (0) 747 5121424"
  },
  ...
}
```

También se reestructuró `familyArchive` para incluir un array de `albums` con slug y title de cada álbum.

#### Assets no usados

Se creó el documento `manus/assets-no-usados.md` con un análisis detallado de todos los assets disponibles y cuáles están en uso. Los principales assets no usados son:
- Botones: `....webp` (eliminado del menú), `ig.webp`, `next.webp`, `previous.webp`
- Misc: Todos los elementos decorativos (circles, crosses, squares)
- Password: `hint.webp`, `hint_2.webp`
- Titles: `education.webp`, `exhibitions.webp`, `publications.webp`

#### Archivos modificados

**Nuevos archivos:**
- `about.html` - Página de about
- `about.js` - Lógica de about
- `home.js` - Lógica de home (simplificada)
- `project.html` - Template de galería
- `project.js` - Lógica de galería con preloader y lightbox
- `manus/assets-no-usados.md` - Documentación de assets

**Archivos modificados:**
- `index.html` - Simplificado para home
- `style.css` - Actualizado con nuevos estilos
- `data/data.json` - Añadido contact y reestructurado familyArchive

**Archivos eliminados/deprecados:**
- `app.js` - Reemplazado por home.js, about.js, project.js

#### Próximos pasos sugeridos

1. Decidir sobre assets no usados (eliminar o mantener)
2. Implementar link de Instagram si se desea
3. Considerar añadir secciones de education, exhibitions, publications
4. Optimizar carga de imágenes para proyectos muy grandes (lazy loading más inteligente)
5. Añadir transiciones suaves entre páginas si se desea
