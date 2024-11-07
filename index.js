const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Your Cloudflare Turnstile Secret Key
const SECRET_KEY = '0x4AAAAAAAzdcC57M74t-l4uvRpEQISluL4';

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (your HTML)

app.post('/verify', async (req, res) => {
    const captchaResponse = req.body.captchaResponse;

    if (!captchaResponse) {
        return res.status(400).json({ success: false, message: 'Captcha response is required' });
    }

    // Verify the CAPTCHA response with Cloudflare
    const verificationUrl = `https://challenges.cloudflare.com/turnstile/v0/siteverify`;
    const params = new URLSearchParams();
    params.append('secret', SECRET_KEY);
    params.append('response', captchaResponse);

    try {
        const verificationResponse = await fetch(verificationUrl, {
            method: 'POST',
            body: params,
        });
        const verificationResult = await verificationResponse.json();

        if (verificationResult.success) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'CAPTCHA validation failed' });
        }
    } catch (error) {
        console.error('Error during CAPTCHA validation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
