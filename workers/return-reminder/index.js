export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(fetch('https://bloomjuniors.com/api/daily-reminders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    }))
  },
}
