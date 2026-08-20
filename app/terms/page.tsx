import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { LegalSection } from "@/components/legal/legal-section";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
  PRODUCT_NAME,
} from "@/lib/legal/constants";

export const metadata: Metadata = {
  title: "Terms of Service | CreatorPulse",
  description:
    "Terms governing your use of CreatorPulse, including accounts and Instagram integration.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description={`These Terms of Service govern access to and use of ${PRODUCT_NAME}. Please read them carefully before creating an account or connecting Instagram.`}
    >
      <LegalSection title="Agreement to these Terms">
        <p>
          By accessing or using {PRODUCT_NAME}, you agree to these Terms. If you
          use the service on behalf of an organization, you represent that you
          have authority to bind that organization. If you do not agree, do not
          use the service.
        </p>
      </LegalSection>

      <LegalSection title="Use of CreatorPulse">
        <p>
          {PRODUCT_NAME} provides creator-focused analytics and workflow tools
          for Instagram Reels. You may use the service only for lawful purposes
          and in accordance with these Terms. You are responsible for activity
          that occurs under your account.
        </p>
        <p>
          We may update features, interfaces, or availability over time. We will
          try to avoid disruptive changes, but we do not guarantee that any
          particular feature will remain available indefinitely.
        </p>
      </LegalSection>

      <LegalSection title="User accounts">
        <ul>
          <li>You must provide accurate registration information.</li>
          <li>
            You are responsible for safeguarding your login credentials and
            notifying us if you suspect unauthorized access.
          </li>
          <li>
            You must be at least the minimum age required to use online services
            in your jurisdiction.
          </li>
          <li>
            One person or entity should not share account access in a way that
            violates these Terms or compromises security.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Instagram integration">
        <p>
          Connecting Instagram is optional. When you connect, you authorize{" "}
          {PRODUCT_NAME} to access Instagram data through Meta&apos;s APIs
          according to the permissions you approve during OAuth.
        </p>
        <p>
          You must have the rights to the Instagram account you connect. You
          remain subject to Meta&apos;s Platform Terms, Instagram Terms of Use,
          and applicable developer policies. {PRODUCT_NAME} is not affiliated
          with, endorsed by, or operated by Meta.
        </p>
        <p>
          You may disconnect Instagram at any time from your Profile settings.
          Disconnecting stops future data collection through our integration.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Use the service to violate laws or third-party rights.</li>
          <li>
            Attempt to bypass authentication, scrape unauthorized data, or
            interfere with service operation.
          </li>
          <li>
            Reverse engineer, resell, or misuse API access except as permitted
            by these Terms.
          </li>
          <li>
            Upload malicious code or use the service to distribute spam or
            harmful content.
          </li>
          <li>
            Misrepresent your identity or connection to any Instagram account.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Third-party services">
        <p>
          {PRODUCT_NAME} integrates with third-party services such as Meta /
          Instagram and cloud infrastructure providers. We are not responsible
          for third-party services, their availability, or their policies. Your
          use of those services is governed by their separate terms.
        </p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We strive to keep {PRODUCT_NAME} available and reliable, but the
          service is provided on an &quot;as available&quot; basis. Maintenance,
          outages, third-party API limits, or force majeure events may cause
          interruptions. We may modify or discontinue parts of the service with
          reasonable notice when practicable.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may stop using {PRODUCT_NAME} at any time and may request account
          deletion as described in our Data Deletion Instructions. We may
          suspend or terminate access if you violate these Terms, create security
          risk, or if required by law.
        </p>
        <p>
          Upon termination, your right to use the service ends. Provisions that
          by nature should survive termination will remain in effect.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and limitation of liability">
        <p>
          To the fullest extent permitted by law, {PRODUCT_NAME} is provided
          &quot;as is&quot; and &quot;as available&quot; without warranties of
          any kind, whether express or implied, including implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>
        <p>
          To the fullest extent permitted by law, {PRODUCT_NAME} and its
          operators will not be liable for indirect, incidental, special,
          consequential, or punitive damages, or for loss of profits, data, or
          goodwill, arising from your use of the service or any third-party
          integration.
        </p>
        <p>
          Our total liability for any claim relating to the service will not
          exceed the amount you paid us to use {PRODUCT_NAME} in the twelve (12)
          months before the event giving rise to the claim, or zero if you use
          the service without charge.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these Terms may be sent to{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
        </p>
        <p>Last updated: {LEGAL_LAST_UPDATED}</p>
      </LegalSection>
    </LegalPageShell>
  );
}
