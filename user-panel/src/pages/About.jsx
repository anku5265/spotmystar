import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star, Users, Briefcase, Zap, Eye, Heart,
  MapPin, Mic, Building2, CheckCircle, ArrowRight,
  Shield, Clock, Award, TrendingUp, Globe, Sparkles
} from 'lucide-react';

/* ── Simple intersection-observer hook for scroll animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [visible, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Fade-in section wrapper ── */
function FadeSection({ children, delay = 0, className = '' }) {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const stats = [
    { value: 500,  suffix: '+', label: 'Artists Listed' },
    { value: 50,   suffix: '+', label: 'Cities Covered' },
    { value: 1000, suffix: '+', label: 'Bookings Done' },
    { value: 100,  suffix: '%', label: 'Secure Platform' },
  ];

  const whatWeDo = [
    { icon: <MapPin size={22} className="text-primary flex-shrink-0 mt-0.5" />, text: 'Help users discover talented artists nearby' },
    { icon: <Mic size={22} className="text-secondary flex-shrink-0 mt-0.5" />, text: 'Enable artists to create profiles and showcase their work' },
    { icon: <Building2 size={22} className="text-primary flex-shrink-0 mt-0.5" />, text: 'Allow brands to post requirements and connect with the right talent' },
    { icon: <CheckCircle size={22} className="text-secondary flex-shrink-0 mt-0.5" />, text: 'Simplify bookings and collaborations end-to-end' },
    { icon: <Globe size={22} className="text-primary flex-shrink-0 mt-0.5" />, text: 'Build a nationwide network of verified performers' },
    { icon: <Shield size={22} className="text-secondary flex-shrink-0 mt-0.5" />, text: 'Ensure safe, transparent, and reliable transactions' },
  ];

  const whyUs = [
    { icon: <Zap size={20} className="text-primary" />, title: 'Simple & Easy', desc: 'Clean, intuitive platform anyone can use without a learning curve.' },
    { icon: <Users size={20} className="text-secondary" />, title: 'Direct Connection', desc: 'No unnecessary middle layers between talent and opportunity.' },
    { icon: <Clock size={20} className="text-primary" />, title: 'Real-World Use Cases', desc: 'Built for events, gigs, campaigns, and collaborations.' },
    { icon: <Award size={20} className="text-secondary" />, title: 'Verified Artists', desc: 'Every artist goes through a verification process for quality assurance.' },
    { icon: <Shield size={20} className="text-primary" />, title: 'Secure Platform', desc: 'Your data and transactions are always protected.' },
    { icon: <TrendingUp size={20} className="text-secondary" />, title: 'All in One Place', desc: 'Discover, connect, book — everything on a single platform.' },
  ];

  const audience = [
    {
      icon: <Mic size={40} className="text-primary mx-auto" />,
      role: 'For Artists',
      desc: 'Create your profile, upload your work, get discovered, and receive booking requests — all in one place.',
      cta: 'Join as Artist',
      href: `${import.meta.env.VITE_ARTIST_PANEL_URL || 'https://artist.spotmystar.in'}/register`,
      external: true,
      bgStyle: { background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(139,92,246,0.3)' },
    },
    {
      icon: <Users size={40} className="text-secondary mx-auto" />,
      role: 'For Users',
      desc: 'Explore talented artists, view profiles, and book the right performer for your event or occasion.',
      cta: 'Explore Artists',
      href: '/search',
      external: false,
      bgStyle: { background: 'linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(236,72,153,0.05) 100%)', border: '1px solid rgba(236,72,153,0.3)' },
    },
    {
      icon: <Briefcase size={40} className="text-primary mx-auto" />,
      role: 'For Brands',
      desc: 'Post your requirements, review interested artists, and connect with the best fit for your campaign or event.',
      cta: 'Join as Brand',
      href: `${import.meta.env.VITE_BRAND_PANEL_URL || 'https://brand.spotmystar.in'}/register`,
      external: true,
      bgStyle: { background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(236,72,153,0.1) 100%)', border: '1px solid rgba(139,92,246,0.3)' },
    },
  ];

  return (
    <div className="overflow-x-hidden">
      <Helmet>
        <title>About Us - SpotMyStar</title>
        <meta name="description" content="SpotMyStar is India's talent discovery platform connecting artists, users, and brands. Learn about our mission, vision, and what makes us different." />
        <link rel="canonical" href="https://spotmystar.in/about" />
        <meta property="og:title" content="About SpotMyStar - Talent Meets Opportunity" />
        <meta property="og:description" content="SpotMyStar connects artists with users and brands across India. Discover, book, and collaborate seamlessly." />
        <meta property="og:url" content="https://spotmystar.in/about" />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center max-w-3xl">
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img src="/star-logo.svg" alt="SpotMyStar Logo" className="w-20 h-20 animate-float" />
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-glow-pulse" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-gray-300 mb-6">
              <Sparkles size={14} className="text-primary" />
              India's Talent Discovery Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              About{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SpotMyStar
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              A platform built to connect talent with opportunity. Whether you're an artist looking to shine
              or a brand searching for the right talent — SpotMyStar brings everything together in one place.
            </p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <FadeSection>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map(({ value, suffix, label }) => (
                <div
                  key={label}
                  className="glass rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
                >
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                    <Counter target={value} suffix={suffix} />
                  </div>
                  <p className="text-gray-400 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <FadeSection>
            <div className="glass rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row gap-8 items-center hover:bg-white/10 transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Heart size={28} className="text-white" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Who We Are</h2>
                <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
                  We are building a digital space where artists, creators, and professionals can grow,
                  get discovered, and get hired — without unnecessary barriers.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  From singers, dancers, and comedians to influencers and event professionals —
                  SpotMyStar is designed to make talent accessible and opportunities visible across India.
                </p>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          <FadeSection>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap size={20} className="text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">What We Do</h2>
            </div>
          </FadeSection>

          <div className="grid sm:grid-cols-2 gap-4">
            {whatWeDo.map(({ icon, text }, i) => (
              <FadeSection key={text} delay={i * 80}>
                <div className="glass rounded-xl p-5 flex items-start gap-4 hover:bg-white/10 transition-all duration-300 h-full">
                  {icon}
                  <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── VISION ── */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <FadeSection>
            <div
              className="relative overflow-hidden rounded-2xl p-10 sm:p-14 text-center space-y-5"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(236,72,153,0.12) 50%, rgba(59,130,246,0.18) 100%)',
                border: '1px solid rgba(139,92,246,0.35)',
              }}
            >
              {/* Decorative blobs */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
                  <Eye size={26} className="text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Vision</h2>
                <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
                  To become the go-to platform for talent discovery and hiring across India —
                  making it easier for every artist to shine and every opportunity to find the right person.
                </p>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── WHY SPOTMYSTAR ── */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          <FadeSection>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Star size={20} className="text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Why SpotMyStar</h2>
            </div>
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyUs.map(({ icon, title, desc }, i) => (
              <FadeSection key={title} delay={i * 70}>
                <div className="glass rounded-xl p-6 space-y-3 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    {icon}
                  </div>
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUILT FOR EVERYONE ── */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          <FadeSection>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Users size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Built For Everyone</h2>
              </div>
              <p className="text-gray-400 max-w-xl mx-auto text-sm">
                Whether you're performing, planning, or promoting — there's a place for you on SpotMyStar.
              </p>
            </div>
          </FadeSection>

          <div className="grid sm:grid-cols-3 gap-6">
            {audience.map(({ icon, role, desc, cta, href, external, bgStyle }, i) => (
              <FadeSection key={role} delay={i * 100}>
                <div
                  className="relative overflow-hidden rounded-2xl p-6 flex flex-col gap-5 h-full hover:scale-[1.02] transition-all duration-300"
                  style={bgStyle}
                >
                  <div className="pt-2">{icon}</div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-xl font-bold text-white">{role}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                  {external ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                      {cta} <ArrowRight size={15} />
                    </a>
                  ) : (
                    <Link
                      to={href}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white text-sm font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                      {cta} <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ── */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <FadeSection>
            <div className="text-center space-y-6">
              <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
              <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed">
                SpotMyStar is more than just a platform — it's a growing ecosystem where{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                  talent meets opportunity
                </span>.
              </p>
              <p className="text-gray-500 text-sm">
                Join thousands of artists and users already on the platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                >
                  Explore Artists <ArrowRight size={18} />
                </Link>
                <a
                  href={`${import.meta.env.VITE_ARTIST_PANEL_URL || 'https://artist.spotmystar.in'}/register`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 glass rounded-xl text-white font-semibold hover:bg-white/10 transition-all duration-300"
                >
                  Join as Artist <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
}
