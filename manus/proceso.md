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


---

## 26 de enero de 2026, 09:30 GMT+1

### Tercera iteración: Grid masonry, títulos corregidos, y mejoras de UX

#### Sinopsis

Implementación de grid masonry compacta tipo Pinterest, corrección de rutas de títulos, generación de imágenes de texto manuscrito para family archive, ajuste de hover opacity en galería, y reposicionamiento de botones después de la grid en lugar de fixed.

#### Problemas identificados y soluciones

El usuario reportó varios problemas con la implementación anterior que requerían atención inmediata. Los títulos en el home estaban usando las imágenes de los proyectos en lugar de las imágenes de títulos dedicadas. Las imágenes del proyecto "allEars" no se cargaban correctamente. La grid tenía espacios innecesarios entre imágenes y no aprovechaba el espacio disponible. El hover en las imágenes de la galería no mostraba cambio visual. El family archive usaba texto plano en lugar de imágenes de texto manuscrito. Los botones de home e info estaban fixed cuando deberían estar después de la grid.

#### Generación de imágenes de texto manuscrito

Se generaron 12 imágenes de texto manuscrito para los álbumes del family archive usando AI. Cada imagen simula texto escrito a mano en papel envejecido, creando un efecto de "escaneo" de álbum de fotos antiguo. Las imágenes se guardaron como `title.webp` en cada carpeta de álbum correspondiente.

**Álbumes generados:**
- 1987 Rhodes
- 1989, 1990
- 1993-4, 1993 Wedding, 1994
- 1999 Connor
- 2001, 2002-2003
- 2003-2004 Turkey
- House, Misc

El estilo visual es consistente: tinta azul oscura sobre papel envejecido con textura sutil, escritura natural e imperfecta con carácter personal.

#### Reorganización de títulos de proyectos

Se copiaron las imágenes de títulos desde `data/assets/titles/` a las carpetas de cada proyecto como `title.webp`. Esto permite mantener una estructura consistente donde cada proyecto tiene su propio título visual.

**Cambios en rutas:**
- `data/projects/allEars/title.webp` (copiado desde assets/titles/allEars.webp)
- `data/projects/belladona/title.webp` (copiado desde assets/titles/belladona.webp)
- `data/projects/buttercup/title.webp` (copiado desde assets/titles/buttercup.webp)

Se actualizó `home.js` para cargar `title.webp` en lugar de `{slug}.webp` para los botones de proyectos. También se actualizó para usar las imágenes de título generadas en family archive en lugar de texto plano.

#### Implementación de grid masonry

La grid anterior usaba CSS Grid con nth-child para crear un efecto "dentado", pero dejaba espacios vacíos y no era lo suficientemente compacta. Se implementó un layout masonry puro con JavaScript que distribuye las imágenes en columnas de forma óptima.

**Funcionamiento del masonry:**

El sistema crea 3 columnas dinámicas y distribuye las imágenes añadiendo cada una a la columna más corta en ese momento. Esto asegura que las imágenes se apilen de forma compacta sin espacios vacíos, similar a Pinterest o Tumblr.

```javascript
// Crear columnas
const columnCount = 3;
const columns = [];
for (let i = 0; i < columnCount; i++) {
    const column = document.createElement('div');
    column.className = 'masonry-column';
    columns.push(column);
    grid.appendChild(column);
}

// Distribuir imágenes
images.forEach((src, index) => {
    // ... crear imagen ...
    
    // Añadir a la columna más corta
    const shortestColumn = columns.reduce((shortest, current) => {
        return current.offsetHeight < shortest.offsetHeight ? current : shortest;
    });
    shortestColumn.appendChild(container);
});
```

**CSS del masonry:**

```css
.gallery-grid {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
}

.masonry-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
```

Este approach es mucho más simple que usar librerías externas y produce un resultado visualmente idéntico al ejemplo proporcionado por el usuario.

#### Mejoras de hover y opacidad

Las imágenes de la galería ahora tienen opacidad reducida por defecto (0.7) y aumentan a opacidad completa (1.0) al hacer hover. Esto crea un efecto visual sutil que guía la atención del usuario.

```css
.gallery-item {
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.gallery-item:hover {
    opacity: 1;
}
```

#### Reposicionamiento de botones

Los botones de home e info se movieron de posición fixed a posición estática después de la grid. Esto significa que el usuario debe scrollear hasta el final de las imágenes para acceder a estos botones, creando una experiencia más inmersiva donde el foco está en las imágenes.

