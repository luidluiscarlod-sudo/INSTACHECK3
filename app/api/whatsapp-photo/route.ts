const https = require('https');

module.exports = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: 'Número obrigatório' });
  }

  const options = {
    method: 'POST',
    hostname: 'whatsapp-profile-data1.p.rapidapi.com',
    path: '/WhatsappProfilePhotoWithToken',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'whatsapp-profile-data1.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  const apiReq = https.request(options, apiRes => {
    const chunks = [];

    apiRes.on('data', chunk => chunks.push(chunk));
    apiRes.on('end', () => {
      const body = Buffer.concat(chunks).toString();
      res.status(200).send(body);
    });
  });

  apiReq.write(JSON.stringify({ phone_number }));
  apiReq.end();
};
