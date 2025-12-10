# 🚀 Quick Start Guide

## Your FatSecret API Proxy Server is Ready!

### 📋 What's Included:

✅ **Express Server** with OAuth 2.0 token management  
✅ **Image Recognition API** endpoint  
✅ **Automatic token caching** and renewal  
✅ **CORS support** for mobile apps  
✅ **Error handling** and logging  
✅ **Test suite** for validation  

---

## ⚡ Quick Commands

```bash
# Start development server (auto-restart on changes)
npm run dev

# Start production server
npm start

# Run tests (requires server running)
npm test
```

---

## 🔧 Next Steps

### 1. **Add Your Client Secret** (Required!)
   - Open `.env` file
   - Replace `your_client_secret_here` with your actual FatSecret Client Secret
   - Get it from: https://platform.fatsecret.com/api/
   - See `SETUP.md` for detailed instructions

### 2. **Restart the Server**
   ```bash
   npm run dev
   ```

### 3. **Test the API**
   ```bash
   # Check health
   curl http://localhost:3000/health
   
   # Check token status
   curl http://localhost:3000/api/token-status
   
   # Test image recognition
   curl -X POST http://localhost:3000/api/recognize-food \
     -F "image=@your-food-image.jpg"
   ```

---

## 📱 Mobile App Integration

### Flutter Example:
```dart
final uri = Uri.parse('http://YOUR_IP:3000/api/recognize-food');
var request = http.MultipartRequest('POST', uri);
request.files.add(await http.MultipartFile.fromPath('image', imagePath));
var response = await request.send();
```

### React Native Example:
```javascript
const formData = new FormData();
formData.append('image', {
  uri: imageUri,
  type: 'image/jpeg',
  name: 'food.jpg',
});
axios.post('http://YOUR_IP:3000/api/recognize-food', formData);
```

---

## 📚 Documentation

- `README.md` - Full documentation
- `SETUP.md` - Configuration guide
- `postman-collection.json` - Import into Postman for easy testing

---

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/recognize-food` | POST | Upload food image for recognition |
| `/api/token-status` | GET | Check OAuth token status |
| `/api/refresh-token` | POST | Force token refresh |

---

## 🔒 Security Note

Your Client ID is already configured:
```
021a17cfad404f28b7ecd17b4f425499
```

**You only need to add your Client Secret to the `.env` file!**

---

## ❓ Need Help?

1. Check server logs in the terminal
2. Review `README.md` for detailed docs
3. Test with Postman using `postman-collection.json`
4. Verify `.env` configuration in `SETUP.md`

**Server is currently running on: http://localhost:3000** 🎉
