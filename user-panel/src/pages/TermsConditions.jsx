import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function TermsConditions() {
  const effectiveDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const Section = ({ num, title, children }) => (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">{num}</span>
        {title}
      </h2>
      <div className="pl-10">{children}</div>
    </section>
  );

  const List = ({ items, color = 'primary' }) => (
    <ul className="space-y-2 text-gray-400 text-sm">
      {items.map(item => (
        <li key={item} className="flex items-start gap-2">
          <span className={`w-1.5 h-1.5 bg-${color} rounded-full flex-shrink-0 mt-1.5`}></span>
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="card space-y-8">

        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-sm">Effective Date: {effectiveDate}</p>
        </div>

        {/* Introduction */}
        <section>
          <p className="text-gray-300 leading-relaxed">
            Welcome to SpotMyStar ("we", "our", "platform"). By accessing or using our platform, you agree to comply with
            and be bound by these Terms & Conditions. If you do not agree, please do not use the platform.
          </p>
        </section>

        {/* Section 1 */}
        <Section num="1" title="Eligibility">
          <List items={[
            'You must be at least 16 years old to use SpotMyStar.',
            'By registering, you confirm that the information provided is accurate and complete.'
          ]} />
        </Section>

        {/* Section 2 */}
        <Section num="2" title="User Roles">
          <p className="text-gray-400 text-sm mb-3">SpotMyStar provides different roles with access to their respective features:</p>
          <div className="space-y-3">
            {[
              { role: 'Users', icon: '??', desc: 'Can discover and book artists' },
              { role: 'Artists', icon: '??', desc: 'Can create profiles, showcase work, and accept bookings' },
              { role: 'Brands / Companies', icon: '??', desc: 'Can post requirements and connect with artists' }
            ].map(({ role, icon, desc }) => (
              <div key={role} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{role}</p>
                  <p className="text-gray-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 3 */}
        <Section num="3" title="Account Responsibility">
          <List items={[
            'You are responsible for maintaining the confidentiality of your login credentials.',
            'Any activity under your account is your responsibility.',
            'Notify us immediately in case of unauthorized access at support@spotmystar.in'
          ]} />
        </Section>

        {/* Section 4 */}
        <Section num="4" title="Platform Usage">
          <p className="text-gray-400 text-sm mb-3">You agree NOT to:</p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <List items={[
              'Provide false or misleading information',
              'Use the platform for illegal or fraudulent activities',
              'Harass, abuse, or harm other users',
              'Upload inappropriate, offensive, or copyrighted content without permission'
            ]} color="red-400" />
          </div>
        </Section>

        {/* Section 5 */}
        <Section num="5" title="Artist & Booking Terms">
          <div className="space-y-3">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
              <p className="text-yellow-400 text-sm font-semibold">?? SpotMyStar acts as a connecting platform only.</p>
            </div>
            <List items={[
              'We do NOT guarantee booking completion, quality of service, or outcomes.',
              'All agreements (payment, timing, deliverables) are between the involved parties.',
              'SpotMyStar is not liable for disputes between users and artists.'
            ]} />
          </div>
        </Section>

        {/* Section 6 */}
        <Section num="6" title="Brand / Company Posts">
          <List items={[
            'All requirement posts are subject to admin approval.',
            'False, misleading, or spam posts may be removed without notice.',
            'Brands are responsible for the accuracy of their posted requirements.'
          ]} />
        </Section>

        {/* Section 7 */}
        <Section num="7" title="Content Ownership">
          <List items={[
            'Users retain ownership of the content they upload.',
            'By uploading content, you grant SpotMyStar a limited license to display and promote it on the platform.'
          ]} />
        </Section>

        {/* Section 8 */}
        <Section num="8" title="Account Suspension & Termination">
          <p className="text-gray-400 text-sm mb-3">We reserve the right to:</p>
          <List items={[
            'Suspend or terminate accounts that violate these terms',
            'Remove content that is inappropriate or harmful',
            'Restrict access without prior notice in serious cases'
          ]} />
        </Section>

        {/* Section 9 */}
        <Section num="9" title="Limitation of Liability">
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">SpotMyStar is provided "as is" without warranties. We are not responsible for:</p>
            <List items={[
              'Failed bookings',
              'Financial losses',
              'Miscommunication between parties'
            ]} />
            <p className="text-gray-500 text-sm">Use the platform at your own risk.</p>
          </div>
        </Section>

        {/* Section 10 */}
        <Section num="10" title="Privacy">
          <p className="text-gray-400 text-sm">
            Your use of the platform is also governed by our{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
            Please review it to understand our data practices.
          </p>
        </Section>

        {/* Section 11 */}
        <Section num="11" title="Changes to Terms">
          <p className="text-gray-400 text-sm">
            We may update these Terms & Conditions at any time. Continued use of the platform after changes means you accept the updated terms.
            We will notify users of major changes through the platform or via email.
          </p>
        </Section>

        {/* Section 12 */}
        <Section num="12" title="Contact Us">
          <p className="text-gray-400 text-sm mb-3">For any queries regarding these Terms & Conditions:</p>
          <div className="bg-white/5 rounded-xl p-4 inline-block">
            <p className="text-gray-400 text-sm">?? Email: <a href="mailto:support@spotmystar.in" className="text-primary hover:underline">support@spotmystar.in</a></p>
          </div>
        </Section>

        {/* Footer note */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-gray-500 text-xs text-center">
            By using SpotMyStar, you agree to these Terms & Conditions. Last updated: {effectiveDate}
          </p>
        </div>

      </div>
    </div>
  );
}
