import { ArrowLeftIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import Logo from './Logo';
import { LEGAL } from '../lib/legal';
import { FREE_NOTES, IDLE_TIMEOUT_MINUTES, SUPPORT_EMAIL } from '../lib/config';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] text-slate-700 leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

const Email = () => <a href={`mailto:${SUPPORT_EMAIL}`} className="text-brand-600 font-semibold">{SUPPORT_EMAIL}</a>;

function Privacy() {
  return (
    <>
      <p>
        This policy explains how myCareNotes collects, uses and protects personal information. myCareNotes is
        provided by {LEGAL.legalName}, {LEGAL.entityDescription}, of {LEGAL.address} ("we", "us"). We are registered
        with the Information Commissioner's Office (ICO) under reference {LEGAL.icoNumber}.
      </p>

      <Section title="1. Our role">
        <p>
          For your account details, we are the data controller. When care workers or organisations enter information
          about the people they support, the care provider remains responsible for that information and for having a
          lawful basis to record it. Where we provide the service to an organisation under a written agreement, we act
          as its data processor for that information.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <List items={[
          <><strong>Account information:</strong> your name, email address and password. Passwords are stored in encrypted (hashed) form and are never visible to us.</>,
          <><strong>Note content:</strong> the observations you enter and the details you provide with them, such as the care worker's name, the resident or service user's name, the date and the shift. This may include information about a person's health and care, which is special category data under UK GDPR.</>,
          <><strong>Saved notes:</strong> generated notes that you choose to save.</>,
          <><strong>Usage information:</strong> the number of notes remaining on your plan.</>,
          <><strong>Demo usage:</strong> when the shared demo is used, a one-way scrambled (hashed) version of the visitor's IP address and the time of use, to prevent misuse. The original IP address is not stored.</>,
          <><strong>Messages:</strong> anything you send us by email.</>,
        ]} />
      </Section>

      <Section title="3. How we use information">
        <List items={[
          'To create and manage your account and sign you in securely.',
          'To generate care notes from the observations you enter.',
          'To store notes you choose to save so that you can access them later.',
          'To manage the free plan allowance and protect the service from misuse.',
          'To send essential service emails, such as email confirmation and password reset messages.',
          'To respond to enquiries and provide support.',
        ]} />
        <p>We do not sell personal information, use it for advertising, or use your notes to train AI models.</p>
      </Section>

      <Section title="4. Lawful basis">
        <p>
          We process account information to provide the service you have signed up for (performance of a contract) and
          to keep the service secure (legitimate interests). Information about the people you support is processed on
          the care provider's behalf, for the purposes of health and social care. You must only enter information you
          are authorised to record, and we recommend entering only what is needed for the note.
        </p>
      </Section>

      <Section title="5. How notes are generated">
        <p>
          When you select Generate note, your observations and the details entered with them are sent securely to our
          AI provider, Anthropic, to produce the draft note. Anthropic processes this information on our behalf under
          its commercial terms, which do not permit it to use the content to train its models. Generated notes are not
          stored by myCareNotes unless you choose to save them. Every note must be reviewed and approved by the care
          worker before use.
        </p>
      </Section>

      <Section title="6. Who we share information with">
        <p>We use the following service providers to run myCareNotes. Each is bound by contract to protect your information.</p>
        <List items={[
          <><strong>Supabase</strong>: account management and secure database storage ({LEGAL.databaseRegion}).</>,
          <><strong>Anthropic</strong>: AI processing to generate notes (United States).</>,
          <><strong>Cloudflare</strong>: website hosting and security.</>,
          <><strong>Resend</strong>: delivery of service emails (European Union).</>,
        ]} />
        <p>
          Where information is transferred outside the UK, it is protected by safeguards approved under UK data
          protection law, such as the UK International Data Transfer Addendum. We may also disclose information where
          required by law.
        </p>
      </Section>

      <Section title="7. How long we keep information">
        <List items={[
          'Account information: for as long as your account remains open.',
          'Saved notes: until you delete them or close your account.',
          'Generated notes that are not saved: not stored by myCareNotes.',
          'Demo usage records: deleted automatically after 2 days.',
          'Emails to us: for as long as needed to deal with your enquiry.',
        ]} />
      </Section>

      <Section title="8. Security">
        <p>
          Information is encrypted in transit and stored with access controls that allow each user to see only their
          own notes. For security on shared devices, users are signed out automatically after {IDLE_TIMEOUT_MINUTES} minutes
          of inactivity. The shared demo account does not save notes.
        </p>
      </Section>

      <Section title="9. Cookies and local storage">
        <p>
          We do not use advertising or analytics cookies. Your browser stores a sign-in token and the time of your last
          activity so that you stay signed in securely. These are strictly necessary for the service to work.
        </p>
      </Section>

      <Section title="10. Your rights">
        <p>
          Under UK data protection law you have the right to access, correct or delete your personal information, to
          restrict or object to its use, and to receive a copy of it. To exercise these rights, or to close your
          account, contact us at <Email />. If your request concerns a person you support, we may refer it to the
          relevant care provider.
        </p>
        <p>
          If you are unhappy with how we have handled your information, you can complain to the Information
          Commissioner's Office at ico.org.uk.
        </p>
      </Section>

      <Section title="11. Changes to this policy">
        <p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>
      </Section>
    </>
  );
}

