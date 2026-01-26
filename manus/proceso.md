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