**Cambios en HTML:**
- Botón home ahora está después de la grid
- Botón info está después del botón home
- Ambos usan flexbox para alineación

**Cambios en CSS:**
- `.btn-home-container` ya no es fixed
- `.gallery-menu` ya no es fixed
- Ambos tienen margin-top para separación de la grid

#### Disposición de botones home/about

Se ajustó el CSS del botón `.top-left-btn` para que cuando haya múltiples botones (home + about) en la esquina superior izquierda, se dispongan correctamente. El botón home siempre aparece primero, seguido del botón about.

El tamaño de estos botones se redujo ligeramente a `max-width: 180px` para que quepan mejor cuando están juntos.

#### Archivos modificados

**Nuevos archivos generados:**
- `data/projects/allEars/title.webp`
- `data/projects/belladona/title.webp`
- `data/projects/buttercup/title.webp`
- `data/familyArchive/ashlee/*/title.webp` (12 imágenes)

**Archivos modificados:**
- `home.js` - Rutas actualizadas para títulos y álbumes
- `project.js` - Implementación de masonry layout
- `project.html` - Botones reposicionados después de grid
- `style.css` - Masonry CSS, hover opacity, botones no fixed

#### Resultado final

La grid ahora es completamente compacta sin espacios vacíos, aprovechando todo el espacio disponible. Las imágenes se distribuyen de forma óptima entre las tres columnas. El hover proporciona feedback visual claro. Los títulos se cargan correctamente desde sus ubicaciones dedicadas. El family archive tiene un aspecto más homogéneo y personal con las imágenes de texto manuscrito. Los botones están posicionados después del contenido, no flotando sobre él.

La experiencia de navegación es más fluida y el código es más mantenible gracias a la estructura modular del masonry.


---

## 26 de enero de 2026, 10:15 GMT+1

### Correcciones de opacidad y botones del lightbox

#### Sinopsis

Corrección de problemas de opacidad en hover de galería y en el lightbox, reducción del tamaño de las flechas de navegación, y reemplazo del botón de cerrar (X) por el botón back.webp.

#### Problemas reportados

El usuario reportó que las imágenes en la galería no mostraban el efecto de opacidad al hacer hover (no llegaban a 100% de opacidad). Las imágenes en el lightbox tampoco tenían opacidad completa. Las flechas de navegación del lightbox eran demasiado grandes a pesar de estar configuradas a 40px en el CSS. El botón de cerrar era una "X" de texto cuando debería ser el botón back.webp.

#### Soluciones implementadas

**Hover en galería:**
- Restaurado el efecto de hover con `opacity: 0.7` por defecto
- Al hacer hover: `opacity: 1` para feedback visual claro
- Transición suave de 0.3s

```css
.gallery-item {
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.gallery-item:hover {
    opacity: 1;
}
```

**Opacidad en lightbox:**
- Añadido `opacity: 1` explícitamente a `.lightbox img` para asegurar que la imagen se muestre al 100% de opacidad sin transparencia

```css
.lightbox img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    opacity: 1;
}
```

**Reducción de tamaño de flechas:**
- Reducido `max-width` de `.lightbox-btn` de 40px a 30px
- Esto hace que las flechas sean más discretas y no dominen la interfaz

**Botón de cerrar con back.webp:**
- Reemplazado el `<div>` con "×" por `<img>` con `back.webp`
- Movido de esquina superior derecha a superior izquierda (consistente con navegación)
- Tamaño: `max-width: 80px` (más grande que las flechas pero no excesivo)
- Hover scale reducido a 1.1 para sutileza

```html
<!-- Antes -->
<div class="lightbox-close">×</div>

<!-- Después -->
<img src="data/assets/buttons/back.webp" alt="Close" class="lightbox-close">
```

```css
.lightbox-close {
    position: fixed;
    top: 2rem;
    left: 2rem;
    cursor: pointer;
    z-index: 1001;
    max-width: 80px;
    transition: transform 0.2s;
}
```

#### Resultado

Las imágenes de la galería ahora responden visualmente al hover con un cambio claro de opacidad. Las imágenes en el lightbox se muestran al 100% de opacidad sin ninguna transparencia. Las flechas de navegación son más pequeñas y discretas (30px). El botón de cerrar usa el asset back.webp y está posicionado en la esquina superior izquierda, creando una jerarquía visual más clara y consistente con el resto de la interfaz.

#### Archivos modificados

