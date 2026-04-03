import { useEffect } from 'react';

export default function PrivacyPolicy() {
  const effectiveDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="card space-y-8">
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm">Effective Date: {effectiveDate}</p>
        </div>

        {/* Introduction */}
        <section>
          <p className="text-gray-300 leading-relaxed">
            SpotMyStar ("we", "our", "platform") respects your privacy and is committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform — whether you are a
            user, artist, or brand/company.
          </p>
        </section>

        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">1</span>
            Information We Collect
          </h2>
          <div className="space-y-4 pl-10">
            <div>
              <h3 className="font-semibold text-white mb-2">a) Personal Information</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                {['Name', 'Email address', 'Phone number', 'Profile details (for artists and brands)'].map(item => (
                  <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">b) Professional Information</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                {['Artist category, portfolio, and experience', 'Company details (for brands)'].map(item => (
                  <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">c) Usage Data</h3>
              <ul className="space-y-1 text-gray-400 text-sm">
                {['Pages visited', 'Actions taken (bookings, interests, etc.)', 'Device and browser information'].map(item => (
                  <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">2</span>
            How We Use Your Information
          </h2>
          <ul className="space-y-2 pl-10 text-gray-400 text-sm">
            {[
              'Create and manage your account',
              'Connect users, artists, and brands',
              'Enable bookings and responses',
              'Improve platform performance and user experience',
              'Send important updates and notifications',
              'Prevent fraud and misuse'
            ].map(item => (
              <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></span>{item}</li>
            ))}
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">3</span>
            Data Sharing
          </h2>
          <div className="pl-10 space-y-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
              <p className="text-green-400 font-semibold text-sm">? We do NOT sell your personal data.</p>
            </div>
            <p className="text-gray-400 text-sm">We may share limited information:</p>
            <ul className="space-y-2 text-gray-400 text-sm">
              {[
                'Between users, artists, and brands for bookings and communication',
                'With service providers (hosting, analytics) for platform operation',
                'If required by law or legal authorities'
              ].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">4</span>
            Profile Visibility
          </h2>
          <ul className="space-y-2 pl-10 text-gray-400 text-sm">
            {[
              'Artist profiles are publicly visible to users',
              'Brand requirements are visible only to artists',
              'Contact details may be shared when interaction occurs (e.g., when an artist shows interest)'
            ].map(item => (
              <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
            ))}
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">5</span>
            Data Security
          </h2>
          <div className="pl-10 space-y-3">
            <p className="text-gray-400 text-sm">We take reasonable measures to protect your data:</p>
            <ul className="space-y-2 text-gray-400 text-sm">
              {[
                'Secure authentication systems',
                'Controlled database access',
                'Encryption and secure hosting'
              ].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
              ))}
            </ul>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
              <p className="text-yellow-400 text-sm">?? However, no system is 100% secure. We encourage you to use strong passwords and keep your account credentials safe.</p>
            </div>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">6</span>
            Your Rights & Controls
          </h2>
          <ul className="space-y-2 pl-10 text-gray-400 text-sm">
            {[
              'Update your profile information at any time',
              'Request deletion of your account',
              'Control what information you share on the platform'
            ].map(item => (
              <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-secondary rounded-full flex-shrink-0"></span>{item}</li>
            ))}
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">7</span>
            Cookies & Tracking
          </h2>
          <div className="pl-10 space-y-2 text-gray-400 text-sm">
            <p>We may use cookies or similar technologies to:</p>
            <ul className="space-y-1">
              {['Improve user experience', 'Analyze platform usage'].map(item => (
                <li key={item} className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>{item}</li>
              ))}
            </ul>
            <p className="text-gray-500">You can control cookies through your browser settings.</p>
          </div>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">8</span>
            Third-Party Links
          </h2>
          <p className="pl-10 text-gray-400 text-sm">
            SpotMyStar may contain links to external platforms or services. We are not responsible for the privacy practices of those third-party websites. We encourage you to review their privacy policies before sharing any information.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">9</span>
            Changes to This Policy
          </h2>
          <p className="pl-10 text-gray-400 text-sm">
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Users will be notified of any major changes through the platform or via email.
          </p>
        </section>

        {/* Section 10 - Contact */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center text-sm font-bold">10</span>
            Contact Us
          </h2>
          <div className="pl-10">
            <p className="text-gray-400 text-sm mb-3">For any questions or concerns regarding this Privacy Policy:</p>
            <div className="bg-white/5 rounded-xl p-4 inline-block">
              <p className="text-gray-400 text-sm">?? Email: <a href="mailto:support@spotmystar.in" className="text-primary hover:underline">support@spotmystar.in</a></p>
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-gray-500 text-xs text-center">
            By using SpotMyStar, you agree to this Privacy Policy. Last updated: {effectiveDate}
          </p>
        </div>
      </div>
    </div>
  );
}
