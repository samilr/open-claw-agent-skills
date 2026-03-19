# 🦞 AI Dev Team — OpenClaw Skill

Equipo de desarrollo de software con 6 agentes IA especializados, orquestados secuencialmente con **Claude Opus 4.6**.

## Agentes

| Agente | Rol | Output |
|--------|-----|--------|
| 📋 Product Manager | Analiza requerimientos | User stories, criterios de aceptación, MVP scope |
| 🏗️ Arquitecto | Diseña la solución técnica | Stack, arquitectura, modelos de datos, API |
| 🎨 Frontend Dev | Planifica la UI | Componentes, estado, pantallas, UX |
| ⚙️ Backend Dev | Diseña el backend | Endpoints, esquema DB, lógica de negocio |
| 🧪 QA Engineer | Asegura la calidad | Plan de pruebas, casos críticos, edge cases |
| 🚀 DevOps | Planifica el despliegue | Infraestructura, CI/CD, costos, timeline |

## Instalación

### Opción 1 — Instalación manual (recomendada)

```bash
# 1. Copia la carpeta del skill a tu directorio de OpenClaw
cp -r dev-team-skill/ ~/.openclaw/skills/dev-team/

# 2. Instala la dependencia de Node.js
cd ~/.openclaw/skills/dev-team/
npm install @anthropic-ai/sdk

# 3. Dale permisos de ejecución al script
chmod +x devteam.js
```

### Opción 2 — Pedirle a tu agente que lo instale

Envíale este mensaje a tu OpenClaw:

```
Instala este skill desde GitHub: [URL de tu repo]
```

## Configuración

Agrega tu API key en `~/.openclaw/openclaw.json`:

```json
{
  "skills": {
    "entries": {
      "dev-team": {
        "enabled": true,
        "env": {
          "ANTHROPIC_API_KEY": "sk-ant-tu-api-key-aqui"
        }
      }
    }
  }
}
```

> También puedes exportar la variable de entorno: `export ANTHROPIC_API_KEY=sk-ant-...`

## Uso

### Desde tu chat (WhatsApp, Telegram, Discord, etc.)

Simplemente describe tu proyecto:

```
Quiero construir una app de gestión de tareas para equipos remotos con 
notificaciones en tiempo real y reportes semanales automáticos.
```

O con frases directas:
```
Lanza el equipo de desarrollo para: sistema de reservas de restaurantes
Analiza este proyecto: marketplace de freelancers para LATAM
Plan this feature: real-time collaborative document editing
```

### Desde la terminal (directo)

```bash
node ~/.openclaw/skills/dev-team/devteam.js "Tu descripción del proyecto aquí"
```

## Output

El equipo genera:
- Análisis completo en el chat (streaming en tiempo real)
- Reporte guardado en `~/openclaw-reports/<proyecto>-<fecha>.md`

## Estructura del Skill

```
dev-team/
├── SKILL.md       ← Instrucciones para el agente OpenClaw
├── devteam.js     ← Orquestador Node.js (llama a Claude Opus 4.6)
├── package.json   ← Dependencias
└── README.md      ← Este archivo
```

## Requisitos

- OpenClaw instalado y funcionando
- Node.js 18+
- API key de Anthropic (claude-opus-4-6 requiere acceso a la API)
- ~$0.05–0.15 USD por análisis completo (6 agentes × tokens)
