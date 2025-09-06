# Countries API

This document covers the countries and locations endpoints for managing shipping destinations and service availability.

## Base URL
`/api/v1/country`

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/country` | Get all supported countries | No |
| GET | `/country/{id}` | Get specific country details | No |
| GET | `/country/{id}/cities` | Get cities in country | No |
| GET | `/country/search` | Search countries by name/code | No |
| POST | `/country` | Add new country (Admin) | Yes (Admin) |
| PUT | `/country/{id}` | Update country (Admin) | Yes (Admin) |
| DELETE | `/country/{id}` | Remove country (Admin) | Yes (Admin) |

---

## Get All Countries

### **GET** `/api/v1/country`

Retrieve all countries supported for shipping services.

#### Request Headers
```http
Content-Type: application/json
```

#### Query Parameters
- `active` (boolean, optional) - Filter by active status (default: true)
- `region` (string, optional) - Filter by region (`Asia`, `Europe`, `North America`, etc.)
- `serviceType` (string, optional) - Filter by supported service (`DHL`, `FedEx`, `UPS`, `Aramex`)
- `sort` (string, optional) - Sort by field (`name`, `code`, `region`) - default: `name`
- `order` (string, optional) - Sort order (`asc`, `desc`) - default: `asc`
- `fields` (string, optional) - Comma-separated fields to include

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Countries retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "countries": [
      {
        "id": "6744b8c1234567890abcdef1",
        "name": "Bangladesh",
        "code": "BD",
        "alpha3": "BGD",
        "numericCode": "050",
        "flag": "🇧🇩",
        "flagUrl": "https://cdn.zypco.com/flags/bd.svg",
        "region": "Asia",
        "subregion": "Southern Asia",
        "capital": "Dhaka",
        "currency": {
          "code": "BDT",
          "name": "Bangladeshi Taka",
          "symbol": "৳"
        },
        "phoneCode": "+880",
        "timezone": "Asia/Dhaka",
        "coordinates": {
          "latitude": 23.684994,
          "longitude": 90.356331
        },
        "services": {
          "available": ["DHL Express", "FedEx", "UPS", "Aramex"],
          "domestic": true,
          "international": true,
          "restrictions": []
        },
        "shipping": {
          "zones": ["Zone A", "Zone B"],
          "transitDays": {
            "express": "2-3 days",
            "standard": "5-7 days"
          },
          "customsClearance": true,
          "documentsRequired": ["Commercial Invoice", "Packing List"]
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": "6744b8c1234567890abcdef2",
        "name": "United Kingdom",
        "code": "GB",
        "alpha3": "GBR",
        "numericCode": "826",
        "flag": "🇬🇧",
        "flagUrl": "https://cdn.zypco.com/flags/gb.svg",
        "region": "Europe",
        "subregion": "Northern Europe",
        "capital": "London",
        "currency": {
          "code": "GBP",
          "name": "British Pound",
          "symbol": "£"
        },
        "phoneCode": "+44",
        "timezone": "Europe/London",
        "coordinates": {
          "latitude": 55.378051,
          "longitude": -3.435973
        },
        "services": {
          "available": ["DHL Express", "FedEx", "UPS"],
          "domestic": true,
          "international": true,
          "restrictions": ["Lithium batteries require special handling"]
        },
        "shipping": {
          "zones": ["Zone C"],
          "transitDays": {
            "express": "1-2 days",
            "standard": "3-5 days"
          },
          "customsClearance": true,
          "documentsRequired": ["Commercial Invoice", "Certificate of Origin"]
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "summary": {
      "totalCountries": 195,
      "activeCountries": 187,
      "regionDistribution": {
        "Asia": 48,
        "Europe": 44,
        "Africa": 54,
        "North America": 23,
        "South America": 12,
        "Oceania": 16
      },
      "serviceAvailability": {
        "DHL Express": 156,
        "FedEx": 142,
        "UPS": 138,
        "Aramex": 89
      }
    }
  }
}
```

#### Features
- **Real-time service availability** based on current partnerships
- **Shipping zone classification** for pricing calculations
- **Customs requirements** and documentation needed
- **Transit time estimates** for different service levels
- **Shipping restrictions** and prohibited items

---

## Get Country Details

### **GET** `/api/v1/country/{id}`

Get detailed information about a specific country.

