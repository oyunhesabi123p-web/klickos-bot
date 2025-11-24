// api/save.js - Kullanıcı verilerini kaydet

// Basit hafıza (production için Vercel KV veya başka DB kullan)
let userData = {};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Veri al
  if (req.method === 'GET') {
    const userId = req.query.user;
    const data = userData[userId] || {
      coins: 0,
      energy: 1000,
      clickPower: 1
    };
    return res.status(200).json(data);
  }

  // POST - Veri kaydet
  if (req.method === 'POST') {
    const { userId, coins, energy, clickPower } = req.body;
    
    userData[userId] = {
      coins: coins || 0,
      energy: energy || 1000,
      clickPower: clickPower || 1,
      lastUpdate: new Date()
    };

    console.log(`Kullanıcı ${userId} kaydedildi: ${coins} coin`);
    
    return res.status(200).json({ success: true, data: userData[userId] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
