# FatSecret API Proxy Server

A Node.js Express backend server that acts as a secure proxy for the FatSecret API, handling OAuth 2.0 authentication and providing image recognition capabilities for mobile applications.

## Features

- ✅ **OAuth 2.0 Token Management**: Automatic token fetching, caching, and renewal
- ✅ **Image Recognition**: Upload food images and get nutritional information
- ✅ **CORS Support**: Ready for mobile app integration
- ✅ **Secure Credentials**: API keys stored server-side in environment variables
- ✅ **Error Handling**: Comprehensive error responses and logging
- ✅ **Health Monitoring**: Built-in health check and token status endpoints

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- FatSecret API credentials ([Get them here](https://platform.fatsecret.com/api/))

### Installation

1. Clone or navigate to the project directory:
```bash
cd fitness-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your FatSecret Client Secret to `.env`:
```env
FATSECRET_CLIENT_ID=021a17cfad404f28b7ecd17b4f425499
FATSECRET_CLIENT_SECRET=your_actual_client_secret_here
PORT=3000
NODE_ENV=development
```

4. Start the server:

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```http
GET /health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T12:00:00.000Z",
  "service": "FatSecret API Proxy Server"
}
```

### Image Recognition
```http
POST /api/recognize-food
Content-Type: multipart/form-data
```

Upload an image to recognize food items.

**Request:**
- `image` (required): Image file (JPEG, PNG, etc., max 10MB)
- `region` (optional): Region code for localized results (e.g., "US", "GB")

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/recognize-food \
  -F "image=@path/to/food-image.jpg" \
  -F "region=US"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "food_id": "12345",
        "food_name": "Apple",
        "brand_name": "",
        "food_description": "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
      }
    ]
  }
}
```

### Token Status (Debug)
```http
GET /api/token-status
```
Check current OAuth token status and expiry.

### Refresh Token (Debug)
```http
POST /api/refresh-token
```
Force a token refresh (clears cache and fetches new token).

## Mobile App Integration

### Flutter Example

```dart
import 'dart:io';
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<Map<String, dynamic>> recognizeFood(File imageFile) async {
  final uri = Uri.parse('http://YOUR_SERVER_IP:3000/api/recognize-food');
  
  var request = http.MultipartRequest('POST', uri);
  request.files.add(await http.MultipartFile.fromPath('image', imageFile.path));
  
  var response = await request.send();
  var responseBody = await response.stream.bytesToString();
  
  return json.decode(responseBody);
}
```

### React Native Example

```javascript
import axios from 'axios';

const recognizeFood = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'food.jpg',
  });

  const response = await axios.post(
    'http://YOUR_SERVER_IP:3000/api/recognize-food',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
};
```

## Project Structure

```
fitness-backend/
├── server.js           # Main Express server
├── auth.js             # OAuth 2.0 token manager
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FATSECRET_CLIENT_ID` | Your FatSecret API Client ID | Yes |
| `FATSECRET_CLIENT_SECRET` | Your FatSecret API Client Secret | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |

### IP Whitelisting

If using FatSecret's IP whitelist feature:
1. Deploy this server to a hosting platform with a static IP
2. Add the server's IP address to your FatSecret API whitelist
3. Mobile apps connect to your server (no IP restrictions on app side)

## Error Handling

The server provides detailed error responses:

- **400 Bad Request**: Invalid request (missing image, wrong file type)
- **404 Not Found**: Invalid endpoint
- **500 Internal Server Error**: Server-side errors
- **504 Gateway Timeout**: FatSecret API timeout

## Security Notes

- Never commit `.env` file to version control
- Keep your Client Secret secure
- Use HTTPS in production
- Implement rate limiting for production deployments
- Add authentication for your mobile app in production

## Troubleshooting

### "Failed to authenticate with FatSecret API"
- Verify your Client ID and Client Secret in `.env`
- Check if your credentials are active on FatSecret platform

### "Only image files are allowed"
- Ensure you're uploading an image file (JPEG, PNG, etc.)
- Check the file's MIME type

### "Image must be less than 10MB"
- Compress your image before uploading
- Adjust the limit in `server.js` if needed

## Development

### Testing with Postman

1. Create a new POST request to `http://localhost:3000/api/recognize-food`
2. Go to Body → form-data
3. Add key `image` with type `File`
4. Upload an image
5. Send the request

### Monitoring Logs

The server logs all operations to the console:
- Token fetching and caching
- Image processing
- Errors and warnings

## License

ISC

## Support

For FatSecret API documentation and support:
- [FatSecret Platform API Docs](https://platform.fatsecret.com/api/)
- [Image Recognition API](https://platform.fatsecret.com/api/Default.aspx?screen=rapiref2&method=foods.search.v3)

---

**Note**: Replace `your_actual_client_secret_here` in the `.env` file with your actual FatSecret Client Secret Key before running the server.