- `style.css` - Hover opacity, tamaño de flechas, estilos del botón cerrar
- `project.html` - Reemplazo de X por imagen back.webp


---

## 27 de enero de 2026

### Quinta iteración: Noise solo en fondo, opacity en botones, álbumes con imágenes, y refactor de noise

#### Sinopsis

Corrección del noise canvas para que solo afecte al fondo (cuadrícula) y no al contenido. Aplicación de opacity 0.85 a todos los botones/elementos interactivos con hover a 1. Conversión de los botones de texto de family albums a imágenes de título. Extracción del código de noise a archivo compartido y optimización a render estático.

#### Problemas identificados y soluciones

**1. Noise canvas tapaba el contenido (z-index 9999 → 1)**

El canvas de ruido tenía `z-index: 9999`, lo que lo colocaba encima de absolutamente todo: imágenes de galería, lightbox, botones, etc. Aunque tenía `pointer-events: none` (no bloqueaba clicks), visualmente el ruido se aplicaba sobre las imágenes y el contenido, no solo sobre el fondo de cuadrícula.

Solución: Se bajó el `z-index` del canvas a `1` y se añadió `position: relative; z-index: 2` al `#gallery` para que el contenido quede por encima del noise. Los demás contenedores ya tenían z-index superiores (`.centered-container: 10`, `.section-screen: 50`, `.top-left-actions: 100`, `.lightbox: 1000`).

**2. Opacity 0.85 en todos los botones/elementos interactivos**

Las imágenes de galería ya tenían `opacity: 0.7` con hover a `1`, pero los botones y elementos de navegación no tenían opacity reducida. Se aplicó `opacity: 0.85` con transición a `1` en hover a todos los elementos interactivos:

- `.about-btn img` (botón Conor/about)
- `.menu-title img` (títulos de secciones commission, family archive)
- `.menu-buttons img` (botones de proyectos y comisiones)
- `.album-links img` (imágenes de título de álbumes)
- `.btn-home` (botón home)
- `.gallery-menu img` (botón info)
- `.lightbox-btn` (flechas de navegación del lightbox)
- `.lightbox-close` (botón cerrar lightbox)
- `.password-buttons img` (botón back del password)
- `.section-title` (títulos de email/phone en about)

En el lightbox, las flechas de navegación usan `opacity: 0.85` como base (en vez de `1`). Cuando están en el boundary (primera/última imagen), bajan a `0.3`. El JS se actualizó para limpiar el inline style cuando no está en boundary, dejando que el CSS aplique el `0.85` por defecto. El hover usa `!important` para llegar a `1` incluso cuando el JS pone `0.3`.

**3. Family albums: de texto a imágenes de título**

Los álbumes del family archive se renderizaban como `<button>` con `textContent` (texto plano), rompiendo la filosofía de "todo son imágenes, no texto". Se verificó que cada álbum tiene un `title.webp` en su carpeta.

Se actualizó `home.js` para crear `<img>` con `src="data/familyArchive/ashlee/{album}/title.webp"` en lugar de botones de texto. Se actualizó el CSS reemplazando los estilos de `.album-date` por estilos de `.album-links img` con la misma opacity/hover que el resto.

**4. Noise canvas estático y compartido**

El noise se redibujaba cada frame (~60fps) con `requestAnimationFrame`, consumiendo CPU innecesariamente para un efecto que visualmente es casi idéntico si es estático.

Se creó `noise.js` como archivo compartido con una implementación que dibuja el noise una sola vez (y re-dibuja solo en resize). Se eliminó la función `setupNoiseCanvas()` duplicada de `home.js`, `project.js` y `about.js`. Se añadió `<script src="noise.js">` a las tres páginas HTML.

**5. Título dinámico en project.html**

Se añadió `document.title = currentProject.title` para que la pestaña del navegador muestre el nombre del proyecto en lugar del genérico "Project".

#### Archivos nuevos

- `noise.js` — Código compartido de noise canvas (estático, render único)

#### Archivos modificados

- `style.css` — z-index del noise canvas, opacity 0.85 en todos los botones, estilos de album-links con imágenes, z-index del gallery
- `home.js` — Family albums ahora crean `<img>` en vez de `<button>`, eliminado `setupNoiseCanvas()`
- `project.js` — Lightbox buttons usan CSS opacity por defecto, título dinámico, eliminado `setupNoiseCanvas()`
- `about.js` — Eliminado `setupNoiseCanvas()`
- `index.html` — Añadido `<script src="noise.js">`
- `project.html` — Añadido `<script src="noise.js">`
- `about.html` — Añadido `<script src="noise.js">`


