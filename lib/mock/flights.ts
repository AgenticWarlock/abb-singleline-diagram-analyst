import type { FlightOption } from "@/lib/agent/eventTypes";

export const romeFlights: FlightOption[] = [
  {
    id: "AZ-1452",
    airline: "ITA Airways",
    origin: "MAD",
    destination: "FCO",
    departureTime: "08:10",
    arrivalTime: "10:35",
    duration: "2h 25m",
    stops: 0,
    priceEur: 182,
  },
  {
    id: "IB-3221",
    airline: "Iberia",
    origin: "MAD",
    destination: "FCO",
    departureTime: "13:20",
    arrivalTime: "15:55",
    duration: "2h 35m",
    stops: 0,
    priceEur: 209,
  },
  {
    id: "LH-1129",
    airline: "Lufthansa",
    origin: "MAD",
    destination: "FCO",
    departureTime: "17:45",
    arrivalTime: "21:05",
    duration: "3h 20m",
    stops: 1,
    priceEur: 164,
  },
];
