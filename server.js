const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Hardcoded Premium JSON (Yeh hamesha fix rahega, app ka koi data override nahi karega)
const HARDCODED_PREMIUM_DATA = {
    "appVersion": "60",
    "platform": "0",
    "deviceId": "61245767afad11a3",
    "os": "Android 16 (API 36)",
    "network_type": "WIFI",
    "X-AYUSH-KEY": "LEGEND_2026_SECRET",
    "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkRGF0ZSI6IjIwMjYtMDgtMjEgMTI6Mjc6MDEuNDk5Iiwic2Vzc2lvbklkIjoiMTkyMTA0NTQyIiwiZGV2aWNlSWQiOiI2MTI0NTc2N2FmYWQxMWEzIiwic3ViIjoiMTM5Njk1NTU3IiwiZXhwIjoxNzg3NTc1MzY2fQ.UR8dm3-6MYE5lO7oHUCokmDhCz41BENwLn244xuxNx4",
    "ep_session_id": "15544664_1787323588",
    "User-Agent": "ktor-client",
    "Content-Type": "application/json",
    "ts": "1787323588"
};

const ORIGINAL_SERVER_URL = "https://api.storytv.asia";

app.all('*', async (req, res) => {
    try {
        console.log(`[Proxy] Request aayi: ${req.method} ${req.url}`);

        // Original server ke liye final headers (Hardcoded data bilkul waise ka waisa jayega)
        const finalHeaders = {
            ...HARDCODED_PREMIUM_DATA,
            'host': 'api.storytv.asia'
        };

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;

        // Original server ko hardcoded data ke sath request forward karna
        const response = await axios({
            method: req.method,
            url: targetUrl,
            headers: finalHeaders,
            data: req.body,
            validateStatus: () => true 
        });

        // Original server ka reply wapas app ko dena
        res.status(response.status).json(response.data);

    } catch (error) {
        res.status(500).json({ error: "Proxy Error", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Hardcoded Proxy Server running on port ${PORT}`));
