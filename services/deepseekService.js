// services/deepseekService.js
const axios = require('axios');

const HR_POLICY = `
Mavens Advisor Pvt. Ltd. — Human Resources (HR) Policy

1. Employment Terms  
   • Contracts outline roles, compensation, expectations.  
   • 3-month probation, extendable by 3 months.  
   • 30 days' notice or pay in lieu; immediate termination for misconduct.

2. Working Days & Hours  
   • Mon–Fri regular days; weekends holidays unless otherwise.  
   • 3:00 PM to 12:00 AM office hours.

3. Attendance & Punctuality  
   • 15-minute grace; after 3:15 PM is Late.  
   • 3 Lates = 1 day off; >3 hours late/early = half-day.

4. Leave Policy  
   • 22 paid leaves/year after confirmation.  
   • ≥7 working days’ notice for paid leave; otherwise unpaid.  
   • Sandwich rule applies around off-days.

5. Dress Code  
   • Mon–Wed: light shirts + dark pants.  
   • Thu: corporate casual.  
   • Fri: traditional (shalwar kameez) + waistcoat.

6. Conduct & Behavior  
   • Respectful, professional; no smoking; minimal personal calls.

7. Use of Resources  
   • For work only; conserve energy; keep areas tidy.

8. Confidentiality  
   • Bound by NDA during and after tenure.

9. Intellectual Property  
   • All IP created belongs to the Company.

10. Conflict of Interest  
   • Disclose outside interests; no competing work.

11. Whistleblower Protection  
   • Report unethical or illegal behavior.

12. Holiday Calendar  
   • Federal holidays observed; schedule may change.

---  
Use this policy to decide if an email is related to HR topics (employment, leave, attendance, benefits, policy questions, etc.).  
`;
async function classifyEmail(text) {
  try {
    const resp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model:       "deepseek/deepseek-r1-zero:free",
        temperature: 0.0,
        top_p:       1.0,
        messages: [
          { role: "system", content: HR_POLICY.trim() },
          {
            role: "user",
            content: `
You are an email classifier. Using ONLY the policy above, respond with EXACTLY ONE JSON OBJECT:

  {"is_hr": true}

or

  {"is_hr": false}

and nothing else.

Email:
---
${text.trim()}
---
`.trim()
          }
        ]
      },
      {
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    let reply = resp.data.choices?.[0]?.message?.content?.trim() || "";

    // Strip any wrapping code fences or box markers
    reply = reply
      .replace(/```json\s*/, '')
      .replace(/```/, '')
      .replace(/^\\boxed\{/, '{')
      .replace(/\}$/, '}')
      .trim();

    // Extract the first {...} block
    const m = reply.match(/\{[\s\S]*\}/);
    if (!m) throw new Error(`No JSON object found in reply: ${reply}`);

    const parsed = JSON.parse(m[0]);
    return parsed.is_hr === true;

  } catch (err) {
    console.error('❌ classifyEmail error:', err.response?.data || err.message);
    return false;
  }
}

module.exports = { classifyEmail };
