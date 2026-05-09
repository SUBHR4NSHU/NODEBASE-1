# NODEBASE Workflow Demonstration Guide: Intelligent Customer Support Triage

This guide outlines how to set up a powerful, real-world workflow using NODEBASE. This demonstration showcases the platform's ability to seamlessly integrate triggers, AI processing, team communication, and automated email responses.

## 🎯 The Scenario

**Use Case**: Automated Customer Support & Feedback Triage

When a customer submits a support ticket or feedback via a Google Form, NODEBASE will automatically:
1. Catch the form submission.
2. Use **Gemini AI** to analyze the message's sentiment and draft a personalized response.
3. Alert the support team on **Discord** if the issue is urgent.
4. Log a summary of the feedback to the team's **Slack** channel.
5. Send an automated acknowledgment email to the customer via **Gmail**.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following credentials and URLs ready:
- **Google Form**: A published form with fields for *Name*, *Email*, and *Message*.
- **Gemini API Key**: Added to your NODEBASE credentials.
- **Discord Webhook URL**: Created in your Discord server's channel settings (e.g., `#urgent-support`).
- **Slack Webhook URL**: Created in your Slack workspace (e.g., `#customer-feedback`).
- **Gmail Account**: Configured via OAuth or SMTP in your NODEBASE settings.

---

## 📝 Step-by-Step Setup Guide

### Step 1: Initialize the Workflow
1. Create a new workflow in NODEBASE.
2. Name it **"Customer Support Triage"**.

### Step 2: Configure the Trigger (Google Form)
1. Drag the **Google Form** trigger node onto the canvas.
2. **Double-click** the node to open settings.
3. Link your specific Google Form to this trigger.
4. **Output Variables**: The node will output the form data. Let's assume the variable is named `{{trigger.formData}}` (containing `Name`, `Email`, and `Message`).

### Step 3: Add AI Processing (Gemini)
1. Drag the **Gemini** node onto the canvas and connect it to the Google Form node.
2. **Double-click** the Gemini node to open settings.
3. **Configuration**:
   - **Credential**: Select your Gemini API Key.
   - **Model**: Select `gemini-1.5-flash` or `gemini-1.5-pro` (optimized for fast text analysis).
   - **System Prompt**: 
     ```text
     You are an expert customer support assistant. Analyze the following customer message. 
     1. Determine the sentiment (Positive, Neutral, Negative/Urgent).
     2. Draft a polite, helpful 1-2 paragraph response acknowledging their message.
     Format your output clearly.
     ```
   - **User Prompt**:
     ```text
     Customer Name: {{trigger.formData.Name}}
     Message: {{trigger.formData.Message}}
     ```
4. **Variable Name**: Set this to `geminiAnalysis` so subsequent nodes can use the AI's output.

### Step 4: Set up Urgent Alerts (Discord)
1. Drag the **Discord** node onto the canvas and connect it to the Gemini node.
2. **Double-click** to open settings.
3. **Configuration**:
   - **Webhook URL**: Paste your `#urgent-support` Discord webhook URL.
   - **Content**: 
     ```text
     🚨 **New Customer Ticket** 🚨
     **From**: {{trigger.formData.Name}}
     **Email**: {{trigger.formData.Email}}
     
     **Message**:
     {{trigger.formData.Message}}
     
     **AI Sentiment & Draft Response**:
     {{geminiAnalysis.output}}
     ```

### Step 5: Log to Team Channel (Slack)
1. Drag the **Slack** node onto the canvas (you can connect this in parallel to Gemini, or sequentially after Discord).
2. **Double-click** to open settings.
3. **Configuration**:
   - **Webhook URL**: Paste your `#customer-feedback` Slack webhook URL.
   - **Content**:
     ```text
     📋 *New Feedback Received*
     *Customer:* {{trigger.formData.Name}}
     *AI Analysis:* {{geminiAnalysis.output}}
     ```

### Step 6: Send Customer Acknowledgment (Gmail)
1. Drag the **Gmail** node onto the canvas and connect it appropriately.
2. **Double-click** to open settings.
3. **Configuration**:
   - **To**: `{{trigger.formData.Email}}`
   - **Subject**: `Re: Your message to our support team`
   - **Body**: 
     ```text
     Hi {{trigger.formData.Name}},
     
     Thank you for reaching out to us. 
     
     {{geminiAnalysis.output}}
     
     Best regards,
     The Support Team
     ```
   - *Note: Ensure your SMTP/OAuth credentials are selected or filled out in the Gmail node.*

---

## ▶️ Running the Demonstration

1. **Save and Deploy** your workflow.
2. **Test the Trigger**: Open your Google Form and submit a test response:
   - *Name*: John Doe
   - *Email*: john.doe@example.com
   - *Message*: "I am extremely frustrated! My account has been locked for 2 days and I need urgent help!"
3. **Observe the Magic**:
   - Watch the workflow execution logs in NODEBASE.
   - Check your **Discord** channel for the urgent alert and sentiment analysis.
   - Check your **Slack** channel for the logged feedback.
   - Check the test email inbox (or Gmail sent folder) for the automated, empathetic response drafted by Gemini.

## 💡 Why This Workflow is Useful
- **Efficiency**: Eliminates manual triaging of incoming support tickets.
- **Speed**: Customers get an immediate, context-aware acknowledgment.
- **Visibility**: The whole team stays informed via Slack, while critical issues are escalated instantly via Discord.
