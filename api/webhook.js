// api/webhook.js - Telegram mesajlarını işler

const BOT_TOKEN = process.env.BOT_TOKEN; // Vercel'de ayarlayacağız

// Basit veritabanı (Vercel KV yerine geçici)
let users = {};

// Telegram'a mesaj gönder
async function sendTelegram(method, data) {
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );
  return response.json();
}

export default async function handler(req, res) {
  // Sadece POST kabul et
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  const update = req.body;
  console.log('Mesaj geldi:', update);

  // /start komutu
  if (update.message?.text?.startsWith('/start')) {
    const user = update.message.from;
    const chatId = update.message.chat.id;

    // Kullanıcıyı kaydet
    if (!users[user.id]) {
      users[user.id] = {
        id: user.id,
        name: user.first_name,
        coins: 0,
        energy: 1000,
        clickPower: 1
      };
    }

    // Oyun URL'i (Vercel otomatik veriyor)
    const gameUrl = `https://${req.headers.host}/game?user=${user.id}`;

    // Hoş geldin mesajı
    await sendTelegram('sendMessage', {
      chat_id: chatId,
      text: `🎮 *Klickos'a Hoş Geldin ${user.first_name}!*

💰 Tap yap, coin kazan!
⚡ Enerji doldukça devam et!
🚀 Arkadaşlarını davet et!

Hemen başla! 👇`,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🎮 OYUNU BAŞLAT 🎮',
              web_app: { url: gameUrl }
            }
          ],
          [
            {
              text: '📊 İstatistikler',
              callback_data: 'stats'
            },
            {
              text: '🎁 Davet Et',
              callback_data: 'invite'
            }
          ]
        ]
      }
    });
  }

  // Buton tıklaması
  if (update.callback_query) {
    const query = update.callback_query;
    const userId = query.from.id;
    const user = users[userId];

    if (query.data === 'stats' && user) {
      await sendTelegram('answerCallbackQuery', {
        callback_query_id: query.id,
        text: `📊 İstatistiklerin:\n\n💰 Coin: ${user.coins}\n⚡ Enerji: ${user.energy}\n👊 Güç: ${user.clickPower}`,
        show_alert: true
      });
    }

    if (query.data === 'invite') {
      await sendTelegram('sendMessage', {
        chat_id: query.message.chat.id,
        text: `🎁 *Arkadaşlarını Davet Et!*\n\n📎 Davet linkin:\nt.me/YOUR_BOT_USERNAME?start=${userId}\n\n💰 Her davet için +1000 coin!\n\nLinki paylaş! 🚀`,
        parse_mode: 'Markdown'
      });
    }
  }

  return res.status(200).json({ ok: true });
                }
