// controllers/emailController.js
const Imap                = require('imap');
const imapConfig          = require('../config/imapConfig');
const { parseEmail }      = require('../utils/parser');
const { classifyEmail }   = require('../services/deepseekService');
const { generateHRReply } = require('../services/draftReply');
const { sendAutoReply }   = require('../services/mailService');

const imap = new Imap(imapConfig);

imap.on('error', err => console.error('🔥 IMAP Error:', err));

async function checkLatest() {
  imap.search(['UNSEEN'], (err, uids) => {
    if (err) return console.error('❌ Search error:', err);
    if (!uids?.length) return console.log('– No new emails');

    const latest = uids.pop();
    console.log('🔎 New UID:', latest);

    const fetcher = imap.fetch(latest, { bodies: [''], markSeen: true });
    fetcher.on('message', msg => {
      msg.on('body', async stream => {
        try {
          const parsed   = await parseEmail(stream);
          const fromInfo = parsed.from?.value?.[0];
          const fromAddr = fromInfo?.address;
          if (!fromAddr) return console.log('⚠️ Missing sender; skipping');

          const fromName = fromInfo.name
            || fromAddr.split('@')[0].replace(/[\.\_\-]/g,' ').replace(/\b\w/g,l=>l.toUpperCase());
          const body = (parsed.text||'').trim();
          console.log(`✉️ From ${fromName}: ${body.slice(0,50)}…`);

          // 1) If it looks like a leave request (≥2 dates or the word "leave"), force HR
          const dateMatches = [...body.matchAll(/\d{4}-\d{2}-\d{2}/g)];
          const isLeaveQuery = dateMatches.length >= 2 || /\bleave\b/i.test(body);

          // 2) Otherwise, classify via AI
          let isHR = isLeaveQuery
            ? true
            : await classifyEmail(body);
          console.log('🔖 is_hr:', isHR);

          if (!isHR) {
            console.log('⚠️ Not HR-related; skipping');
            return;
          }

          // 3) Generate the policy quote
          const quote = await generateHRReply(body);

          // 4) Wrap in a personal greeting & sign-off
          const fullReply = [
            `Dear ${fromName},`,
            '',
            quote,
            '',
            'Best regards,',
            'HR Team'
          ].join('\n');

          sendAutoReply(fromAddr, fullReply);
        } catch (e) {
          console.error('❌ parse error:', e);
        }
      });
    });
    fetcher.once('end',   () => console.log('✓ Done fetching latest'));
    fetcher.once('error', err => console.error('❌ Fetch error:', err));
  });
}

function startWatcher() {
  imap.once('ready', () => {
    imap.openBox('INBOX', false, err => {
      if (err) return console.error('❌ openBox:', err);
      console.log('📬 INBOX opened');
      imap.on('mail', checkLatest);
      checkLatest();
    });
  });
  imap.connect();
}

module.exports = { startWatcher };
