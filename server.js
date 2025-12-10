require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FatSecretAuth = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize FatSecret authentication
const fatSecretAuth = new FatSecretAuth(
    process.env.FATSECRET_CLIENT_ID,
    process.env.FATSECRET_CLIENT_SECRET
);

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
    console.log(`  IP: ${ip}`);
    console.log(`  User-Agent: ${req.get("user-agent")}`);

    res.on("finish", () => {
        console.log(`  Status: ${res.statusCode}`);
    });

    next();
});

// Multer (NO FILE FILTER)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'FatSecret API Proxy Server'
    });
});

// Image Recognition
app.post('/api/recognize-food', upload.single('image'), async (req, res) => {
    try {
        // Validate image
        if (!req.file) {
            
            return res.status(400).json({
                error: 'No image file provided',
                message: 'Please upload an image file'
                
            });
        }

        console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

        // Get access token
        const accessToken = await fatSecretAuth.getAccessToken();

        // Convert image to base64
        const imageBase64 = req.file.buffer.toString('base64');

        // Payload for FatSecret API
        const payload = {
            image_b64: imageBase64,
            include_food_data: true,
            region: req.body.region || "US",
            language: req.body.language || "en"
        };

        // Send request to FatSecret
        const response = await axios.post(
            'https://platform.fatsecret.com/rest/image-recognition/v2',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                timeout: 30000
            }
        );

        console.log("FatSecret Response OK");
        
        console.log("🔍 FatSecret FULL RESPONSE:");
        console.log(JSON.stringify(response.data, null, 2));

        // RETURN RAW RESPONSE (Flutter expects this)
        res.json(response.data);

    } catch (error) {
        console.error("Error processing image recognition:", error.response?.data || error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                error: 'FatSecret API Error',
                message: error.response.data.error?.message || "Failed to process image",
                details: error.response.data
            });
        }

        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                error: 'Request Timeout',
                message: 'Image processing took too long'
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Token Status
app.get('/api/token-status', async (req, res) => {
    try {
        const token = await fatSecretAuth.getAccessToken();
        const expiresIn = fatSecretAuth.tokenExpiry
            ? Math.floor((fatSecretAuth.tokenExpiry - Date.now()) / 1000)
            : 0;

        res.json({
            hasToken: !!token,
            expiresIn: `${expiresIn} seconds`,
            expiryTime: new Date(fatSecretAuth.tokenExpiry).toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to check token status",
            message: error.message
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 FatSecret API Proxy Server running on port ${PORT}`);
    console.log(`📍 Health:   http://localhost:${PORT}/health`);
    console.log(`🍎 Recognize: POST http://localhost:${PORT}/api/recognize-food`);
    console.log(`🔑 Token:    http://localhost:${PORT}/api/token-status\n`);
});

module.exports = app;