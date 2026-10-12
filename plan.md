# Plan — Manual de Referencia de Claude (HTML5)

Proyecto web estático (HTML5 + CSS + JavaScript vanilla) que documenta **Claude Code** y **Claude** (el modelo de IA): comandos, configuración, mejores prácticas, prompts útiles, patrones de uso avanzado y troubleshooting.

Todo el proyecto vive dentro de `manual-claude-html5/`. Ningún archivo debe quedar suelto en el directorio padre.

## 🏗️ Arquitectura

- **Patrón**: SPA monolítica vanilla con enrutamiento por hash (`#sección`) y 12 doc-sections.

## 🧠 Paradigma de Programación

- **Imperativo/Procedimental + Event-Driven**
- El router SPA, búsqueda fuzzy, tabs ARIA, copy-to-clipboard y FAQ accordion se implementan de forma **imperativa** con manipulación directa del DOM.
- Toda la interacción es **event-driven** (hashchange, popstate, click, keydown, IntersectionObserver).

---

## Estructura del proyecto

```
manual-claude-html5/
├── index.html          # Página principal (SPA por secciones con hash routing)
├── css/
│   └── styles.css      # Sistema de diseño (dark/light, sidebar, callouts, tabs, wizard)
├── js/
│   └── app.js          # Navegación, búsqueda, progreso, copia de código, asistente
├── plan.md             # Este archivo
└── README.md           # Cómo abrir y navegar el manual
```

---

## Fuente del contenido

El contenido se basa en:
- Documentación oficial: https://docs.anthropic.com/en/docs/claude-code
- Repositorio oficial: https://github.com/anthropics/claude-code
- CLAUDE.md del repo actual: `../CLAUDE.md`
- AGENTS.md del repo actual: `../AGENTS.md`
- Skills oficiales de claude-code (si existen en `~/.claude/` o similar)
- Model Context Protocol: https://modelcontextprotocol.io

---

## Secciones del manual (11 doc-sections en index.html)

| # | id | Título | Contenido clave |
|---|---|--------|-----------------|
| 01 | `introduccion` | Introducción a Claude Code | Qué es, instalación, auth, primeros pasos, conceptos clave |
| 02 | `comandos-cli` | Comandos CLI | Flags, subcomandos, slash commands, ejemplos CI/CD/headless |
| 03 | `configuracion` | Configuración | settings.json, CLAUDE.md, precedencia, env vars |
| 04 | `agentes` | Agentes y Subagentes | Built-in, custom agents, AGENTS.md, delegación |
| 05 | `skills` | Skills (Habilidades) | Estructura, SKILL.md, descubrimiento, ejemplos |
| 06 | `slash-commands` | Slash Commands | Definición, args, namespaces, ejemplos git/db/release |
| 07 | `hooks` | Hooks | 7 eventos, matcher, env vars, debugging, ejemplos |
| 08 | `mcp` | MCP (Model Context Protocol) | Servidores oficiales, config, servidor custom Python, troubleshooting |
| 09 | `prompting-avanzado` | Prompting Avanzado | CoT, few-shot, XML tags, system prompts, patrones |
| 10 | `workflow` | Workflow & Best Practices | Git flow, testing, CI/CD con Claude review, estructura proyecto |
| 11 | `troubleshooting` | Troubleshooting & FAQ | Errores comunes, performance, debugging, FAQ rápida |
| 12 | `recursos` | Recursos y Enlaces | Docs oficiales, MCP, comunidad, cheatsheet comandos |

---

## Features de la UI (implementadas en css/js)

- [x] Sidebar con buscador en vivo y barra de progreso de lectura
- [x] Navegación SPA con `#hash` y soporte back/forward (`popstate`)
- [x] Modo claro/oscuro persistente (`localStorage`)
- [x] Copia de bloques de código al portapapeles con feedback
- [x] Sección "marcar como leída" por sección → recalcula % progreso
- [x] Tabs para alternar ejemplos (bash, json, yaml, markdown)
- [x] Acordeón FAQ accesible (teclado + mouse)
- [x] Componentes visuales especiales:
  - `table.ref-table` — tablas de referencia (scopes, eventos, schemas)
  - `.callout` (info/warning/success/danger/tip) — avisos tipados
  - `.path-tree` — árbol de rutas de archivos con colores por scope
  - `.pitfall-list` / `.pitfall` — bloques numerados síntoma→causa→fix
- [x] Responsive: sidebar colapsable en móvil (< 768px)
- [x] Atajos de teclado: `Ctrl+K` (search), `Ctrl+Shift+L` (theme), `Esc` (close)

---

## Estado actual

