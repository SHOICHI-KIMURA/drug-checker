require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the root directory
app.use(express.static('.'));

// API endpoint to proxy requests to Dify
app.post('/api/check', async (req, res) => {
    const { drug_name, ope_day } = req.body;

    if (!drug_name || !ope_day) {
        return res.status(400).json({ error: 'Drug name and operation date are required.' });
    }

    const difyUrl = 'https://api.dify.ai/v1/workflows/run';
    const apiKey = process.env.DIFY_API_KEY;

    if (!apiKey) {
        console.error('Dify API key is not set.');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    const requestData = {
        inputs: {
            drug_name: drug_name,
            ope_day: ope_day
        },
        response_mode: 'blocking',
        user: 'webapp-user' // Using a generic user for the backend
    };

    try {
        console.log('Forwarding request to Dify...');
        const difyResponse = await axios.post(difyUrl, requestData, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Received response from Dify.');
        // Forward Dify's response to the client
        res.json(difyResponse.data);

    } catch (error) {
        console.error('Error calling Dify API:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ 
            error: 'Failed to get response from Dify API.',
            details: error.response ? error.response.data : null
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
