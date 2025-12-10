# ⚙️ Configuration Required

## 🔑 Add Your FatSecret Client Secret

Your FatSecret API Proxy Server is ready, but you need to add your **Client Secret** to complete the setup.

### Steps:

1. **Get Your Client Secret from FatSecret:**
   - Go to https://platform.fatsecret.com/api/
   - Log in to your account
   - Navigate to your REST API OAuth 2.0 Credentials
   - Click "Show Client ID" button
   - Copy your **Client Secret Key**

2. **Update the `.env` file:**
   - Open the `.env` file in this directory
   - Replace `your_client_secret_here` with your actual Client Secret
   - Save the file

   Example:
   ```env
   FATSECRET_CLIENT_ID=021a17cfad404f28b7ecd17b4f425499
   FATSECRET_CLIENT_SECRET=abc123def456...your-actual-secret
   PORT=3000
   NODE_ENV=development
   ```

3. **Restart the server:**
   - Stop the current server (Ctrl+C in the terminal)
   - Restart it: `npm run dev`

### ✅ Verify It's Working

Once configured, test the server:

```bash
# Test health check
curl http://localhost:3000/health

# Test OAuth token
curl http://localhost:3000/api/token-status
```

You should see a valid token with expiry information.

### 📱 Test Image Recognition

To test food image recognition:

```bash
curl -X POST http://localhost:3000/api/recognize-food \
  -F "image=@path/to/your/food-image.jpg"
```

Replace `path/to/your/food-image.jpg` with an actual food image path.

---

**Important:** Never commit your `.env` file with the actual secret to version control!
