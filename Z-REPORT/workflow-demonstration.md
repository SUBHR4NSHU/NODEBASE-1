# NODEBASE Workflow Demonstration: Lead Generation & Triage

## Overview
This guide demonstrates an automated lead generation and triage workflow within the NODEBASE platform. It processes a project inquiry submitted via a Google Form, uses Google Gemini to evaluate and format the lead, and then broadcasts customized alerts across Discord, Slack, and Gmail.

**Workflow Sequence:**
`Google Form (Lead Capture)` ➔ `Gemini (Lead Evaluation)` ➔ `Discord (Dev Team)` / `Slack (Sales Team)` / `Gmail (Client Confirmation)`

---

## Form Schema Reference
Based on your Google Form "TESTING NEW WORKFLOW IDEA", the following variables will be automatically passed into NODEBASE when a user submits the form:

- `{{googleForm.respondentEmail}}` (Automatically recorded email)
- `{{googleForm.responses.Full_Name}}`
- `{{googleForm.responses.Work_Email}}`
- `{{googleForm.responses.Phone_Number}}`
- `{{googleForm.responses.Company_Name}}`
- `{{googleForm.responses.Budget_Range}}`
- `{{googleForm.responses.Project_Type}}`
- `{{googleForm.responses.Urgency}}`
- `{{googleForm.responses.Problem_Statement}}`
- `{{googleForm.responses.Notes}}`

---

## Step-by-Step Configuration Guide

### 1. Trigger Node: Google Form
The trigger node initiates the workflow whenever a prospect submits your Google Form.

**Configuration:**
1. Add a **Google Form Trigger** node to the canvas.
2. Click on the node to open the configuration dialog.
3. Copy the generated **Webhook URL**.
4. In your Google Form, click the three dots (⋮) and select **Apps Script**.
5. Paste the NODEBASE-provided Google Apps Script, replace `WEBHOOK_URL` with your unique URL, and save.
6. Set up a trigger in Apps Script: **From form** ➔ **On form submit**.

---

### 2. Execution Node 1: Gemini AI (Lead Evaluator)
This node takes the structured form data and uses Gemini to analyze the urgency, summarize the problem statement, and format a readable alert for the team.

**Configuration:**
1. Connect the output of the Google Form trigger to a new **Gemini** node.
2. Open the Gemini node configuration:
   - **Credential:** Select your connected Gemini API Key.
   - **Model:** `gemini-1.5-pro` (or `gemini-1.5-flash`).
   - **Variable Name:** Set this to `leadAnalysis`.
   - **System Prompt:** 
     ```text
     You are a technical sales assistant. Analyze incoming project leads. Extract the core requirements, highlight the urgency and budget, and generate a concise, professional summary formatted in Markdown. Keep it structured and highly readable for a sales and development team.
     ```
   - **User Prompt:** 
     ```handlebars
     We received a new project inquiry from {{googleForm.responses.Full_Name}} at {{googleForm.responses.Company_Name}}.
     
     **Lead Details:**
     - Contact: {{googleForm.responses.Work_Email}} / {{googleForm.responses.Phone_Number}}
     - Project Type: {{googleForm.responses.Project_Type}}
     - Budget: {{googleForm.responses.Budget_Range}}
     - Urgency: {{googleForm.responses.Urgency}}
     
     **Problem Statement:**
     {{googleForm.responses.Problem_Statement}}
     
     **Additional Notes:**
     {{googleForm.responses.Notes}}
     
     Please provide a brief executive summary of this lead, score its priority based on urgency and budget, and format it nicely for our internal communication channels.
     ```

**Available Variable (Output):**
- `{{leadAnalysis.text}}`

---

### 3. Execution Node 2: Discord (Dev Team Alert)
Notifies the development team about the incoming project type and technical requirements.

**Configuration:**
1. Connect the output of the Gemini node to a new **Discord** node.
2. Open the Discord node configuration:
   - **Webhook URL:** Enter your dev-team Discord channel webhook.
   - **Message Content:** 
     ```handlebars
     🛠️ **New {{googleForm.responses.Project_Type}} Project Lead!**
     **Company:** {{googleForm.responses.Company_Name}}
     **Urgency:** {{googleForm.responses.Urgency}}
     
     **AI Analysis:**
     {{leadAnalysis.text}}
     
     *See the CRM for full contact details.*
     ```

---

### 4. Execution Node 3: Slack (Sales Team Alert)
Alerts the sales team to follow up with the prospect, emphasizing budget and contact details.

**Configuration:**
1. Connect the output of the Gemini node to a new **Slack** node.
2. Open the Slack node configuration:
   - **Webhook URL:** Enter your sales-team Slack channel webhook.
   - **Message Text:** 
     ```handlebars
     💰 *New Lead Alert: {{googleForm.responses.Company_Name}}*
     
     *Contact:* {{googleForm.responses.Full_Name}} (<mailto:{{googleForm.responses.Work_Email}}|{{googleForm.responses.Work_Email}}>)
     *Phone:* {{googleForm.responses.Phone_Number}}
     *Budget:* {{googleForm.responses.Budget_Range}}
     
     *Executive Summary:*
     {{leadAnalysis.text}}
     ```

---

### 5. Execution Node 4: Gmail (Auto-Responder to Client)
Sends a personalized confirmation email directly to the prospect acknowledging their specific project type.

**Configuration:**
1. Connect the Google Form trigger (or the Gemini output) to a new **Gmail** node.
2. Open the Gmail node configuration:
   - **Credential:** Select your authenticated Google OAuth credential.
   - **To:** `{{googleForm.respondentEmail}}`
   - **Subject:** `We received your {{googleForm.responses.Project_Type}} inquiry - {{googleForm.responses.Company_Name}}`
   - **Body:** 
     ```handlebars
     Hi {{googleForm.responses.Full_Name}},
     
     Thank you for reaching out to us regarding your {{googleForm.responses.Project_Type}} needs. We have successfully received your inquiry and problem statement. 
     
     Our team is currently reviewing your notes and considering the best approach given your {{googleForm.responses.Urgency}} timeline and budget. One of our specialists will reach out to you shortly at {{googleForm.responses.Phone_Number}} or via this email.
     
     Best regards,
     The NODEBASE Team
     ```

---

## Workflow Flow Summary

1. **Prospect Action:** A potential client fills out the project inquiry Google Form.
2. **Webhook Triggered:** The submission payload instantly triggers the NODEBASE workflow.
3. **AI Triage:** The Gemini node reads the exact budget, urgency, and problem statement to synthesize a readable "Lead Analysis".
4. **Targeted Broadcast:** 
   - **Discord** pings the development team with a focus on project scope and AI analysis.
   - **Slack** pings the sales team with a focus on contact details and budget.
   - **Gmail** sends a personalized, dynamic auto-responder back to the prospect assuring them that their specific problem statement is under review.
