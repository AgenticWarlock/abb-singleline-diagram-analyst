# ABB Team Hub

Interfaz base construida con Next.js (App Router), React y TypeScript estricto.

El objetivo actual es ofrecer un frontal limpio para el equipo de ABB donde poder adjuntar imagenes y documentos PDF como punto de entrada.

## Alcance actual
- Pantalla principal orientada a "punto de contacto ABB".
- Chat tradicional para conversar con el agente.
- Adjuntos de imagenes y PDF desde el compositor.
- Conexion principal por Direct Line con Copilot Studio.
- `MockAgentTransport` disponible solo como fallback explicito para desarrollo.

## Stack
- Next.js + React + TypeScript
- Fluent UI (disponible para futuras integraciones)
- Vitest

## Comandos
```bash
npm install
npm run dev
```

Abrir en `http://localhost:3000`.

## Calidad
```bash
npm run lint
npm run test
npm run build
```

## Configuracion de transporte

Por defecto la app intenta conectar por Direct Line.

Configurar `.env.local` con:

```bash
COPILOT_TOKEN_ENDPOINT=<TOKEN ENDPOINT DE COPILOT STUDIO>
NEXT_PUBLIC_AGENT_AUTO_START_CONVERSATION=true
NEXT_PUBLIC_AGENT_START_EVENT_NAME=startConversation
NEXT_PUBLIC_AGENT_START_FALLBACK_MESSAGE=hola
NEXT_PUBLIC_AGENT_START_FALLBACK_DELAY_MS=2500
NEXT_PUBLIC_DIRECT_LINE_USE_WEBSOCKET=true
NEXT_PUBLIC_AGENT_DISPLAY_NAME=AISA
NEXT_PUBLIC_AGENT_SUBTITLE=AI-powered SLD Analyzer
NEXT_PUBLIC_AGENT_DESCRIPTION=Analiza diagramas unifilares, imagenes y PDF para detectar incidencias y resumir hallazgos.
```

Opcionalmente, para forzar el mock en desarrollo:

```bash
NEXT_PUBLIC_AGENT_TRANSPORT=mock
```

## Siguientes evoluciones sugeridas
- Persistir adjuntos en almacenamiento (Azure Blob, SharePoint o similar).
- Añadir envio de metadatos (proyecto, equipo, prioridad, notas).
- Conectar estos adjuntos a un flujo de analisis con agente.