#### Path Parameters
- `id` (string, required) - Country ObjectId or ISO code

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Country details retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "country": {
      "id": "6744b8c1234567890abcdef1",
      "name": "Bangladesh",
      "code": "BD",
      "alpha3": "BGD",
      "numericCode": "050",
      "flag": "🇧🇩",
      "flagUrl": "https://cdn.zypco.com/flags/bd.svg",
      "region": "Asia",
      "subregion": "Southern Asia",
      "capital": "Dhaka",
      "officialName": "People's Republic of Bangladesh",
      "nativeName": "বাংলাদেশ",
      "population": 164689383,
      "area": 147570,
      "languages": [
        {
          "code": "bn",
          "name": "Bengali",
          "nativeName": "বাংলা"
        }
      ],
      "currency": {
        "code": "BDT",
        "name": "Bangladeshi Taka",
        "symbol": "৳",
        "exchangeRate": 110.25
      },
      "phoneCode": "+880",
      "timezone": "Asia/Dhaka",
      "utcOffset": "+06:00",
      "coordinates": {
        "latitude": 23.684994,
        "longitude": 90.356331,
        "bounds": {
          "north": 26.636,
          "south": 20.670,
          "east": 92.673,
          "west": 88.028
        }
      },
      "services": {
        "available": ["DHL Express", "FedEx", "UPS", "Aramex"],
        "domestic": true,
        "international": true,
        "restrictions": [
          "Alcoholic beverages prohibited",
          "Firearms and ammunition restricted",
          "Certain electronics require permits"
        ],
        "customsInfo": {
          "dutyFreeLimit": 500,
          "currency": "USD",
          "declarationRequired": true,
          "processingTime": "1-2 business days"
        }
      },
      "shipping": {
        "zones": ["Zone A", "Zone B"],
        "transitDays": {
          "express": "2-3 days",
          "standard": "5-7 days",
          "economy": "10-14 days"
        },
        "customsClearance": true,
        "documentsRequired": [
          "Commercial Invoice",
          "Packing List",
          "Certificate of Origin",
          "Import License (for restricted items)"
        ],
        "workingHours": {
          "customs": "Sunday-Thursday: 9:00-17:00",
          "delivery": "Sunday-Thursday: 8:00-18:00, Friday: 8:00-12:00"
        }
      },
      "addresses": {
        "format": "{name}\\n{address}\\n{city}, {postal}\\n{country}",
        "postalCodePattern": "^[0-9]{4}$",
        "requiresState": false,
        "statesRequired": false
      },
      "holidays": [
        {
          "date": "2024-02-21",
          "name": "International Mother Language Day",
          "type": "national"
        },
        {
          "date": "2024-03-26",
          "name": "Independence Day",
          "type": "national"
        }
      ],
      "statistics": {
        "ordersCount": 1247,
        "totalValue": 156780.50,
        "popularDestinations": [
          { "country": "United Kingdom", "count": 345 },
          { "country": "United States", "count": 287 },
          { "country": "Canada", "count": 198 }
        ],
        "averageDeliveryTime": "4.2 days"
      },
      "isActive": true,
      "lastUpdated": "2024-01-15T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Get Cities in Country

### **GET** `/api/v1/country/{id}/cities`

Get list of major cities in a specific country.

#### Path Parameters
- `id` (string, required) - Country ObjectId or ISO code

#### Query Parameters
- `limit` (number, optional) - Number of cities to return (default: 50, max: 200)
- `search` (string, optional) - Search cities by name
- `major` (boolean, optional) - Only major cities (population > 100k)
- `postal` (boolean, optional) - Include postal code information

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Cities retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "cities": [
      {
        "id": "city_dhaka_001",
        "name": "Dhaka",
        "localName": "ঢাকা",
        "type": "capital",
        "population": 9540000,
        "coordinates": {
          "latitude": 23.8103,
          "longitude": 90.4125
        },
        "postalCodes": ["1000", "1001", "1205", "1207"],
        "districts": [
          "Dhanmondi", "Gulshan", "Uttara", "Old Dhaka"
        ],
        "services": {
          "pickup": true,
          "delivery": true,
          "warehouse": true
        },
        "deliveryZones": [
          {
            "name": "Central Dhaka",
            "areas": ["Dhanmondi", "New Market", "Shahbagh"],
            "deliveryTime": "same-day"
          },
          {
            "name": "Greater Dhaka",
            "areas": ["Uttara", "Mirpur", "Gulshan"],
            "deliveryTime": "next-day"
          }
        ]
      },
      {
        "id": "city_chittagong_001", 
        "name": "Chittagong",
        "localName": "চট্টগ্রাম",
        "type": "major",
        "population": 2592439,
        "coordinates": {
          "latitude": 22.3569,
          "longitude": 91.7832
        },
        "postalCodes": ["4000", "4100", "4200"],
        "port": {
          "available": true,
          "type": "seaport",
          "customsFacility": true
        },
        "services": {
          "pickup": true,
          "delivery": true,
          "warehouse": false
        }
      }
    ],
    "summary": {
      "totalCities": 64,
      "majorCities": 12,
      "capitalCity": "Dhaka",
      "coverageArea": "98.5%"
    }
  }
}
```

---

## Search Countries

### **GET** `/api/v1/country/search`

Search countries by name, code, or region.

#### Query Parameters
- `q` (string, required) - Search query (minimum 2 characters)
- `type` (string, optional) - Search type (`name`, `code`, `region`, `all`) - default: `all`
- `active` (boolean, optional) - Only active countries (default: true)
- `limit` (number, optional) - Maximum results (default: 10, max: 50)

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Search results retrieved successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "query": "united",
    "results": [
      {
        "id": "6744b8c1234567890abcdef2",
        "name": "United Kingdom",
        "code": "GB",
        "flag": "🇬🇧",
        "region": "Europe",
        "capital": "London",
        "matchType": "name",
        "score": 0.95
      },
      {
        "id": "6744b8c1234567890abcdef3",
        "name": "United States",
        "code": "US", 
        "flag": "🇺🇸",
        "region": "North America",
        "capital": "Washington, D.C.",
        "matchType": "name",
        "score": 0.95
      },
      {
        "id": "6744b8c1234567890abcdef4",
        "name": "United Arab Emirates",
        "code": "AE",
        "flag": "🇦🇪",
        "region": "Asia",
        "capital": "Abu Dhabi",
        "matchType": "name",
        "score": 0.90
      }
    ],
    "totalResults": 3,
    "searchTime": "0.045s"
  }
}
```

