const express = require('express');
const axios = require('axios');
const http = require('http');
const https = require('https');
const app = express();

app.use(express.json());

// --- SPEED BOOSTER: Keep-Alive Agents (Connection reuse karne ke liye) ---
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 100 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 100 });

// Hardcoded Premium JSON
const HARDCODED_PREMIUM_DATA = {
    "appVersion": "60",
    "platform": "0",
    "deviceId": "61245767afad11a3",
    "os": "Android 16 (API 36)",
    "network_type": "WIFI",
    "X-AYUSH-KEY": "LEGEND_2026_SECRET",
    "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjYtMDgtMjEgMTI6Mjc6MDEuNDk5Iiwic2Vzc2lvbklkIjoiMTkyMTA0NTQyIiwiZGV2aWNlSWQiOiI2MTI0NTc2N2FmYWQxMWEzIiwic3ViIjoiMTM5Njk1NTU3IiwwZXhwIjoxNzg3NTc1MzY2fQ.UR8dm3-6MYE5lO7oHUCokmDhCz41BENwLn244xuxNx4",
    "ep_session_id": "15544664_1787323588",
    "User-Agent": "ktor-client",
    "Content-Type": "application/json",
    "ts": "1787323588"
};

const ORIGINAL_SERVER_URL = "https://api.storytv.asia";

// Anti-Sleep Ping Route
app.get('/ping', (req, res) => {
    res.status(200).send("Server is alive and blazing fast!");
});

app.all('*', async (req, res) => {
    if (req.url === '/ping') return;

    try {
        const startTime = Date.now();
        console.log(`[Proxy] Fast Request: ${req.method} ${req.url}`);

        const finalHeaders = {
            ...HARDCODED_PREMIUM_DATA,
            'host': 'api.storytv.asia',
            'Accept-Encoding': 'gzip, deflate' // Compression enable karne ke liye
        };

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;

        // Axios request with Speed Boosters (Keep-Alive Agents)
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: finalHeaders,
            data: req.body,
            httpAgent: httpAgent,
            httpsAgent: httpsAgent,
            validateStatus: () => true 
        });

        const timeTaken = Date.now() - startTime;
        console.log(`[Proxy] Response sent in ${timeTaken}ms`);

        res.status(response.status).json(response.data);

    } catch (error) {
        res.status(500).json({ error: "Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Boosted Proxy Server running on port ${PORT}`);

    // Anti-Sleep Self-Ping
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    setInterval(() => {
        axios.get(`${SELF_URL}/ping`).catch(() => {});
    }, 300000); // Har 5 minute mein ping
});
