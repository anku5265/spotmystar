import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Users, Briefcase, Zap, Eye, Heart, MapPin, Mic, Building2, CheckCircle } from 'lucide-react';

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-16">
      <Helmet>
        <title>About Us - SpotMyStar</title>
        <meta name="description" content="SpotMyStar is a platform built to connect talent with opportunity. Discover artists, post requirements, and simplify bookings — all in one place." />
        <link rel="canonical" href="https://spotmystar.in/about" />
      </Helmet>

      {/* Hero */}
      <section className="text-center space-y-6 animate-fade-in-up">
        <div className="flex justify-center">
          <img src="/star-logo.svg" alt="SpotMyStar" className="w-20 h-20 animate-float" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          About SpotMyStar
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          SpotMyStar is a platform built to connect talent with opportunity. Whether you're an artist looking to showcase
          your skills or a user or brand searching for the right talent — SpotMyStar brings everything together in one place.
        </p>
      </section>

      {/* Who We Are */}
      <section className="card space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Heart className="text-primary flex-shrink-0" size={24} />
          Who We Are
        </h2>
        <p className="text-gray-300 leading-relaxed">
          We are building a digital space where artists, creators, and professionals can grow, get discovered, and get hired —
          without unnecessary barriers.
        </p>
        <p className="text-gray-400 leading-relaxed">
          From singers, dancers, and comedians to influencers and event professionals — SpotMyStar is designed to make
          talent accessible and opportunities visible.
        </p>
      </section>

      {/* What We Do */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Zap className="text-primary flex-shrink-0" size={24} />
          What We Do
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: <MapPin size={22} className="text-primary flex-shrink-0 mt-0.5" />, text: 'Help users discover talented artists nearby' },
            { icon: <Mic size={22} className="text-secondary flex-shrink-0 mt-0.5" />, text: 'Enable artists to create profiles and showcase their work' },
            { icon: <Building2 size={22} className="text-primary flex-shrink-0 mt-0.5" />, text: 'Allow brands and companies to post requirements and connect with the right talent' },
            { icon: <CheckCircle size={22} className="text-secondary flex-shrink-0 mt-0.5" />, text: 'Simplify bookings and collaborations' },
          ].map(({ icon, text }) => (
            <div key={text} className="card flex items-start gap-4">
              {icon}
              <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vision */}
      <section
        className="relative overflow-hidden rounded-2xl p-8 text-center space-y-4"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}
      >
        <Eye className="text-primary mx-auto" size={32} />
        <h2 className="text-2xl font-bold text-white">Our Vision</h2>
        <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed text-lg">
          To become the go-to platform for talent discovery and hiring — making it easier for every artist to shine
          and every opportunity to find the right person.
        </p>
      </section>

      {/* Why SpotMyStar */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Star className="text-primary flex-shrink-0" size={24} />
          Why SpotMyStar
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Simple & Easy', desc: 'Clean, intuitive platform anyone can use without a learning curve.' },
            { title: 'Direct Connection', desc: 'No unnecessary middle layers between talent and opportunity.' },
            { title: 'Real-World Use Cases', desc: 'Built for events, gigs, campaigns, and collaborations.' },
            { title: 'All in One Place', desc: 'Discover, connect, book — everything on a single platform.' },
          ].map(({ title, desc }) => (
            <div key={title} className="card space-y-2">
              <h3 className="font-bold text-primary">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Artists / Users / Brands */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="text-primary flex-shrink-0" size={24} />
          Built For Everyone
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Mic size={36} className="text-primary mx-auto" />,
              role: 'For Artists',
              desc: 'Create your profile, upload your work, get discovered, and receive booking requests — all in one place.',
              cta: 'Join as Artist',
              href: `${import.meta.env.VITE_ARTIST_PANEL_URL || 'https://artist.spotmystar.in'}/register`,
              external: true,
            },
            {
              icon: <Users size={36} className="text-secondary mx-auto" />,
              role: 'For Users',
              desc: 'Explore talented artists, view profiles, and book the right performer for your needs.',
              cta: 'Explore Artists',
              href: '/search',
              external: false,
            },
            {
              icon: <Briefcase size={36} className="text-primary mx-auto" />,
              role: 'For Brands',
              desc: 'Post your requirements, review interested artists, and connect with the best fit for your campaign or event.',
              cta: 'Join as Brand',
              href: `${import.meta.env.VITE_BRAND_PANEL_URL || 'https://brand.spotmystar.in'}/register`,
              external: true,
            },
          ].map(({ icon, role, desc, cta, href, external }) => (
            <div key={role} className="card text-center space-y-4 flex flex-col">
              <div className="pt-2">{icon}</div>
              <h3 className="text-xl font-bold text-white">{role}</h3>
              <p className="text-gray-400 text-sm leading-relaxed flex-1">{desc}</p>
              {external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-gradient-to-r from-primary to-secondary rounded-lg text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  {cta}
                </a>
              ) : (
                <Link
                  to={href}
                  className="block w-full py-2 px-4 bg-gradient-to-r from-primary to-secondary rounded-lg text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  {cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="text-center space-y-4 pb-8">
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          SpotMyStar is more than just a platform — it's a growing ecosystem where{' '}
          <span className="text-primary font-semibold">talent meets opportunity</span>.
        </p>
        <Link
          to="/search"
          className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold hover:opacity-90 transition"
        >
          Explore Artists
        </Link>
      </section>
    </div>
  );
}
