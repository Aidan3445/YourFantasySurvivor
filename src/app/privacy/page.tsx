import { TorchIcon } from '~/components/icons/generated';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { type Metadata } from 'next';
import Spacer from '~/components/shared/floatingActions/spacer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Trial by Fire',
  description: 'Privacy policy for the Trial by Fire fantasy Survivor app.',
};

export default function PrivacyPolicyPage() {
  return (
    <ScrollArea className='overflow-y-visible px-4 md:h-[calc(100svh-1rem)] h-[calc(100svh-var(--navbar-height))]'>
      <div className='mx-auto py-4 space-y-4'>
        <section className='rounded-xl bg-card p-6 border-2 border-primary/20 space-y-4'>
          {/* Header */}
          <div className='flex flex-col items-center text-center gap-4'>
            <div className='flex items-center justify-center w-16 h-16 rounded-2xl border-2 bg-primary/10 border-primary/20'>
              <TorchIcon size={36} className='text-primary' />
            </div>
            <div className='space-y-2'>
              <h1 className='text-3xl font-black uppercase tracking-tight'>Privacy Policy</h1>
              <p className='text-muted-foreground text-sm'>Last updated: February 15, 2026</p>
            </div>
          </div>
        </section>

        <section className='rounded-xl bg-card p-6 border-2 border-primary/20 space-y-6 text-sm leading-relaxed text-muted-foreground'>
          <PolicySection title='Overview'>
            Trial by Fire (&quot;we,&quot; &quot;our,&quot; or &quot;the app&quot;) is a fantasy
            game companion for Survivor fans. This privacy policy explains how we collect, use,
            and protect your information when you use our mobile app and website.
          </PolicySection>

          <PolicySection title='Information We Collect'>
            <strong className='text-foreground'>Account Information:</strong> When you create an
            account, we collect your name, email address, and username through our authentication
            provider (Clerk). This is required to identify you within leagues and provide core
            app functionality.
            <br /><br />
            <strong className='text-foreground'>League &amp; Gameplay Data:</strong> We store data
            you create within the app, including league memberships, draft picks, predictions,
            scores, display names, and league settings. This data is necessary to operate the
            fantasy game.
            <br /><br />
            <strong className='text-foreground'>Device Information:</strong> If you enable push
            notifications, we collect your device&apos;s push notification token to deliver
            episode reminders and scoring updates.
          </PolicySection>

          <PolicySection title='How We Use Your Information'>
            We use your information to:
            <br /><br />
            &bull; Provide and operate the fantasy game experience
            <br />
            &bull; Authenticate your account and manage league memberships
            <br />
            &bull; Send push notifications you&apos;ve opted into (episode reminders, score updates)
            <br />
            &bull; Display your name and scores to other members within your leagues
          </PolicySection>

          <PolicySection title='Data Sharing'>
            We do not sell your personal information. Your gameplay data (display name, scores,
            predictions) is visible to other members within your leagues. We share data with the
            following service providers who help operate the app:
            <br /><br />
            &bull; <strong className='text-foreground'>Clerk</strong> — authentication
            <br />
            &bull; <strong className='text-foreground'>Expo</strong> — push notifications
            <br /><br />
            These providers only access data necessary to perform their services and are subject
            to their own privacy policies.
          </PolicySection>

          <PolicySection title='Data Retention'>
            We retain your account and gameplay data for as long as your account is active. If you
            delete your account, we will remove your personal information from our systems. League
            data that has been shared with other members (such as historical scores) may be retained
            in anonymized form.
          </PolicySection>

          <PolicySection title='Your Rights'>
            You can request to access, update, or delete your personal data at any time by
            contacting us. You can disable push notifications through your device settings.
          </PolicySection>

          <PolicySection title='Security'>
            We use industry-standard security measures to protect your data, including encrypted
            connections (HTTPS) and secure authentication through Clerk.
          </PolicySection>

          <PolicySection title="Children's Privacy">
            Trial by Fire is not intended for children under 13. We do not knowingly collect
            personal information from children under 13. If you believe a child has provided us
            with personal information, please contact us and we will delete it.
          </PolicySection>

          <PolicySection title='Changes to This Policy'>
            We may update this privacy policy from time to time. We will notify users of
            significant changes through the app or by updating the date at the top of this page.
          </PolicySection>

          <PolicySection title='Contact Us'>
            If you have questions about this privacy policy or your data, contact us at:{' '}
            <a
              href='mailto:yourfantasysurvivor@gmail.com'
              className='text-primary hover:text-primary/80 transition-colors'>
              yourfantasysurvivor@gmail.com
            </a>
          </PolicySection>
        </section>

        {/* Footer link back */}
        <section className='rounded-xl bg-card p-6 border-2 border-primary/20 space-y-4'>
          <div className='text-center'>
            <Link
              href='/'
              className='text-sm text-primary hover:text-primary/80 transition-colors font-semibold'>
              ← Back to Trial by Fire
            </Link>
          </div>
        </section>
      </div>
      <Spacer />
      <ScrollBar className='pb-4 pt-2' />
    </ScrollArea>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2'>
        <div className='h-4 w-1 bg-primary rounded-full' />
        <h2 className='text-base font-bold text-foreground'>{title}</h2>
      </div>
      <p>{children}</p>
    </div>
  );
}
