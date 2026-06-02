// Вызывается с сайта когда пациент оставляет отзыв
// Отправляет уведомление в Telegram с кнопками

const TG_TOKEN   = '8348564496:AAE-lfMiKRRPImPPG7bMIWxiPZo9sAvjmC4';
const ADMIN_CHAT = '8571455593';

async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { id, name, txt, svc, stars } = req.body;
  const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  const text = `🦷 *Новый отзыв на сайте*\n\n👤 *${name}*\n${starStr}${svc ? ' • ' + svc : ''}\n\n"${txt}"`;

  await tg('sendMessage', {
    chat_id: ADMIN_CHAT,
    text,
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Одобрить', callback_data: `approve:${id}` },
        { text: '❌ Отклонить', callback_data: `reject:${id}` }
      ]]
    }
  });

  return res.status(200).json({ ok: true });
}
