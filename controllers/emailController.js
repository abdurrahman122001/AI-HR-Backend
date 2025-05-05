const Imap                = require('imap');
const imapConfig          = require('../config/imapConfig');
const { parseEmail }      = require('../utils/parser');
const { classifyEmail }   = require('../services/deepseekService');
const { generateHRReply } = require('../services/draftReply');
const { sendAutoReply }   = require('../services/mailService');

const imap = new Imap(imapConfig);

imap.on('error', err => console.error('🔥 IMAP Error:', err));

function checkLatest() {
  imap.search(['UNSEEN'], (err, uids) => {
    if (err) return console.error('❌ Search error:', err);
    if (!uids || !uids.length) return console.log('– No new emails');

    const latest = uids.pop();
    console.log('🔎 New UID:', latest);

    const fetcher = imap.fetch(latest, { bodies: [''], markSeen: true });
    fetcher.on('message', msg => {
      msg.on('body', async stream => {
        try {
          const parsed   = await parseEmail(stream);
          const fromAddr = parsed.from?.value?.[0]?.address;
          if (!fromAddr) {
            console.log('⚠️ Missing sender; skipping');
            return;
          }

          const body = (parsed.text || '').trim();
          console.log(`✉️ From ${fromAddr}: ${body.slice(0,50)}…`);

          // **AI-based HR relevance only**
          const isHR = await classifyEmail(body);
          console.log('🔖 is_hr:', isHR);

          if (!isHR) {
            console.log('⚠️ Not HR-related; skipping');
            return;
          }

          // Generate and send an HR‐drafted reply
          const draft = await generateHRReply(body);
          sendAutoReply(fromAddr, draft);

        } catch (e) {
          console.error('❌ parse error:', e);
        }
      });
    });

    fetcher.once('end', () => console.log('✓ Done fetching latest'));
    fetcher.once('error', err => console.error('❌ Fetch error:', err));
  });
}

function startWatcher() {
  imap.once('ready', () => {
    imap.openBox('INBOX', false, err => {
      if (err) {
        console.error('❌ openBox:', err);
        return;
      }
      console.log('📬 INBOX opened');
      imap.on('mail', checkLatest);
      checkLatest();
    });
  });
  imap.connect();
}

module.exports = { startWatcher };


// controllers/emailController.js
// const Imap              = require('imap');
// const imapConfig        = require('../config/imapConfig');
// const { parseEmail }    = require('../utils/parser');
// const hrResponses       = require('../services/hrResponses');
// const { sendAutoReply } = require('../services/mailService');
// const { generateHRReply } = require('../services/draftReply');

// const imap = new Imap(imapConfig);

// // *** Add this near the top ***
// const LEAVE_KEYWORDS = ['leave', 'paid leave', 'vacation'];

// imap.on('error', err => console.error('🔥 IMAP Error:', err));

// function checkLatest() {
//   imap.search(['UNSEEN'], (err, uids) => {
//     if (err) return console.error('❌ Search error:', err);
//     if (!uids.length) return console.log('– No new emails');

//     const latest = uids.pop();
//     console.log('🔎 New UID:', latest);

//     const fetcher = imap.fetch(latest, { bodies: [''], markSeen: true });
//     fetcher.on('message', msg => {
//       msg.on('body', async stream => {
//         try {
//           const parsed = await parseEmail(stream);
//           await handleParsed(parsed);
//         } catch (e) {
//           console.error('❌ parse error:', e);
//         }
//       });
//     });
//     fetcher.once('end', () => console.log('✓ Done fetching latest'));
//   });
// }

// async function handleParsed(parsed) {
//   const fromAddr = parsed.from?.value?.[0]?.address;
//   if (!fromAddr) {
//     console.log('⚠️ Missing sender; skipping');
//     return;
//   }

//   const body = (parsed.text || '').trim();
//   const lower = body.toLowerCase();

//   // 1) If it's a leave request, do local date logic
//   if (LEAVE_KEYWORDS.some(k => lower.includes(k))) {
//     // extract first date in YYYY-MM-DD format
//     const match = body.match(/(\d{4}-\d{2}-\d{2})/);
//     if (match) {
//       const reqDate  = new Date(match[1]);
//       const today    = new Date();
//       const diffMs   = reqDate - today;
//       const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

//       let reply;
//       if (diffDays >= 7) {
//         reply = `Your leave request for ${match[1]} is PAID leave (submitted ${diffDays} days in advance).`;
//       } else {
//         reply = `Your leave request for ${match[1]} is UNPAID (only ${diffDays} days’ notice), salary will be deducted.`;
//       }
//       return sendAutoReply(fromAddr, reply);
//     }
//     // no date found → fall through to AI drafting
//   }

//   // 2) All other HR queries (or leave without date) → AI‐drafted reply
//   const draft = await generateHRReply(body);
//   sendAutoReply(fromAddr, draft);
// }

// function startWatcher() {
//   imap.once('ready', () => {
//     imap.openBox('INBOX', false, err => {
//       if (err) throw err;
//       console.log('📬 INBOX opened');
//       imap.on('mail', checkLatest);
//       checkLatest();
//     });
//   });
//   imap.connect();
// }

// module.exports = { startWatcher };