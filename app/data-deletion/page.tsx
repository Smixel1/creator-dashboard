import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { LegalSection } from "@/components/legal/legal-section";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
  PRODUCT_NAME,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | CreatorPulse",
  description:
    "How to disconnect Instagram, delete your CreatorPulse account, and remove associated data.",
};

export default function DataDeletionPage() {
  return (
    <LegalPageShell
      title="Data Deletion Instructions"
      description={`This page explains how to remove your data from ${PRODUCT_NAME}, disconnect Instagram, and request deletion of your account.`}
    >
      <LegalSection title="Overview">
        <p>
          You control the Instagram connection inside {PRODUCT_NAME}. You may
          disconnect Instagram at any time, and you may request deletion of
          your {PRODUCT_NAME} account and associated stored data.
        </p>
      </LegalSection>

      <LegalSection title="Option 1 — Disconnect Instagram">
        <p>
          If you only want to stop {PRODUCT_NAME} from accessing Instagram data:
        </p>
        <ol>
          <li>Sign in to your {PRODUCT_NAME} account.</li>
          <li>Open <strong>Profile</strong>.</li>
          <li>
            In the Instagram section, choose <strong>Disconnect Instagram</strong>.
          </li>
        </ol>
        <p>When you disconnect:</p>
        <ul>
          <li>Future Instagram syncs stop immediately.</li>
          <li>
            The active Instagram connection and encrypted access token are removed
            from our systems.
          </li>
          <li>
            Previously synced Reels and analytics in your account may remain until
            you delete your account or request full deletion (see below).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Option 2 — Delete your CreatorPulse account">
        <p>
          To delete your entire {PRODUCT_NAME} account and associated stored
          data, send a deletion request by email. This is the supported method
          while self-service account deletion is not available in the product
          UI.
        </p>
        <ol>
          <li>
            Email{" "}
            <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>{" "}
            from the email address linked to your {PRODUCT_NAME} account.
          </li>
          <li>
            Use the subject line:{" "}
            <strong>CreatorPulse account deletion request</strong>.
          </li>
          <li>
            Include the email address registered with {PRODUCT_NAME} and a
            brief confirmation that you want your account and associated data
            deleted.
          </li>
        </ol>
        <p>
          After we verify ownership of the account, we will delete or anonymize
          account information, Instagram connection records, encrypted tokens,
          and synced analytics associated with your account, except data we must
          retain for legal, security, or backup purposes for a limited period.
        </p>
      </LegalSection>

      <LegalSection title="Instagram access tokens">
        <p>
          Instagram access tokens are stored only on {PRODUCT_NAME} servers,
          encrypted at rest, and are never sent to the browser. When you
          disconnect Instagram or when your account is deleted, we revoke and
          remove stored tokens from our database as part of the disconnection or
          deletion process.
        </p>
        <p>
          You may also remove {PRODUCT_NAME}&apos;s access from your Instagram
          or Meta account settings. Doing so prevents future API access even if
          a token had previously been issued.
        </p>
      </LegalSection>

      <LegalSection title="What we delete">
        <p>Depending on your request, deletion may include:</p>
        <ul>
          <li>Account profile information (name, email, avatar).</li>
          <li>Session and authentication records.</li>
          <li>Instagram connection metadata and encrypted access tokens.</li>
          <li>Synced Reels, metrics, and analytics stored in your account.</li>
        </ul>
        <p>
          Backup copies may persist for a limited time before being overwritten
          according to our retention cycle. We do not retain deleted data for
          marketing purposes.
        </p>
      </LegalSection>

      <LegalSection title="Timeline">
        <p>
          Disconnect requests take effect immediately in the product. Verified
          account deletion requests are typically processed within 30 days unless
          a longer period is required by law or a technical backup cycle.
        </p>
      </LegalSection>

      <LegalSection title="Contact for deletion requests">
        <p>
          Email:{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>
        </p>
        <p>
          Please contact us from the same email address used for your{" "}
          {PRODUCT_NAME} account so we can verify your request securely.
        </p>
        <p>
          For more information about how we handle personal data, see our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
        <p>Last updated: {LEGAL_LAST_UPDATED}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