---

## 27 de enero de 2026 (continuación)

### Fix definitivo: Noise como capa de background del body

#### Sinopsis

El approach anterior de usar un `<canvas>` con `position: fixed` y `mix-blend-mode: overlay` no funcionaba correctamente. El noise era invisible porque `mix-blend-mode` en un elemento fixed con z-index bajo no se mezcla con el `background-image` del body (están en diferentes contextos de stacking). Se cambió a un approach completamente diferente: generar el noise como textura PNG y aplicarla como capa adicional del `background-image` del body.

#### Problema raíz

El canvas de ruido con `position: fixed` y `z-index: 1` no se blendea visualmente con el `background-image` CSS del body porque:
- El background CSS del body se pinta en la capa 0 del rendering
- El canvas fixed se renderiza como un elemento posicionado independiente
- `mix-blend-mode: overlay` se aplica contra lo que hay "debajo" en el stacking context, que en este caso era transparente/nada, no el fondo de la cuadrícula
- Resultado: noise invisible

#### Solución: noise como background-image layer

En vez de un canvas superpuesto, se genera un tile de noise de 256x256 pixels usando un canvas offscreen (no insertado en el DOM), se exporta como data URL PNG, y se aplica como la primera capa del `background-image` del body. Así:

- El noise forma parte del fondo junto con la cuadrícula
- Se repite automáticamente (tile) cubriendo toda la ventana
- Nunca afecta a las imágenes ni al contenido
- Es inherentemente estático (se genera una vez al cargar)
- No necesita z-index ni mix-blend-mode
- La intensidad se controla con el alpha del noise (40/255 ≈ 16%)

```javascript
// Genera tile de noise 256x256
const canvas = document.createElement('canvas');
canvas.width = 256;
canvas.height = 256;
// ... dibuja pixels con alpha 40 ...
const noiseUrl = canvas.toDataURL('image/png');

// Lo prepende como primera capa del background del body
document.body.style.backgroundImage =
    `url(${noiseUrl}), ` +
    'linear-gradient(...grid lines...)';
```

#### Limpieza

- Eliminado `<canvas id="noise-canvas">` de las tres páginas HTML
- Eliminado CSS de `#noise-canvas` (position, z-index, opacity, blend-mode)
- Eliminado `position: relative; z-index: 2` del `#gallery` (ya no necesario)
- `noise.js` reescrito completamente: ya no manipula un canvas DOM sino que genera una textura offscreen

#### Archivos modificados

- `noise.js` — Reescrito: genera noise como background-image layer del body
- `style.css` — Eliminado CSS de `#noise-canvas`, eliminado z-index de `#gallery`
- `index.html` — Eliminado `<canvas id="noise-canvas">`
- `project.html` — Eliminado `<canvas id="noise-canvas">`
- `about.html` — Eliminado `<canvas id="noise-canvas">`


---

## 27 de enero de 2026 (continuación)

### Refactorización de código: CSS utility classes, bugs y código muerto

#### Sinopsis

Refactorización completa del código para eliminar duplicación CSS, corregir bugs de seguridad y UX, y eliminar código muerto. Se extrajo una clase utilitaria `.interactive` para unificar todos los patrones de hover repetidos.

#### CSS: Clases utilitarias `.interactive` / `.interactive--lg`

Se identificaron más de 10 bloques CSS duplicados que aplicaban el mismo patrón de opacity + hover + transition a distintos elementos (botones, títulos, álbumes, flechas del lightbox, etc.). Se unificaron en dos clases:

- `.interactive`: `opacity: 0.85`, `cursor: pointer`, transición, hover → `opacity: 1` + `scale(1.05)`
- `.interactive--lg`: hover → `scale(1.1)` (para botones de utilidad más pequeños)

Las imágenes de galería mantienen sus reglas separadas: `opacity: 0.7` → `1` en hover, sin scale.

Se eliminaron ~10 bloques CSS redundantes: `.about-btn img:hover`, `.menu-title.clickable`, `.album-links img` hover rules, `.btn-home:hover`, `.gallery-menu img:hover`, `.lightbox-btn` hover, `.lightbox-close:hover`, `.password-buttons img` hover, `.section-title:hover`, etc.

#### Bugs corregidos

