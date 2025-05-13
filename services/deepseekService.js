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
   • Office resources must be used only for work-related tasks.
   • Employees must practice energy conservation by turning off unused equipment.
   • Workspaces should be kept tidy and clean.
   
8. Confidentiality  
   • Employees are bound by confidentiality and non-disclosure obligations throughout and beyond their tenure.
   • Unauthorized sharing or misuse of company information is grounds for disciplinary action.

9. Intellectual Property  
   • Any work product or intellectual property created during employment is the property of the Company.

10. Conflict of Interest  
   • Employees must disclose any outside business interests or employment and receive written consent from the CEO.
   • No engagement in competing businesses is allowed.

11. Whistleblower Protection  
   • Employees are encouraged to report unethical or illegal behavior in line with the company's whistleblower policy.

12. Holiday Calendar  
   • FThe company observes Federal holidays. Management reserves the right to amend the holiday schedule..

---  
Use this policy to decide if an email is related to HR topics (employment, leave, attendance, benefits, policy questions, etc.).  
`;
async function classifyEmail(text) {
   let raw = '';
   try {
     const resp = await axios.post(
       'https://openrouter.ai/api/v1/chat/completions',
       {
         model:       "qwen/qwen3-0.6b-04-28:free",
         temperature: 0.0,
         top_p:       1.0,
         messages: [
           { role: "system", content: HR_POLICY.trim() },
           {
             role: "user",
             content: `
                     You are an email classifier.  Using ONLY the policy above, respond with EXACTLY this JSON (and nothing else):
                     
                     {"is_hr": true}
                     
                     or
                     
                     {"is_hr": false}
                     
                     depending on whether the email asks about any HR policy topic.
                     
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
 
     raw = resp.data.choices?.[0]?.message?.content?.trim() || '';
     console.log('📥 Raw classifier reply:', JSON.stringify(raw));
 
     // strip code fences / box markers
     raw = raw
       .replace(/```(?:json)?\s*/gi, '')
       .replace(/```/g, '')
       .replace(/^\\boxed\{/, '{')
       .replace(/\}$/, '}')
       .trim();
 
     // extract first {...}
     const m = raw.match(/\{[\s\S]*\}/);
     if (m) {
       const obj = JSON.parse(m[0]);
       return obj.is_hr === true;
     }
 
     throw new Error('no JSON');
 
   } catch (err) {
     console.warn('⚠️ classifyEmail fallback (treating as HR):', err.message);
     // Because we couldn’t parse JSON, assume HR so we don’t skip real HR queries
     return true;
   }
 }
 
 module.exports = { classifyEmail };