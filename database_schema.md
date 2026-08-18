# Database Schema Definition - STOP & GO Tyre Care

## 1. `JobCard` Entity
```json
{
  "id": "SG-2026-1001",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "customerName": "String",
  "mobile": "String (10 digits)",
  "vehicleName": "String (e.g. Hyundai Creta White)",
  "year": "String (e.g. 2023)",
  "odometer": "String / Number (KM)",
  "services": [
    {
      "id": "wheelAlignment",
      "name": "String",
      "amount": 350,
      "details": "Object (optional breakdown)"
    }
  ],
  "subtotal": "Number",
  "discount": "Number",
  "total": "Number",
  "paymentMethod": "Cash | UPI / QR Code | Card",
  "status": "Completed | In Progress"
}
```

## 2. `Customer` Entity (Derived & Indexed)
```json
{
  "mobile": "9876543210",
  "name": "Rajesh Sharma",
  "vehicleName": "Hyundai Creta",
  "year": "2023",
  "totalVisits": 3,
  "totalSpent": 2850,
  "lastVisitDate": "2026-08-18",
  "lastOdometer": "28,450"
}
```

## 3. `InventoryItem` Entity
```json
{
  "id": "sticker_weights | brass_weights | tyre_valves | nitrogen_tank",
  "name": "String",
  "unit": "Grams | Pieces | Bar Pressure",
  "inStock": "Number",
  "minAlert": "Number"
}
```

## 4. `AnalyticsSummary` Schema
```json
{
  "todayRevenue": "Number",
  "todayVehicles": "Number",
  "paymentSplit": {
    "cash": "Number",
    "upi": "Number"
  },
  "topServices": [
    { "name": "Wheel Alignment", "count": 14 },
    { "name": "Wheel Balancing", "count": 12 }
  ]
}
```
