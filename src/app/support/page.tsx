import { TorchIcon } from '~/components/icons/generated';
import { Mail, Bug, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '~/components/common/scrollArea';
import { type Metadata } from 'next';
import Spacer from '~/components/shared/floatingActions/spacer';

export const metadata: Metadata = {
  title: 'Support — Trial by Fire',
  description: 'Get help with Trial by Fire, your fantasy Survivor experience.',
};

export default function SupportPage() {
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
              <h1 className='text-3xl font-black uppercase tracking-tight'>Support</h1>
              <p className='text-muted-foreground text-base max-w-md'>
                Need help with Trial by Fire? We&apos;re here for you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className='rounded-xl bg-card p-6 border-2 border-primary/20 space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='h-6 w-1 bg-primary rounded-full' />
            <h2 className='text-xl font-black uppercase tracking-tight'>Contact Us</h2>
          </div>
          <p className='text-muted-foreground'>
            For questions, feedback, or issues, reach out and we&apos;ll get back to you
            as soon as possible.
          </p>
          <a
            href='mailto:yourfantasysurvivor@gmail.com'
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity'>
            <Mail className='w-4 h-4 stroke-white' />
            yourfantasysurvivor@gmail.com
          </a>
        </section>

        {/* FAQ */}
        <section className='rounded-xl bg-card p-6 border-2 border-primary/20 space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='h-6 w-1 bg-primary rounded-full' />
            <h2 className='text-xl font-black uppercase tracking-tight'>FAQ</h2>
          </div>
          <div className='space-y-4'>
            <FaqItem
              icon={HelpCircle}
              question='How do I create a league?'
              answer='Tap "Create League" from the home screen, name your league, set a draft date, customize your display name and color, and you&apos;re all set. Share the invite link with friends to get them in.'
            />
            <FaqItem
              icon={HelpCircle}
              question='How does scoring work?'
              answer='Your drafted castaway earns points for in-game events like winning challenges, finding idols, and surviving each episode. Commissioners can customize point values and create custom events for each league.'
            />
            <FaqItem
              icon={HelpCircle}
              question='What happens if my castaway is eliminated?'
              answer='You pick a new unclaimed castaway and your survival streak resets to zero — unless you used your Shot in the Dark or your league preserves streaks on voluntary switches.'
            />
            <FaqItem
              icon={HelpCircle}
              question='Can I change my settings after the season starts?'
              answer='League commissioners can adjust most settings at any time. Some changes (like scoring rules) may affect past and future scoring, so coordinate with your league first.'
            />
            <FaqItem
              icon={Bug}
              question='I found a bug — how do I report it?'
              answer='Send us an email at yourfantasysurvivor@gmail.com with a description of the issue and any screenshots if possible. We appreciate the help!'
            />
          </div>
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
    </ScrollArea >
  );
}

function FaqItem({
  icon: Icon,
  question,
  answer,
}: {
  icon: typeof HelpCircle;
  question: string;
  answer: string;
}) {
  return (
    <div className='rounded-lg border-2 border-primary/10 bg-primary/5 px-4 py-3 space-y-1.5'>
      <div className='flex items-center gap-2'>
        <Icon className='w-4 h-4 text-primary shrink-0' />
        <h3 className='text-base font-bold'>{question}</h3>
      </div>
      <p className='text-sm text-muted-foreground leading-relaxed'>{answer}</p>
    </div>
  );
}
