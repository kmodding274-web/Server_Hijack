// ==============================================================
// 1. CONFIGURATION ZONE: ALRIGHT! TV PROXY (ELITE MODS)
// ==============================================================

const TARGET_API = 'https://short.elitemods.in';

const REPLACEMENTS = [
    { pattern: /Elite Mods/gi, newText: "SILENT MODS SG" },
    { pattern: /@EliteMods/gi, newText: "@SILENT_MOD_SG" },
    { pattern: /Alright! TV/gi, newText: "Alright! TV [SILENT MOD]" },
    
    // UI Header Modifications
    
    { pattern: /"isPremium":\s*false/gi, newText: '"isPremium":true' },
    { pattern: /"is_premium":\s*0/gi, newText: '"is_premium":1' },
    { pattern: /"ads_enabled":\s*true/gi, newText: '"ads_enabled":false' },
    { pattern: /"status":\s*"expired"/gi, newText: '"status":"active"' },
    { pattern: /Premium Plan/gi, newText: "MOD BY @SILENT_MOD_SG" },
    { pattern: /Enjoy ✨/gu, newText: "MOD BY @SILENT_MOD_SG" },
    { pattern: /Valid till:[^"]+/gi, newText: "Valid till: LIFETIME" }
];


// ==============================================================
// 2. UNIVERSAL PROXY ENGINE: HAR EXACT HEADER MATCH
// ==============================================================

module.exports = async (req, res) => {
    try {
        const requestPath = req.headers['x-invoke-path'] || req.url || '/';
        const upstreamUrl = `${TARGET_API}${requestPath}`;

        // 1-to-1 Exact Header Match from HAR Dump
        const forwardHeaders = {
            'sec-ch-ua': '"Not=A?Brand";v="99", "Android WebView";v="151", "Chromium";v="151"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'user-agent': 'Mozilla/5.0 (Linux; Android 16; 2412DPC0AI Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/151.0.7922.199 Mobile Safari/537.36',
            'accept': '*/*',
            'referer': 'https://short.elitemods.in/',
            'origin': 'https://short.elitemods.in',
            'x-requested-with': 'com.premium.alrighttv',
            'accept-language': 'en-IN,en-US;q=0.9,en;q=0.8',
            
            // New App-Specific Auth Headers discovered in HAR
            'x-legnd-sig': req.headers['x-legnd-sig'] || '21.3.0',
            'key': req.headers['key'] || 'gDCvgBu9U1',
            
            // Elite Keys (Dynamic pass-through or Hardcoded fallback)
            'x-elite-key': req.headers['x-elite-key'] || '4mDwE15WtPu2d8CaHfsP09ivPf5LFBDYUMExOdYSm378dHWTFMNVAsgbGxrUYRG3',
            'x-elite-sig': req.headers['x-elite-sig'] || 'e6c4f260a85ae4e654c2be326a7f50f0cf04cbbd1f5e161b4891c337d81f0135',
            
            // Fetch metadata
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty'
        };

        // If the app sends POST data, we must preserve the Content-Type
        if (req.headers['content-type']) {
            forwardHeaders['content-type'] = req.headers['content-type'];
        } else if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            forwardHeaders['content-type'] = 'application/json';
        }

        let requestBody = undefined;
        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase()) && req.body) {
            requestBody = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
        }

        // Fetch API automatically sets 'host', 'content-length', and 'accept-encoding' natively.
        const upstreamResponse = await fetch(upstreamUrl, {
            method: req.method,
            headers: forwardHeaders,
            body: requestBody
        });

        const contentType = upstreamResponse.headers.get('content-type') || '';

        // Intercept and manipulate JSON payloads
        if (contentType.includes('application/json')) {
            let jsonText = await upstreamResponse.text();
            for (const rule of REPLACEMENTS) {
                jsonText = jsonText.replace(rule.pattern, rule.newText);
            }
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(upstreamResponse.status).send(jsonText);
        }

        // Pass-through raw binaries unchanged
        const buffer = await upstreamResponse.arrayBuffer();
        res.setHeader('Content-Type', contentType);
        return res.status(upstreamResponse.status).send(Buffer.from(buffer));

    } catch (err) {
        return res.status(502).json({ 
            error: "Universal Proxy Gateway Error", 
            details: err.message,
            target: TARGET_API
        });
    }
};