function Terms() {
  return (
    <>
      <p>
        These terms apply to your use of myCareNotes, provided by {LEGAL.legalName}, {LEGAL.entityDescription}, of{' '}
        {LEGAL.address} ("we", "us"). By creating an account or using the demo, you agree to these terms.
      </p>

      <Section title="1. The service">
        <p>
          myCareNotes helps care professionals turn brief observations into draft care notes using artificial
          intelligence. It is intended for care workers and care providers in the United Kingdom.
        </p>
      </Section>

      <Section title="2. Your responsibility for notes">
        <List items={[
          'Generated notes are drafts. You must review every note and correct anything that does not accurately reflect your observations before using it.',
          'You remain responsible for the accuracy and content of any note you approve, copy, print or add to a care record, and for meeting your professional, regulatory and employer requirements.',
          'myCareNotes does not provide clinical, medical or legal advice, and does not replace professional judgement.',
          'Use of myCareNotes does not by itself guarantee compliance with CQC or other regulatory requirements.',
        ]} />
      </Section>

      <Section title="3. Information you enter">
        <List items={[
          'You must only enter information you are authorised to record and process, in line with your employer\'s policies and data protection law.',
          'We recommend entering only the information needed for the note.',
          'Do not enter real personal information when using the shared demo account.',
        ]} />
      </Section>

      <Section title="4. Accounts">
        <List items={[
          'You must provide accurate details and keep your password secure.',
          'Accounts are for individual use and must not be shared.',
          'You are responsible for activity on your account. Tell us promptly if you believe it has been used without permission.',
        ]} />
      </Section>

      <Section title="5. Plans and allowances">
        <p>
          The free plan currently includes {FREE_NOTES} notes per account. The shared demo is subject to usage limits.
          We may change, suspend or end free plans and allowances, and will give reasonable notice of any paid plans
          and their prices before you are charged.
        </p>
      </Section>

      <Section title="6. Acceptable use">
        <p>You must not:</p>
        <List items={[
          'use the service for any unlawful purpose or to create misleading records;',
          'use the service for purposes unrelated to care documentation;',
          'attempt to bypass usage limits, access other users\' information, or disrupt the service;',
          'copy, resell or reverse engineer the service.',
        ]} />
        <p>We may suspend or close accounts that breach these terms.</p>
      </Section>

      <Section title="7. Intellectual property">
        <p>
          The myCareNotes name, logo, website and software belong to us. Notes you create are yours to use in your care
          work, subject to the responsibilities above.
        </p>
      </Section>

      <Section title="8. Availability">
        <p>
          We aim to keep myCareNotes available and secure, but we cannot guarantee that it will be uninterrupted or
          error-free. We may update or change the service at any time.
        </p>
      </Section>

      <Section title="9. Liability">
        <p>
          Nothing in these terms limits liability for death or personal injury caused by negligence, for fraud, or for
          anything else that cannot be limited by law. Subject to this, we are not liable for any loss arising from
          notes that were not reviewed and corrected before use, or for indirect or consequential loss. Our total
          liability to you is limited to the amount you have paid us in the 12 months before the claim.
        </p>
      </Section>

      <Section title="10. Closing your account">
        <p>
          You can close your account at any time by contacting <Email />. We may close accounts that have been inactive
          for an extended period, after giving notice by email.
        </p>
      </Section>

      <Section title="11. Changes to these terms">
        <p>
          We may update these terms. If changes are significant, we will notify you by email or in the app. Continuing
          to use myCareNotes after changes take effect means you accept the updated terms.
        </p>
      </Section>

      <Section title="12. Governing law">
        <p>These terms are governed by the laws of England and Wales, and the courts of England and Wales have jurisdiction.</p>
      </Section>

      <Section title="13. Contact">
        <p>Questions about these terms can be sent to <Email />.</p>
      </Section>
    </>
  );
}

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const title = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Use';
  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" aria-label="myCareNotes home"><Logo size="sm" /></a>
          <a href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
            <ArrowLeftIcon size={16} /> Back to myCareNotes
          </a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <article className="card p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {LEGAL.lastUpdated}</p>
          <div className="mt-6 text-[15px] text-slate-700 leading-relaxed">
            {kind === 'privacy' ? <Privacy /> : <Terms />}
          </div>
        </article>
        <p className="mt-6 text-center text-sm text-slate-500">
          <a href={kind === 'privacy' ? '/terms' : '/privacy'} className="text-brand-600 font-semibold">
            {kind === 'privacy' ? 'Terms of Use' : 'Privacy Policy'}
          </a>
          {' · '}
          <Email />
        </p>
      </main>
    </div>
  );
}
