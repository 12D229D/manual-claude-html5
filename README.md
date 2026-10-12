# Manual de Referencia de Claude (HTML5)

Manual web estático de referencia completa para **Claude Code** y el modelo **Claude** — comandos, configuración, agentes, skills, hooks, MCP, prompting avanzado y mejores prácticas.

## 🚀 Inicio Rápido

### Opción A: Doble clic (más simple)
```bash
# Navega a la carpeta y haz doble clic en index.html
# O desde terminal:
cd manual-claude-html5
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

### Opción B: Servidor local (recomendado para búsqueda y hash routing)
```bash
# Python 3
cd manual-claude-html5
python -m http.server 8000
# Abre http://localhost:8000

# Node.js (npx)
npx serve .

# PHP
php -S localhost:8000
```

> **Nota**: El hash routing (`#introduccion`, `#comandos-cli`, etc.) funciona mejor con servidor local. En `file://` algunos navegadores bloquean el historial.

## 📂 Estructura del Proyecto

```
manual-claude-html5/
├── index.html          # SPA principal (11 secciones con hash routing)
├── css/
│   └── styles.css      # Sistema de diseño completo (dark/light, glassmorphism, tokens HSL)
├── js/
│   └── app.js          # Router, search, tabs, copy-code, theme, progress, mobile
├── plan.md             # Plan de trabajo y bitácora
└── README.md           # Este archivo
```

## 🧭 Navegación

| Sección | Hash | Descripción |
|---------|------|-------------|
| **Introducción** | `#introduccion` | Qué es Claude Code, instalación, auth, primeros pasos |
| **Comandos CLI** | `#comandos-cli` | Flags, subcomandos, slash commands, ejemplos CI/CD |
| **Configuración** | `#configuracion` | `settings.json`, `CLAUDE.md`, precedencia, env vars |
| **Agentes** | `#agentes` | Subagentes built-in, custom agents, `AGENTS.md` |
| **Skills** | `#skills` | Estructura, manifiesto SKILL.md, descubrimiento, ejemplos |
| **Slash Commands** | `#slash-commands` | Crear comandos personalizados, namespaces, argumentos |
| **Hooks** | `#hooks` | 7 eventos, matcher, variables env, debugging, ejemplos |
| **MCP** | `#mcp` | Servidores oficiales, configuración, servidor custom Python |
| **Prompting Avanzado** | `#prompting-avanzado` | CoT, XML tags, system prompts, patrones, ejemplos |
| **Workflow** | `#workflow` | Git flow, testing, CI/CD con Claude review, estructura proyecto |
| **Troubleshooting** | `#troubleshooting` | Errores comunes, performance, debugging, FAQ |
| **Recursos** | `#recursos` | Docs oficiales, MCP, comunidad, cheatsheet comandos |

### Atajos de Navegación
- **Sidebar**: Clic en cualquier enlace de la navegación lateral
- **URL directa**: `index.html#configuracion` abre la sección directamente
- **Navegador**: Botones Atrás/Adelante funcionan (historial preservado)

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl/Cmd + K` | Enfocar búsqueda |
| `Ctrl/Cmd + Shift + L` | Alternar tema claro/oscuro |
| `Escape` | Cerrar búsqueda / sidebar móvil |
| `Tab` / `Shift+Tab` | Navegar tabs (cuando enfocados) |
| `←` / `→` | Cambiar tab activo |
| `Enter` / `Espacio` | Abrir FAQ / seleccionar resultado búsqueda |

## 🔍 Búsqueda en Tiempo Real

1. Presiona `Ctrl/Cmd + K` o clic en la barra de búsqueda
2. Escribe mínimo 2 caracteres
3. Resultados aparecen instantáneamente (secciones, headings, código)
4. `↑` `↓` para navegar, `Enter` para ir a la sección
5. `Escape` para cerrar

## 🎨 Temas

- **Claro** (por defecto) / **Oscuro** — Persistido en `localStorage`
- Toggle: botón ☀️/🌙 en header o `Ctrl/Cmd + Shift + L`
- Respeta `prefers-color-scheme` en primera visita

## 📋 Progreso de Lectura

- **Anillo de progreso** en sidebar inferior (0–100%)
- Se marca sección como "leída" al hacer scroll sobre ella (IntersectionObserver)
- Persistido en `localStorage` entre sesiones
- Reiniciar: borrar `claude-manual-read` en DevTools → Application → Local Storage

## 📋 Copiar Código

- Cada bloque de código tiene botón **Copiar** (esquina sup. der.)
- Feedback visual: "✓ Copiado" por 2s
- Funciona sin servidor (Clipboard API + fallback `execCommand`)

## 📱 Responsive

- **Desktop (≥768px)**: Sidebar fija a la izquierda
- **Móvil (<768px)**: Sidebar colapsable — botón ☰ en header
- Overlay semitransparente al abrir sidebar en móvil
- Tablas con scroll horizontal en móvil

## ♿ Accesibilidad

- HTML5 semántico (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`)
- **Un solo `<h1>`** en header principal
- `lang="es"`, `aria-label` en controles interactivos
- `aria-expanded`, `aria-controls`, `aria-selected` en tabs, search, FAQ
- `role="progressbar"` en anillo de progreso
- `focus-visible` en todos los elementos interactivos
- Skip link "Saltar al contenido principal"
- Contraste AA en ambos temas

## 🛠️ Tecnologías

- **HTML5** semántico — sin frameworks
- **CSS Vanilla** — Custom Properties (tokens HSL), Grid/Flex, Container Queries ready
- **JavaScript Vanilla (ESM)** — IIFE, sin dependencias, ~500 líneas
- **Fuentes**: Inter (UI) + JetBrains Mono (código) vía Google Fonts
- **Iconos**: SVG inline (sin fuentes de iconos externas)

## 🧪 Verificación Manual

```bash
# 1. Abrir en navegador
# 2. Verificar:
#    ✅ Navegación sidebar + hash routing + botones atrás/adelante
#    ✅ Búsqueda (Ctrl+K) filtra en tiempo real
#    ✅ Tabs funcionan (teclado + mouse)
#    ✅ Copy code → portapapeles + feedback
#    ✅ Theme toggle persiste (recargar página)
#    ✅ Progress ring actualiza al leer secciones
#    ✅ Mobile: sidebar abre/cierra, overlay, resize
#    ✅ FAQ acordeón (teclado + mouse)
#    ✅ Dark mode: colores, sombras, código legible
#    ✅ Sin errores en consola
```

## 📝 Créditos y Fuentes

- **Documentación oficial**: https://docs.anthropic.com/en/docs/claude-code
- **Repositorio**: https://github.com/anthropics/claude-code
- **MCP Spec**: https://modelcontextprotocol.io
- **MCP Servers**: https://github.com/modelcontextprotocol/servers
- **Claude Code Awesome**: https://github.com/anthropics/claude-code-awesome

## 📄 Licencia

Este manual es una guía de referencia comunitaria basada en documentación pública de Anthropic. No es un producto oficial de Anthropic.

---

**Versión**: 1.0.0  
**Última actualización**: 2026-07-28  
**Compatibilidad**: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 15+, Edge 90+)