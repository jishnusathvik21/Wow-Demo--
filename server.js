import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import twilio from 'twilio';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Twilio Setup - Add your credentials here to send real SMS text messages
const TWILIO_ACCOUNT_SID = ''; 
const TWILIO_AUTH_TOKEN = '';  
const TWILIO_PHONE_NUMBER = ''; 

let client = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Endpoint to fetch mechanics data
app.get('/api/providers', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'database.json');
        const fileContent = await fs.readFile(dataPath, 'utf-8');
        let providers = JSON.parse(fileContent);
        const { category, vehicle } = req.query;

        if (category && category !== 'All') {
            providers = providers.filter(item => item.specialty.toLowerCase().includes(category.toLowerCase()));
        }
        if (vehicle && vehicle !== 'All') {
            providers = providers.filter(item => item.vehicle.toLowerCase() === vehicle.toLowerCase());
        }
        res.json(providers);
    } catch (error) {
        res.status(500).json({ error: 'Error loading mechanic data.' });
    }
});

// Dedicated Real SMS Dispatch API Endpoint
app.post('/api/send-sms', async (req, res) => {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ success: false, error: 'Phone number is missing.' });
    }

    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91${formattedPhone}`;
    }

    console.log(`\n--- 📱 SENDING LIVE SMS PACKET ---`);
    console.log(`TO: ${formattedPhone}`);
    console.log(`PAYLOAD: ${message}`);

    if (client) {
        try {
            const smsResponse = await client.messages.create({
                body: message,
                from: TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
            console.log(`SMS SENT SUCCESSFULLY! SID: ${smsResponse.sid}\n--------------------------------`);
            return res.json({ success: true, mode: 'live', sid: smsResponse.sid });
        } catch (smsError) {
            console.error(`Twilio Carrier Error: ${smsError.message}`);
        }
    }

    console.log(`STATUS: Local Console Logger Simulator Fallback (Keys Empty)\n--------------------------------`);
    res.json({ success: true, mode: 'simulator' });
});

app.listen(PORT, () => {
    console.log(`⚙️ Mobile Garage app active at http://localhost:${PORT}`);
});