---

## Service Availability

### **GET** `/api/v1/country/service-matrix`

Get service availability matrix between countries.

#### Query Parameters
- `from` (string, optional) - Origin country ID or code
- `to` (string, optional) - Destination country ID or code
- `service` (string, optional) - Specific service type

#### Success Response (200)
```json
{
  "status": "200",
  "message": "Service matrix retrieved successfully",
  "data": {
    "matrix": {
      "BD": {
        "GB": {
          "available": ["DHL Express", "FedEx", "UPS"],
          "transitDays": {
            "DHL Express": "2-3 days",
            "FedEx": "3-4 days",
            "UPS": "3-5 days"
          },
          "pricing": {
            "baseRate": 25.00,
            "currency": "USD"
          },
          "restrictions": [
            "Maximum weight: 30kg per package",
            "Batteries require special documentation"
          ]
        },
        "US": {
          "available": ["DHL Express", "FedEx"],
          "transitDays": {
            "DHL Express": "3-4 days",
            "FedEx": "4-5 days"
          },
          "restrictions": [
            "Food items prohibited",
            "Electronics require customs declaration"
          ]
        }
      }
    }
  }
}
```

---

## Admin Operations

### **POST** `/api/v1/country` (Admin Only)

Add a new country to the system.

#### Request Headers
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "New Country",
  "code": "NC",
  "alpha3": "NCY",
  "numericCode": "999",
  "region": "Asia",
  "subregion": "Southern Asia",
  "capital": "Capital City",
  "currency": {
    "code": "NCR",
    "name": "New Currency",
    "symbol": "₦"
  },
  "phoneCode": "+999",
  "timezone": "Asia/NewCountry",
  "coordinates": {
    "latitude": 25.0,
    "longitude": 85.0
  },
  "services": {
    "available": ["DHL Express"],
    "domestic": true,
    "international": true
  },
  "isActive": true
}
```

#### Success Response (201)
```json
{
  "status": "201",
  "message": "Country added successfully",
  "data": {
    "country": {
      "id": "6744b8c1234567890abcdef11",
      "name": "New Country",
      "code": "NC",
      "isActive": true,
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  }
}
```

---

## Shipping Zones & Pricing

### Zone Classification
- **Zone A**: Domestic shipping within same country
- **Zone B**: Regional shipping (neighboring countries)
- **Zone C**: International shipping (same continent)
- **Zone D**: Intercontinental shipping
- **Zone E**: Remote/island destinations

### Transit Time Factors
- **Service Type**: Express vs Standard vs Economy
- **Origin/Destination**: Urban vs Rural delivery
- **Customs Clearance**: Required documentation and processing time
- **Working Days**: Exclude weekends and local holidays
- **Weather Conditions**: Seasonal delays and restrictions

### Customs & Regulations
- **Import Duties**: Based on item category and declared value
- **Documentation**: Required forms and certificates
- **Prohibited Items**: Country-specific restrictions
- **Inspection Rates**: Statistical likelihood of customs inspection

---

## Rate Limiting & Caching

### Rate Limits
- **Public endpoints**: 100 requests/minute per IP
- **Search endpoint**: 50 requests/minute per IP
- **Admin endpoints**: 200 requests/minute per user

### Caching Strategy
- **Country data**: Cached for 24 hours (rarely changes)
- **Service availability**: Cached for 1 hour (can change)
- **Exchange rates**: Updated every 30 minutes
- **Holiday data**: Cached until next holiday update

---

## Integration Features

### Third-Party APIs
- **Geographic data**: Integration with mapping services
- **Currency rates**: Real-time exchange rate updates  
- **Holiday calendars**: Automatic holiday data synchronization
- **Postal systems**: Address validation and postal code verification

### Webhooks
- **Service changes**: Notify when service availability changes
- **New countries**: Alert when new shipping destinations added
- **Rate updates**: Notify of pricing or transit time changes

---

**Last Updated:** January 15, 2024