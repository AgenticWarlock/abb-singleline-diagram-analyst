# Arquitectura POC Agencia de Viajes

## Visión
La POC separa claramente UI, contrato de eventos y transporte del agente para poder cambiar de mock a Direct Line sin romper componentes.

## Capas
- `app/`: composición principal de pantalla y endpoint placeholder.
- `components/chat`: experiencia conversacional.
- `components/travel`: UI rica (fechas + vuelos).
- `lib/agent`: interfaz `AgentTransport`, implementaciones y contratos.
- `lib/mock`: datos simulados de vuelos.
- `tests/`: pruebas de contrato y transporte mock.

## Flujo principal
1. Usuario envía "Quiero viajar a Roma".
2. `MockAgentTransport.sendMessage` responde con `ui.showMessage`.
3. El mock emite `ui.showDatePicker`.
4. La UI confirma rango y emite `ui.datesSelected`.
5. El mock emite `ui.showFlights` con datos simulados.
6. El usuario selecciona vuelo y UI emite `ui.flightSelected`.
7. El mock confirma en chat con `ui.showMessage`.

## Evolución a Fase 2
- Sustituir `MockAgentTransport` por `DirectLineTransport`.
- Implementar `/api/copilot/token` con conexión a Copilot Studio.
- Mantener contratos de eventos para minimizar impacto en la UI.
