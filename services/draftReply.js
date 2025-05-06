const axios = require("axios");

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

async function generateHRReply(body) {
   try {
     const resp = await axios.post(
       "https://openrouter.ai/api/v1/chat/completions",
       {
         model:       "deepseek/deepseek-r1-zero:free",
         temperature: 0.0,
         top_p:       1.0,
         messages: [
           {
             role: "system",
             content: `
                        You are a policy‐quoting assistant.  You have the HR policy below.
                        
                        - If the user’s question **exactly matches** one of the bullet points, reply with **only** that bullet (verbatim).
                        - Otherwise, reply with a **one‐to‐two‐sentence summary** of the most relevant policy section.
                        - Do **not** include greetings, explanations, or extra text—just the bullet or summary.
                        
                        HR Policy:
                        ${HR_POLICY}
             `.trim(),
           },
           {
             role: "user",
             content: body.trim(),
           },
         ],
       },
       {
         headers: {
           "Content-Type":  "application/json",
           Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
         },
       }
     );
 
     let reply = resp.data.choices?.[0]?.message?.content?.trim() || "";
 
     // Clean up any code fences or boxing
     reply = reply
       .replace(/```/g, "")
       .replace(/^\\boxed\{/, "")
       .replace(/\}$/, "")
       .trim();
 
     // If the model answered with an empty string (unlikely), fall back to a generic line
     if (!reply) {
       reply = "Sorry, I couldn’t find a matching policy. Please reach out to HR for clarification.";
     }
 
     return reply;
   } catch (err) {
     console.error("❌ draftReply error:", err.response?.data || err.message);
     return "Sorry, I couldn’t generate a policy quote right now.";
   }
 }
 
 module.exports = { generateHRReply };