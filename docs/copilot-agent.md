# copilot-agent

Directorio reservado para la futura integración con Copilot Studio / Direct Line.

Estado actual:
- `MockAgentTransport` es el modo predeterminado para desarrollo local.
- `DirectLineTransport` conecta con Copilot Studio cuando `NEXT_PUBLIC_AGENT_TRANSPORT=directline` y el endpoint de token está configurado.
- `app/api/copilot/token/route.ts` valida y reenvía el token configurado con `COPILOT_TOKEN_ENDPOINT`.
