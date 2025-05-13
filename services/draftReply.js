// services/draftReply.js
require('dotenv').config();
const axios = require("axios");
const DEEPSEEK_API_KEY = "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";

const HR_POLICY = `
Mavens Advisor Pvt. Ltd. — Human Resources (HR) Policy

1. Employment Terms  
   • Employment contracts will be issued outlining roles, compensation, and expectations.  
   • A probationary period of 3 months applies to new hires, extendable by another 3 months if required.  
   • Termination by either party requires 30 days' written notice or one month’s salary in lieu. Misconduct can lead to immediate termination without notice or pay.

2. Working Days & Hours  
   • Regular working days are Monday to Friday.  
   • Saturday and Sunday are typically holidays but may be declared as workdays based on business needs.  
   • Office hours are 3:00 PM to 12:00 AM.

3. Attendance & Punctuality  
   • A 15-minute grace period is allowed after 3:00 PM. Arrival after 3:15 PM is marked Late.  
   • Three (03) Late marks result in one (01) full day off.  
   • Arriving more than 3 hours late or leaving more than 3 hours early is considered a half-day.

4. Leave Policy  
   • Employees are entitled to 22 paid leaves per year after confirmation.  
   • Before taking a paid leave, employees must obtain approval from their immediate senior at least 7 working days in advance (or within a reasonable time).  
   • If an email request isn’t received within a reasonable time, leave may still be approved but will be unpaid.  
   • Sandwich Leave Policy: If leave is taken before and/or after an off day, the off day(s) also count as leave.

5. Dress Code  
   • Monday–Wednesday: Dress shirts in light corporate shades and dress pants in dark corporate colors.  
   • Thursday: Corporate casual attire, still professional.  
   • Friday: Traditional wear (shalwar kameez) with a waistcoat.

6. Conduct & Behavior  
   • Employees must act with respect, courtesy, and professionalism.  
   • Smoking is prohibited inside office premises.  
   • Personal calls should be minimized and taken during breaks.  
   • Follow proper conflict resolution procedures.

7. Use of Resources  
   • Office resources are for work-related tasks only.  
   • Practice energy conservation by turning off unused equipment.  
   • Keep workspaces tidy and clean.

8. Confidentiality  
   • Employees are bound by confidentiality and non-disclosure obligations during and after their tenure.  
   • Unauthorized sharing or misuse of company information is grounds for disciplinary action.

9. Intellectual Property  
   • Any work product or intellectual property created during employment belongs to the Company.

10. Conflict of Interest  
   • Employees must disclose any outside business interests or employment and obtain written consent from the CEO.  
   • No engagement in competing businesses is allowed.

11. Whistleblower Protection  
   • Employees are encouraged to report unethical or illegal behavior under the company’s whistleblower policy.

12. Holiday Calendar  
   • The company observes Federal holidays. Management may amend the holiday schedule.
`;

async function generateHRReply(emailBody) {
  try {
    const messages = [
      {
        role: "system",
        content: `
        You are a friendly and concise HR assistant. Always follow these rules when replying to any user email:

        1. Start with a warm greeting like "Hi there," or "Hello,".
        2. If the message is HR-related, paraphrase the most relevant policy in **1–2 lines only** — no long explanations or quotes.
        3. If the message isn’t HR-related (e.g., just a greeting), still reply politely and positively.
        4. Always include a short and polite closing like "Thanks!" or "Hope this helps!".
        5. Your tone should be minimal, professional, and warm — no detailed paragraphs.
        6. Avoid repeating the user’s query or rephrasing it in a long way.
        7. Here is the HR policy for reference:
        ${HR_POLICY}
        `.trim(),
      },
      {
        role: "user",
        content: emailBody.trim(),
      },
    ];

   const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1-zero:free",
        temperature: 0.0,
        top_p: 1.0,
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // **Use the correct env var name here:**
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
      }
    );

    let reply = response?.data?.choices?.[0]?.message?.content?.trim() || "";

    // Final cleanup for plain text — remove code blocks, quotes, brackets
    reply = reply
      .replace(/^json\s*/i, "")                 
      .replace(/^```[a-z]*\n?/gi, "")           
      .replace(/```$/, "")  
      .replace(/^{[\s\S]*?"reply":\s*"(.+?)"\s*}$/s, "$1") 
      .replace(/^["'{[]+|["'}\]]+$/g, "")  
      .replace(/\\boxed{/g, "")
      .trim();

    return reply;
  } catch (error) {
    console.error(
      "❌ Error in generateHRReply:",
      error?.response?.data || error.message
    );
    return "Sorry, I’m unable to quote the policy at this time.";
  }
}

module.exports = { generateHRReply };