- [x] Carpeta del proyecto creada: `manual-claude-html5/`
- [x] `css/styles.css` — completo (sistema de diseño + componentes especiales)
- [x] `js/app.js` — completo (router, búsqueda, tabs, copy, theme, progress, FAQ, mobile)
- [x] `plan.md` — este archivo
- [x] `index.html` — completo (11 secciones con todo el contenido, tablas, pitfalls, callouts, tabs, path-trees)
- [x] `README.md` — completo (instrucciones de apertura, tabla de hashes, features)

### ✅ Implementación completada — 2026-07-28

1. **`index.html`** — implementado:
   - `<head>` con fonts Inter + JetBrains Mono y `<link>` a `css/styles.css`
   - Sidebar con 12 `nav-link` agrupados en 4 grupos
   - 12 `doc-section` con contenido completo (tablas, pitfalls, árboles de rutas, callouts, tabs, code-blocks)
   - Estilos complementarios inline para elementos no cubiertos en el CSS original
2. **`css/styles.css`** — implementado:
   - Design tokens HSL (brand violet→purple→pink, neutral slate)
   - Dark/Light mode completo
   - Glassmorphism header/sidebar, sombras suaves, border-radius consistentes
   - Componentes: callout, ref-table, tabs, code-block (con header + copy btn), path-tree, pitfall, FAQ, resource-list
   - Animaciones: fadeInUp, fadeInDown, progress ring stroke-dashoffset
   - Responsive: mobile sidebar collapse, print styles
   - Accesibilidad: focus-visible, skip-link, aria-labels, contrast AA
3. **`js/app.js`** — implementado:
   - Hash router + nav link active state + popstate sync
   - Search en vivo (fuzzy simple) con resultados dropdown navegables por teclado
   - Tabs (ARIA) con teclado (←/→/Home/End)
   - Copy-to-clipboard (Clipboard API + fallback)
   - Theme toggle persistido + atajo `Ctrl+Shift+L`
   - Scroll spy + IntersectionObserver para progress ring
   - FAQ accordion (ARIA)
   - Mobile sidebar toggle + overlay
   - Keyboard shortcuts globales
   - Smooth scroll para anchor links
4. **`README.md`** — implementado con instrucciones, tabla de hashes, atajos, a11y, verificación

---

## Cómo abrirlo (sin build, sin dependencias)

Es HTML/CSS/JS 100% estático y sin dependencias. Cualquiera de estas vale:

```bash
# Opción A: doble clic en index.html (file://)
# Opción B: servidor estático desde la carpeta del proyecto
cd "C:/Users/IGD/Dropbox/Copias de seguridad/Codex/manual-claude-html5"
python -m http.server 8000
# luego abre http://localhost:8000
```

Navegación: clics en el sidebar o vía URL con `#introduccion`, `#comandos-cli`, `#mcp`, etc.
El progreso y el tema se guardan en `localStorage`.

---

## Convenciones / decisiones de diseño

- **Idioma**: español (igual que el resto de manuales del workspace: `manual-frontend-html5`, `git-manual-html5`, etc.)
- **Diseño**: se reutiliza el sistema visual del `manual-frontend-html5` con estos retoques:
  - Brand con gradiente violeta→cian→rosa
  - Nuevos componentes `.pitfall` y `.path-tree` para representar flujos de diagnóstico y rutas de archivos
- **Sin frameworks ni bundlers**: 100% vanilla, cero `node_modules`, cero build step
- **Accesibilidad básica**: `lang="es"`, `aria-label` en botones móviles, contraste suficiente en ambos temas

---

## Próximos pasos sugeridos (post-entrega)

- Validación cruzada del contenido: releer cada sección contra docs oficiales para que no quede nada desactualizado
- Capturas o diagramas del cliente Claude Code (Settings → MCP, /, Skills, Plugin Management) cuando estén disponibles
- Sección de "chuleta rápida" imprimible (una sola página con los 7 eventos de hook, el schema de mcp.servers, el orden de discovery, etc.)
- Posible integración con `zcode-guide` skill para asistente de diagnóstico interactivo estilo wizard
## 🌐 Propósito de Visibilidad y Destino Remoto

- **Visibilidad**: Público (Open Source / Portafolio).
- **Plataforma Remota Asignada**: GitHub.
- **Plataforma de Despliegue CI/CD**: GitHub Pages / Cloudflare Pages.
- **Justificación**: Manual y guía interactiva de referencia sobre Claude y Claude Code (CLI) sin backend; idóneo para GitHub Pages.

## 📊 Estado actual

🟢 **Completado** (Sincronizado en auditoría de portafolio).
