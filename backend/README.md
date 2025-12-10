# IPO Tracker Backend API

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

Server will run on http://localhost:5000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ipo` | Get all IPOs |
| GET | `/api/ipo/:id` | Get IPO by ID |
| POST | `/api/ipo` | Add new IPO |
| PUT | `/api/ipo/:id` | Update IPO |
| DELETE | `/api/ipo/:id` | Delete IPO |

## Example Requests

### Get All IPOs
```bash
GET http://localhost:5000/api/ipo
```

### Get IPO by ID
```bash
GET http://localhost:5000/api/ipo/1
```

### Add New IPO
```bash
POST http://localhost:5000/api/ipo
Content-Type: application/json

{
  "name": "New Company IPO",
  "openDate": "2025-02-01",
  "closeDate": "2025-02-05",
  "priceBand": "₹100-₹120",
  "lotSize": 100,
  "faceValue": "₹10",
  "description": "Company description"
}
```

### Update IPO
```bash
PUT http://localhost:5000/api/ipo/1
Content-Type: application/json

{
  "priceBand": "₹130-₹150"
}
```

### Delete IPO
```bash
DELETE http://localhost:5000/api/ipo/1
```