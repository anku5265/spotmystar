import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    items: [
      {
        q: 'What is SpotMyStar?',
        a: 'SpotMyStar is a platform where users can discover artists, artists can showcase their talent, and brands can hire talent for events, gigs, and collaborations — all in one place.',
      },
      {
        q: 'Is SpotMyStar free to use?',
        a: 'Basic usage is free for everyone. Some advanced features may be introduced in the future.',
      },
    ],
  },
  {
    category: 'For Users',
    items: [
      {
        q: 'How do I book an artist?',
        a: 'You can explore artist profiles, view their details, and send a booking request directly through the platform. Simply find an artist you like and click "Book Now".',
      },
      {
        q: 'Can I contact an artist directly?',
        a: 'Yes, once interaction is initiated (like a booking request or interest), relevant contact details may be shared between the parties.',
      },
    ],
  },
  {
    category: 'For Artists',
    items: [
      {
        q: 'How can I become an artist on SpotMyStar?',
        a: 'You can sign up as an artist, create your profile, upload your portfolio, and start getting discovered by users and brands across India.',
      },
      {
        q: 'How do artists get booking requests?',
        a: 'Artists receive booking or interest requests when users or brands interact with their profile, view their work, or respond to their listed services.',
      },
      {
        q: 'Can I edit my profile later?',
        a: 'Yes, artists can update their profile information, portfolio, pricing, and availability anytime from their dashboard.',
      },
    ],
  },
  {
    category: 'For Brands',
    items: [
      {
        q: 'What is the role of brands/companies on SpotMyStar?',
        a: 'Brands or companies can post their requirements and connect with interested artists for collaborations, events, campaigns, and more.',
      },
    ],
  },
  {
    category: 'Privacy & Support',
    items: [
      {
        q: 'Is my data safe on SpotMyStar?',
        a: 'Yes, we follow standard security practices to protect your data. All information is stored securely. For more details, refer to our Privacy Policy.',
        link: { label: 'Read Privacy Policy', to: '/privacy-policy' },
      },
      {
        q: 'How do I report an issue?',
        a: 'You can contact us directly at support@spotmystar.in — we typically respond within 24 hours.',
        email: 'support@spotmystar.in',
      },
    ],
  },
];

function FAQItem({ q, a, link, email, isOpen, onToggle }) {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white/5 hover:bg-white/10 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white text-sm sm:text-base leading-snug pr-2">{q}</span>
        <ChevronDown
          size={18}
          className={`text-primary flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Smooth accordion */}
      <div
        style={{
          maxHeight: isOpen ? '400px' : '0px',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.35s ease, opacity 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <div className="px-5 py-4 bg-white/[0.02] border-t border-white/10 space-y-3">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
          {link && (
            <Link
              to={link.to}
              className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
            >
              {link.label} <ArrowRight size={13} />
            </Link>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
            >
              {email} <ArrowRight size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Track open item as "categoryIndex-itemIndex"
  const [openKey, setOpenKey] = useState(null);

  const toggle = (key) => setOpenKey(prev => prev === key ? null : key);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Helmet>
        <title>FAQ - SpotMyStar</title>
        <meta name="description" content="Frequently asked questions about SpotMyStar — how to book artists, join as an artist, post brand requirements, and more." />
        <link rel="canonical" href="https://spotmystar.in/faq" />
      </Helmet>

      {/* Header */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30 mb-2">
          <HelpCircle size={26} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
          Can't find what you're looking for? Reach us at{' '}
          <a href="mailto:support@spotmystar.in" className="text-primary hover:underline">
            support@spotmystar.in
          </a>
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqs.map((section, si) => (
          <div key={section.category} className="space-y-3">
            {/* Category label */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                {section.category}
              </h2>
            </div>

            {section.items.map((item, ii) => {
              const key = `${si}-${ii}`;
              return (
                <FAQItem
                  key={key}
                  q={item.q}
                  a={item.a}
                  link={item.link}
                  email={item.email}
                  isOpen={openKey === key}
                  onToggle={() => toggle(key)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 glass rounded-2xl p-6 text-center space-y-3">
        <p className="text-gray-300 font-medium">Still have questions?</p>
        <p className="text-gray-500 text-sm">We're happy to help. Drop us an email anytime.</p>
        <a
          href="mailto:support@spotmystar.in?subject=Query%20-%20SpotMyStar"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white text-sm font-semibold hover:opacity-90 transition"
        >
          Contact Support <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
}
