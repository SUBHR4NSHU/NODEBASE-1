# Google OAuth 2.0 Gmail Integration

This plan details the transition from using basic SMTP App Passwords to a professional "Zapier-style" Google OAuth 2.0 integration for the Gmail execution node. This approach allows users to connect their Gmail accounts securely without dealing with passwords, while the system manages offline refresh tokens to execute workflows in the background.

> [!NOTE]
> We will continue using `nodemailer` in the executor because it natively supports OAuth2 authentication when provided with a Refresh Token and Client Credentials. This avoids the complexity of manually constructing raw Base64 email payloads required by the raw Google REST API.

## User Review Required

> [!IMPORTANT]
> **Google Cloud Console Configuration**
> You must configure your Google Cloud project before this feature will work:
> 1. Go to the **Google Cloud Console** and enable the **Gmail API**.
> 2. Create an **OAuth 2.0 Client ID** (Web application).
> 3. Add `http://localhost:3000/api/oauth/google/callback` to the **Authorized redirect URIs**.
> 4. Add the following to your `.env` file:
>    - `GOOGLE_GMAIL_CLIENT_ID=your_client_id`
>    - `GOOGLE_GMAIL_CLIENT_SECRET=your_client_secret`
>    - `GOOGLE_GMAIL_REDIRECT_URI=http://localhost:3000/api/oauth/google/callback`

## Open Questions

None at this time. The plan provides a complete end-to-end flow.

---

## Proposed Changes

### OAuth Integration Routes
We will create a custom standalone OAuth flow distinct from the `better-auth` user login flow, since we are explicitly requesting "offline access" to Gmail, rather than just identifying the user.

#### [NEW] `src/app/api/oauth/google/route.ts`
- Initializes the OAuth consent URL.
- Requests `access_type=offline` and `prompt=consent` to guarantee a refresh token is returned.
- Scopes requested: `https://www.googleapis.com/auth/gmail.send` and `https://www.googleapis.com/auth/userinfo.email` (to fetch the sender's email address).
- Redirects the user to Google. Passes the user-provided Credential Name via the `state` parameter.

#### [NEW] `src/app/api/oauth/google/callback/route.ts`
- Receives the `code` and `state` from Google.
- Exchanges the code for `access_token` and `refresh_token`.
- Fetches the user's email address using Google's userinfo endpoint.
- Verifies the current logged-in NODEBASE user using `auth.api.getSession`.
- Creates a new `Credential` in Prisma where `type = GMAIL`.
- Encrypts a JSON payload containing the `email` and `refreshToken` and saves it to the `value` field.
- Redirects the user back to the Credentials dashboard.

---

### UI / Component Updates

#### [MODIFY] `src/features/credentials/components/credential.tsx`
- Update the `CredentialForm` to dynamically watch the selected `CredentialType`.
- If `type === CredentialType.GMAIL`:
  - Hide the standard "API Key" password input.
  - Replace the "Create" submit button with a "Connect with Google" button.
  - On click, prevent default submission and redirect the window to `/api/oauth/google?name=...`.

#### [MODIFY] `src/features/executions/components/gmail/dialog.tsx`
- Remove the `smtpHost`, `smtpPort`, `smtpUser`, and `smtpPass` fields completely.
- Add a `credentialId` Select dropdown, mirroring the pattern currently used in the `GeminiDialog`.
- Ensure it fetches only credentials of type `GMAIL` using `useCredentialsByType(CredentialType.GMAIL)`.
- Update the Zod `formSchema` to require `credentialId` and remove the SMTP requirements.

---

### Executor Updates

#### [MODIFY] `src/features/executions/components/gmail/executor.ts`
- Update the type signature for `GmailData` to expect `credentialId` instead of SMTP configs.
- Inside the executor, query the database for the provided `credentialId`.
- Decrypt the credential `value` and parse the JSON to extract the `email` and `refreshToken`.
- Initialize `nodemailer.createTransport` with OAuth2 authentication:
  ```javascript
  auth: {
      type: "OAuth2",
      user: credentialData.email,
      clientId: process.env.GOOGLE_GMAIL_CLIENT_ID,
      clientSecret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
      refreshToken: credentialData.refreshToken,
  }
  ```
- Send the email exactly as we did before. Nodemailer will automatically handle exchanging the refresh token for a short-lived access token under the hood.

## Verification Plan

### Automated Tests
- Ensure `npm run build` compiles successfully without type errors in the modified dialogs and executors.

### Manual Verification
- **OAuth Flow**: Create a new Gmail credential from the UI. Verify the redirect to Google's consent screen, successful login, and correct redirect back to the app with a newly created credential.
- **Workflow Execution**: Configure a Gmail node to use the new credential. Trigger the workflow and verify the email is successfully delivered without providing an App Password.
