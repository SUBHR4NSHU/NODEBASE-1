# Add Nvidia and OpenRouter Credentials

This plan outlines the steps to allow users to add their Nvidia and OpenRouter API keys within the credentials section of the app. Since the backend `CredentialType` enum and `schema.prisma` have already been updated, we only need to update the UI components to display these new options.

## User Review Required

Please review the proposed changes below. The updates are isolated to the UI components responsible for rendering the credential creation form and the credentials list. 

## Proposed Changes

---

### UI Components

#### [MODIFY] [credential.tsx](file:///c:/Users/Vanquish/Downloads/NODEBASE/src/features/credentials/components/credential.tsx)
Update the `credentialTypeOptions` array to include the new providers so users can select them when creating a new credential:
- Add `CredentialType.NVIDIA` with label 'Nvidia' and logo `/logos/nvidia-color.svg`.
- Add `CredentialType.OPENROUTER` with label 'OpenRouter' and logo `/logos/openrouter (1).svg`.

#### [MODIFY] [credentials.tsx](file:///c:/Users/Vanquish/Downloads/NODEBASE/src/features/credentials/components/credentials.tsx)
Update the `credentialLogos` record to map the new credential types to their respective logos, ensuring they display correctly in the credentials list view:
- Add `[CredentialType.NVIDIA]: '/logos/nvidia-color.svg'`.
- Add `[CredentialType.OPENROUTER]: '/logos/openrouter (1).svg'`.

## Verification Plan

### Manual Verification
- Navigate to the Credentials page and verify that "Nvidia" and "OpenRouter" are available options in the "Type" dropdown when creating a new credential.
- Create a test credential for both Nvidia and OpenRouter.
- Verify that the created credentials appear in the credentials list with their correct logos and labels.
