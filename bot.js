const { Bot, InlineKeyboard } = require('grammy');

const { BOT_TOKEN, BOT_SECRET, WEBAPP_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

Object.entries({ BOT_TOKEN, BOT_SECRET, WEBAPP_URL, SUPABASE_URL, SUPABASE_ANON_KEY }).forEach(([name, value]) => {
  if (!value) throw new Error(`Missing environment variable ${name}`);
});

const bot = new Bot(BOT_TOKEN);

async function registerStart(user, referral) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/oc_bot_start`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_secret: BOT_SECRET,
      p_telegram_id: user.id,
      p_username: user.username || null,
      p_first_name: user.first_name || null,
      p_ref: referral
    })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data) throw new Error((data && data.message) || 'Registration failed');
  return data;
}

bot.command('start', async ctx => {
  try {
    await registerStart(ctx.from, (ctx.match || '').trim());
  } catch (e) {
    console.error(e.message);
    await ctx.reply('Something went wrong. Please try again in a minute.');
    return;
  }
  await ctx.reply('Welcome to OneCoin! Tap the button below to open the app.', {
    reply_markup: new InlineKeyboard().webApp('Open OneCoin', WEBAPP_URL)
  });
});

bot.catch(err => console.error(err.message));

bot.api
  .setChatMenuButton({ menu_button: { type: 'web_app', text: 'OneCoin', web_app: { url: WEBAPP_URL } } })
  .catch(err => console.error(err.message));

bot.start();
