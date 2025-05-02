const Imap = require("imap");
const imapConfig = require("../config/imapConfig");
const { parseEmail } = require("../utils/parser");
const hrResponses = require("../services/hrResponses");
const { sendAutoReply } = require("../services/mailService");
const { generateHRReply } = require("../services/draftReply");

const imap = new Imap(imapConfig);

imap.on("error", (err) => console.error("🔥 IMAP Error:", err));

function checkLatest() {
  imap.search(["UNSEEN"], (err, uids) => {
    if (err) return console.error("❌ Search error:", err);
    if (!uids.length) return console.log("– No new emails");

    const latest = uids.pop();
    console.log("🔎 New UID:", latest);

    const fetcher = imap.fetch(latest, { bodies: [""], markSeen: true });
    fetcher.on("message", (msg) => {
      msg.on("body", async (stream) => {
        try {
          const parsed = await parseEmail(stream);
          const fromAddr = parsed.from?.value[0]?.address;
          if (!fromAddr) return console.log("⚠️ Missing sender; skipping");

          const body = (parsed.text || "").trim().toLowerCase();
          console.log(`✉️ From ${fromAddr}: ${body.slice(0, 50)}…`);

          const key = Object.keys(hrResponses).find((k) => body.includes(k));
          if (key) {
            console.log("✅ Matched:", key);
            const draft = await generateHRReply(body);
            // 2) Send that AI‐drafted reply
            sendAutoReply(fromAddr, draft);
          } else {
            console.log("⚠️ No HR keyword found; skipping");
          }
        } catch (e) {
          console.error("❌ parse error:", e);
        }
      });
    });
    fetcher.once("end", () => console.log("✓ Done fetching latest"));
  });
}

function startWatcher() {
  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err) => {
      if (err) return console.error("❌ openBox:", err);
      console.log("📬 INBOX opened");
      imap.on("mail", checkLatest);
      checkLatest();
    });
  });
  imap.connect();
}

module.exports = { startWatcher };