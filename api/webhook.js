const SUPABASE_URL = 'https://rgsdjcfzuqcvimmutoxg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnc2RqY2Z6dXFjdmltbXV0b3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTkyMDcsImV4cCI6MjA5NTk3NTIwN30.0tEsBmfcNB8iKgxS8Pf5EF_-aYXtUD7lXUKDWD9phU4';
const TG_TOKEN    = '8348564496:AAE-lfMiKRRPImPPG7bMIWxiPZo9sAvjmC4';
const ADMIN_CHAT  = '8571455593';

async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function setStatus(id, status) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ status })
  });
  return r.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  const update = req.body;

  if (update.callback_query) {
    const cb = update.callback_query;
    const [action, id] = cb.data.split(':');
    let text = '';

    if (action === 'approve') {
      const ok = await setStatus(id, 'approved');
      text = ok ? '✅ Отзыв одобрен и опубликован!' : '❌ Ошибка при одобрении';
    } else if (action === 'reject') {
      const ok = await setStatus(id, 'rejected');
      text = ok ? '🗑 Отзыв отклонён' : '❌ Ошибка при отклонении';
    }

    await tg('answerCallbackQuery', { callback_query_id: cb.id, text });
    await tg('editMessageReplyMarkup', {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      reply_markup: { inline_keyboard: [] }
    });
    await tg('sendMessage', { chat_id: ADMIN_CHAT, text });
  }

  return res.status(200).json({ ok: true });
};