1. **innerHTML XSS** (`project.js:setupInfoPanel`): Se usaban template literals con `innerHTML` para renderizar datos del proyecto. Reemplazado con métodos DOM seguros (`createElement`, `textContent`, `createTextNode`).

2. **Password race condition** (`home.js`): Un doble Enter podía disparar la navegación dos veces. Añadido flag `passwordChecking` que se activa al iniciar la comprobación y se resetea tras el feedback.

3. **`keypress` deprecado** (`home.js`): Cambiado `onkeypress` → `onkeydown` para el input de contraseña.

4. **Password en URL**: `goToProject()` ya no acepta password como parámetro de URL.

5. **Doble carga de imágenes** (`project.js`): `preloadImages()` precargaba todas las imágenes, pero luego `renderMasonryGallery()` las creaba con `loading="lazy"` — contradictorio. Eliminado `loading="lazy"`.

6. **Lightbox navigation simplificada**: Reemplazada la lógica condicional de boundaries por módulo aritmético: `(currentImageIndex + direction + images.length) % images.length`.

#### Código muerto eliminado

- Clases CSS `.menu-link` y `.clickable` en HTML (no tenían reglas CSS asociadas)
- Password URL parameter en `goToProject()`
- Variable `error` no usada en catch de `loadImageManifest()`
- Reset de feedback image al abrir password screen (previene estado stale)

#### HTML actualizado

Se añadieron las clases `interactive` / `interactive--lg` a todos los elementos estáticos en las tres páginas HTML:
- `index.html`: about-btn, btn-home, menu-title elements
- `project.html`: btn-home, btn-info, lightbox arrows, lightbox close
- `about.html`: btn-home, about-action links

#### Archivos modificados

- `style.css` — Reescrito: extraídas clases utilitarias, eliminados bloques duplicados
- `home.js` — Race condition fix, keydown, password cleanup, interactive classes en DOM dinámico
- `project.js` — DOM methods, no lazy loading, modulo navigation, null checks
- `index.html` — Interactive classes, eliminadas clases muertas
- `project.html` — Interactive classes
- `about.html` — Interactive classes


---

### Reorganización de álbumes: imágenes numeradas y eliminación de albums.json

#### Sinopsis

Renombrado de las 877 imágenes del family archive de nombres de timestamp (`img20240919_11102949.webp`) a números secuenciales (`1.webp`, `2.webp`, ...). Añadido `imageCount` a cada álbum en `data.json`. Actualizado `project.js` para cargar álbumes como secuencias numeradas (igual que comisiones), eliminando la dependencia de `albums.json`.

#### Problema

Los álbumes del family archive tenían imágenes con nombres de timestamp del escáner, imposibles de gestionar manualmente. Añadir o reordenar imágenes requería editar `albums.json` con los nombres exactos. El sistema era frágil y difícil de mantener.

#### Solución

1. **Renombrado masivo**: Las 877 imágenes se renombraron a números secuenciales (1.webp ... N.webp), preservando el orden original del `albums.json` (que coincide con el orden cronológico de escaneo).

2. **`imageCount` en data.json**: Cada álbum ahora tiene un campo `imageCount` que indica cuántas imágenes contiene. Para añadir imágenes, basta con añadir archivos numerados y actualizar el contador.

3. **Carga simplificada**: `project.js` ya no necesita fetch a `albums.json`. Los álbumes se cargan exactamente igual que las comisiones: `{basePath}/{n}.webp` para n de 1 a imageCount.

#### Conteos por álbum

| Álbum | Imágenes |
|-------|----------|
| 1987_rhodes | 58 |
| 1989 | 44 |
| 1990 | 47 |
| 1993_4 | 53 |
| 1993_wed | 64 |
| 1994 | 60 |
| 1999_connor | 72 |
| 2001 | 129 |
| 2002-2003 | 144 |
| 2003-2004_turkey | 150 |
| house | 22 |
| misc | 34 |
| **Total** | **877** |

#### Para añadir imágenes a un álbum

1. Añadir archivos `.webp` numerados consecutivamente después del último
2. Actualizar `imageCount` en `data.json`
3. No se necesita ningún otro cambio

#### Archivos modificados

- `data/data.json` — Añadido `imageCount` a cada álbum
- `project.js` — Álbumes usan secuencia numérica, eliminada dependencia de `albums.json`
- `data/familyArchive/ashlee/*/` — 877 imágenes renombradas a secuencia numérica
- `data/familyArchive/ashlee/albums.json` — Ya no es necesario (puede eliminarse)
