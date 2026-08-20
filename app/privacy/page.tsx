import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { LegalSection } from "@/components/legal/legal-section";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
  PRODUCT_NAME,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | CreatorPulse",
  description:
    "How CreatorPulse collects, uses, stores, and protects your account and Instagram data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description={`This Privacy Policy describes how ${PRODUCT_NAME} handles personal information when you create an account, connect Instagram, and use our creator analytics tools.`}
    >
      <LegalSection title="Overview">
        <p>
          {PRODUCT_NAME} is a creator analytics platform that helps you
          understand performance of your Instagram Reels. We process only the
          information needed to provide the service, keep your account secure,
          and sync Instagram data you authorize.
        </p>
        <p>
          By using {PRODUCT_NAME}, you agree to the practices described in this
          policy. If you do not agree, please do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>
          <strong>Account and registration data.</strong> When you register, we
          collect your name, email address, and a hashed password. We may also
          store optional profile details you provide, such as an avatar.
        </p>
        <p>
          <strong>Email and account information.</strong> We use your email to
          identify your account, communicate about security or service updates,
          and support password recovery when enabled.
        </p>
        <p>
          <strong>Instagram OAuth connection.</strong> If you choose to connect
          Instagram, we receive authorization through Meta&apos;s Instagram Login
          (OAuth). We store connection metadata such as your Instagram user ID,
          username, account type, profile picture URL, and token expiry
          information.
        </p>
        <p>
          <strong>Instagram profile, media, and Insights data.</strong> After
          you connect and sync, we may store Instagram professional account
          information and Reels-related data permitted by the scopes you
          approve, such as media metadata, public engagement metrics, follower
          counts, and insights where available through the Instagram API.
        </p>
        <p>
          <strong>Usage and technical data.</strong> We may collect basic
          technical information required to operate the service, such as session
          identifiers, browser type, and error logs needed for security and
          reliability.
        </p>
      </LegalSection>

      <LegalSection title="How we use your information">
        <ul>
          <li>Authenticate you and maintain your {PRODUCT_NAME} account.</li>
          <li>
            Connect and sync your Instagram professional account at your request.
          </li>
          <li>
            Display dashboards, analytics, and Reels performance inside your
            account.
          </li>
          <li>Protect the service against abuse, fraud, and unauthorized access.</li>
          <li>Improve reliability, fix errors, and support customer requests.</li>
          <li>Comply with applicable legal obligations.</li>
        </ul>
        <p>
          We do not sell your personal information. We do not use Instagram
          data for advertising profiling unrelated to operating {PRODUCT_NAME}.
        </p>
      </LegalSection>

      <LegalSection title="Data storage and security">
        <p>
          Account data and synced Instagram data are stored in secure
          cloud-hosted databases. Instagram access tokens are stored on the
          server only and are encrypted at rest. Tokens are never exposed to
          the browser or client-side storage.
        </p>
        <p>
          We use industry-standard safeguards such as HTTPS, hashed passwords,
          httpOnly session cookies, and access controls that limit data to the
          authenticated account owner. No method of transmission or storage is
          completely secure, but we work to protect your information
          responsibly.
        </p>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          {PRODUCT_NAME} relies on trusted third-party providers to operate the
          service, including:
        </p>
        <ul>
          <li>
            <strong>Meta / Instagram</strong> — OAuth authorization, profile,
            media, and insights data you choose to connect.
          </li>
          <li>
            <strong>Cloud hosting and database providers</strong> — application
            hosting, infrastructure, and data storage.
          </li>
          <li>
            <strong>Email delivery providers</strong> — optional transactional
            email such as password reset messages when configured.
          </li>
        </ul>
        <p>
          These providers process data according to their own terms and
          policies. Your use of Instagram is also subject to Meta&apos;s terms
          and privacy policies.
        </p>
      </LegalSection>

      <LegalSection title="Your choices and rights">
        <p>
          <strong>Disconnect Instagram.</strong> You can disconnect Instagram at
          any time from your Profile settings inside {PRODUCT_NAME}. Disconnecting
          stops future syncs and removes the active connection from your account.
        </p>
        <p>
          <strong>Request deletion.</strong> You may request deletion of your
          {PRODUCT_NAME} account and associated data. See our{" "}
          <a href="/data-deletion">Data Deletion Instructions</a> for steps.
        </p>
        <p>
          Depending on your location, you may have additional rights to access,
          correct, or delete personal information. Contact us to exercise these
          rights.
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <p>
          We retain account information for as long as your account is active or
          as needed to provide the service. Instagram connection data and synced
          Reels analytics are retained while your account remains active and
          Instagram stays connected, unless you disconnect or request deletion.
        </p>
        <p>
          When you disconnect Instagram or delete your account, we delete or
          anonymize associated data within a reasonable period, except where
          retention is required for security, legal compliance, or backup
          cycles.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          For privacy questions, data access requests, or deletion requests,
          contact us at{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
          Please include the email address associated with your {PRODUCT_NAME}{" "}
          account so we can verify your request.
        </p>
        <p>Last updated: {LEGAL_LAST_UPDATED}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
