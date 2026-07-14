# Event Contract (POC Fase 1)

## Objetivo
Definir un contrato cerrado entre UI y agente para un transporte simulado.

## Reglas
- Todos los eventos usan discriminated unions (`type`) y payload tipado.
- Todos los payloads se validan con Zod antes de consumirse.
- `ui.showMessage` no permite HTML en `payload.text`.

## Agente -> UI

### ui.showDatePicker
```json
{
  "type": "ui.showDatePicker",
  "payload": {
    "destination": "Roma",
    "hint": "Selecciona fecha de ida y vuelta"
  }
}
```

### ui.showFlights
```json
{
  "type": "ui.showFlights",
  "payload": {
    "destination": "Roma",
    "fromDate": "2026-10-12",
    "toDate": "2026-10-18",
    "flights": []
  }
}
```

### ui.showMessage
```json
{
  "type": "ui.showMessage",
  "payload": {
    "text": "Texto plano sin HTML"
  }
}
```

## UI -> Agente

### ui.datesSelected
```json
{
  "type": "ui.datesSelected",
  "payload": {
    "origin": "Madrid",
    "destination": "Roma",
    "fromDate": "2026-10-12",
    "toDate": "2026-10-18"
  }
}
```

### ui.flightSelected
```json
{
  "type": "ui.flightSelected",
  "payload": {
    "flightId": "AZ-1452"
  }
}
```
