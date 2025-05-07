// controllers/emailController.js
const Imap                = require('imap');
const imapConfig          = require('../config/imapConfig');
const { parseEmail }      = require('../utils/parser');
const { classifyEmail }   = require('../services/deepseekService');
const { generateHRReply } = require('../services/draftReply');
const { sendAutoReply }   = require('../services/mailService');
const Employee            = require('../models/Employee');  // your Mongoose model

const imap = new Imap(imapConfig);

imap.on('error', err => console.error('🔥 IMAP Error:', err));

async function checkLatest() {
  imap.search(['UNSEEN'], async (err, uids) => {
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
          const fromAddr = fromInfo?.address?.toLowerCase();
          if (!fromAddr) {
            console.log('⚠️ Missing sender; skipping');
            return;
          }

          // 1) Only reply if sender exists in Employee collection
          const exists = await Employee.exists({ email: fromAddr });
          if (!exists) {
            console.log(`⚠️ ${fromAddr} is not in employees DB; skipping`);
            return;
          }

          // 2) Derive friendly name
          const fromName = fromInfo.name
            || fromAddr.split('@')[0]
                .replace(/[\.\_\-]/g,' ')
                .replace(/\b\w/g, l => l.toUpperCase());

          const body = (parsed.text || '').trim();
          console.log(`✉️ From ${fromName}: ${body.slice(0,50)}…`);

          // 3) Classify HR relevance
          const isHR = await classifyEmail(body);
          console.log('🔖 is_hr:', isHR);
          if (!isHR) {
            console.log('⚠️ Not HR-related; skipping');
            return;
          }

          // 4) Generate the policy quote
          const quote = await generateHRReply(body);

          // 5) If we got something back, send a personalized reply
          if (quote) {
            const fullReply = [
              `Dear ${fromName},`,
              "",
              quote,
              "",
              "Best regards,",
              "HR Team"
            ].join('\n');
            sendAutoReply(fromAddr, fullReply);
          } else {
            console.log('⚠️ No policy quote generated; skipping');
          }

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
