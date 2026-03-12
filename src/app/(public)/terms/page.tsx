'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';

const LAST_UPDATED = 'March 9, 2026';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By creating an account or using the Portify platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.\n\nThese Terms constitute a legally binding agreement between you and Portify, Inc. ("Portify", "we", "us", or "our").`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 13 years of age to use Portify. By using the Service, you represent that you are at least 13 years old. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.\n\nThe Service is intended for individuals and businesses. If you register on behalf of a company, you represent that you have authority to bind that company to these Terms.`,
  },
  {
    id: 'accounts',
    title: '3. Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:\n\n• Provide accurate and complete registration information\n• Keep your password secure and not share it with others\n• Notify us immediately at security@portify.dev if you suspect unauthorised access\n• Not create accounts for deceptive purposes or to impersonate others\n\nWe reserve the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use',
    content: `You may use Portify only for lawful purposes and in accordance with these Terms. You agree NOT to:\n\n• Upload, publish, or transmit content that is unlawful, defamatory, harassing, abusive, fraudulent, obscene, or otherwise objectionable\n• Infringe or violate intellectual property rights of any third party\n• Attempt to gain unauthorised access to other user accounts or Portify's systems\n• Use automated tools (bots, scrapers) to access the Service without prior written consent\n• Reverse-engineer, decompile, or disassemble any part of the Service\n• Use the Service to send spam or unsolicited communications\n• Impersonate any person or entity, or misrepresent your affiliation\n• Upload malware, viruses, or any malicious code`,
  },
  {
    id: 'content',
    title: '5. Your Content',
    content: `You retain ownership of all content you upload to Portify ("User Content"). By uploading User Content, you grant Portify a non-exclusive, worldwide, royalty-free licence to host, store, display, and reproduce your User Content solely for the purpose of operating the Service.\n\nYou represent and warrant that:\n• You own or have the necessary rights to your User Content\n• Your User Content does not infringe any third-party intellectual property rights\n• Your User Content does not violate any applicable law\n\nWe reserve the right to remove User Content that violates these Terms without prior notice.`,
  },
  {
    id: 'subscriptions',
    title: '6. Subscriptions & Payments',
    content: `Portify offers a free tier and paid subscription plans ("Pro", "Team"). By subscribing to a paid plan:\n\n• You authorise us to charge the applicable subscription fee to your payment method on a recurring basis\n• Subscriptions automatically renew unless cancelled before the renewal date\n• Prices may change; we will provide at least 30 days' notice before price changes take effect\n• All fees are exclusive of taxes; you are responsible for applicable taxes in your jurisdiction\n\n**Refund Policy:** We offer a 14-day refund from the date of your first paid subscription. After this window, fees are non-refundable. If you cancel, you retain access to paid features until the end of your current billing period.`,
  },
  {
    id: 'public-portfolios',
    title: '7. Public Portfolios',
    content: `When you publish your portfolio, it becomes publicly accessible via your unique URL. You understand that:\n\n• Anyone on the internet can view your published portfolio\n• Search engines may index your published portfolio\n• You are solely responsible for the accuracy of content in your portfolio\n• Portify is not responsible for how third parties use or interpret public portfolio content`,
  },
  {
    id: 'intellectual-property',
    title: '8. Intellectual Property',
    content: `The Portify Service, including its design, templates, codebase, branding, and trademarks, is owned by Portify, Inc. and protected by intellectual property laws. You may not copy, reproduce, distribute, or create derivative works from our proprietary assets without express written permission.\n\nThe free templates provided by Portify are licensed to you for use solely within the Service. You may not extract or redistribute template code outside of Portify.`,
  },
  {
    id: 'disclaimers',
    title: '9. Disclaimers',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.\n\nWe do not warrant that:\n• The Service will be uninterrupted or error-free\n• Any defects will be corrected\n• The Service is free of viruses or other harmful components\n• Results obtained from using the Service will be accurate or reliable`,
  },
  {
    id: 'limitation-of-liability',
    title: '10. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORTIFY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.\n\nIN NO EVENT SHALL PORTIFY'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID TO PORTIFY IN THE 12 MONTHS PRECEDING THE CLAIM.`,
  },
  {
    id: 'termination',
    title: '11. Termination',
    content: `You may delete your account at any time from your dashboard settings. Upon deletion, your data will be removed within 30 days.\n\nWe may suspend or terminate your account immediately, without notice, if you violate these Terms. Upon termination:\n• Your access to the Service will cease\n• Your published portfolios will be taken offline\n• Your data will be deleted per our Privacy Policy`,
  },
  {
    id: 'governing-law',
    title: '12. Governing Law & Disputes',
    content: `These Terms are governed by the laws of the State of California, USA, without regard to conflict of law principles. Any disputes arising from these Terms or the Service will be resolved through binding arbitration in San Francisco, California, except that either party may seek injunctive relief in a court of competent jurisdiction for intellectual property infringement.`,
  },
  {
    id: 'changes',
    title: '13. Changes to Terms',
    content: `We may modify these Terms at any time. We will notify you of material changes via email or in-app notification at least 14 days before the changes take effect. Your continued use of the Service after the effective date constitutes acceptance of the revised Terms.`,
  },
  {
    id: 'contact',
    title: '14. Contact',
    content: `Questions about these Terms? Contact us at legal@portify.dev\n\nPortify, Inc.\n340 Pine Street, Suite 800\nSan Francisco, CA 94104\nUnited States`,
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 sm:pt-28 pb-20">
        {/* Background glow */}
        <div className="pointer-events-none fixed -top-40 left-1/2 h-125 w-150 -translate-x-1/2 rounded-full bg-(--color-secondary) opacity-[0.04] blur-[140px]" />

        <Container maxWidth="2xl" className="relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 border-b border-white/6 pb-10"
          >
            <span className="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.22em] text-(--color-primary)">
              Legal
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-(--color-text-muted)">
              Last updated:{' '}
              <span className="text-white/70">{LAST_UPDATED}</span>
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-(--color-text-muted)">
              Please read these Terms of Service carefully before using Portify. By accessing or
              using our Service, you agree to be bound by these Terms.
            </p>
          </motion.div>

          {/* Table of Contents */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 rounded-xl border border-white/6 bg-white/2 p-6"
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-(--color-text-muted)">
              Contents
            </h2>
            <ol className="space-y-1.5">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-(--color-text-muted) transition-colors hover:text-white"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map((section, i) => (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="scroll-mt-28"
              >
                <h2 className="mb-5 text-xl font-semibold text-white">{section.title}</h2>
                <div className="whitespace-pre-line text-sm leading-relaxed text-(--color-text-muted)">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
