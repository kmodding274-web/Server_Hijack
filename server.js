const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Aapka diya hua valid premium JSON template
const validJsonTemplate = {
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

        const currentTimestamp = Math.floor(Date.now() / 1000).toString();

        // App se aane wale headers ko capture karna (agar app bheje toh)
        const appAuth = req.headers['authorization'];
        const appDeviceId = req.headers['deviceid'] || req.headers['device-id'];
        const appVersion = req.headers['appversion'];

        // Template ke data ko app ke naye data se replace/merge karna
        const finalHeaders = {
            ...validJsonTemplate,
            // Agar app naya token ya device deta hai toh use lagao, warna template ka use karo
            "authorization": appAuth ? appAuth : validJsonTemplate.authorization,
            "deviceId": appDeviceId ? appDeviceId : validJsonTemplate.deviceId,
            "appVersion": appVersion ? appVersion : validJsonTemplate.appVersion,
            'host': 'api.storytv.asia',
            'ts': currentTimestamp,
            'ep_session_id': `15544664_${currentTimestamp}`
        };

        const targetUrl = `${ORIGINAL_SERVER_URL}${req.url}`;

        // Original server ko request forward karna
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
app.listen(PORT, () => console.log(`Proxy Server running on port ${PORT}`));
