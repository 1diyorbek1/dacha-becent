const axios = require('axios');

async function checkBot() {
  const token = '8585258425:AAHUGMT0RQKS-pU8N8n8v2KsaBs070Mt4NQ';
  try {
    const res = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    console.log('Bot Status:', res.data);
  } catch (e) {
    console.error('Bot Error:', e.response?.data || e.message);
  }
}

checkBot();
