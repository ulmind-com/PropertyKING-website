import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-neutral-400 mt-20">
      <div className="container-custom grid grid-cols-[1.5fr_1fr_1fr_1.2fr] max-md:grid-cols-1 gap-12 max-md:gap-8 py-16 px-6">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5 text-[22px] font-extrabold text-white tracking-tight">
            <img src="/logoremovebg.png" alt="PropertyKing" className="h-9 w-9 object-contain" />
            <span>Property<span className="text-neutral-300">King</span></span>
          </Link>
          <p className="text-sm leading-relaxed text-neutral-500 max-w-[340px]">
            The distressed & off-market property listing platform for the US market.
            Find your dream home, list your property, and connect with
            verified agents — all in one place.
          </p>
          <div className="flex gap-2.5 mt-2">
            {[
              { icon: <FaFacebookF />, href: '#' },
              { icon: <FaTwitter />, href: '#' },
              { icon: <FaInstagram />, href: '#' },
              { icon: <FaLinkedinIn />, href: '#' },
              { icon: <FaYoutube />, href: '#' },
            ].map((s, i) => (
              <a key={i} href={s.href} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/[0.06] text-neutral-400 transition-all hover:bg-white hover:text-[#0A0A0A] hover:-translate-y-0.5 text-sm">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white text-[15px] font-bold mb-1 tracking-tight">Explore</h4>
          {[
            { to: '/properties', label: 'All Properties' },
            { to: '/properties?listing_type=sale', label: 'Buy' },
            { to: '/properties?listing_type=rent', label: 'Rent' },
            { to: '/list-property', label: 'List Property' },
            { to: '/about', label: 'About Us' },
          ].map(({ to, label }) => (
            <Link key={label} to={to} className="text-neutral-500 text-sm font-medium transition-colors hover:text-white">{label}</Link>
          ))}
        </div>

        {/* Property Types */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white text-[15px] font-bold mb-1 tracking-tight">Property Types</h4>
          {[
            { to: '/properties?type=house', label: 'Houses' },
            { to: '/properties?type=condo', label: 'Condos' },
            { to: '/properties?type=townhouse', label: 'Townhouses' },
            { to: '/properties?type=apartment', label: 'Apartments' },
            { to: '/properties?type=land', label: 'Land' },
          ].map(({ to, label }) => (
            <Link key={label} to={to} className="text-neutral-500 text-sm font-medium transition-colors hover:text-white">{label}</Link>
          ))}
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white text-[15px] font-bold mb-1 tracking-tight">Contact</h4>
          <a href="mailto:hello@propertyking.com" className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
            <Mail size={14} /> hello@propertyking.com
          </a>
          <a href="tel:+18005551234" className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
            <Phone size={14} /> 1-800-555-1234
          </a>
          <div className="flex items-center gap-2 text-neutral-500 text-sm font-medium">
            <MapPin size={14} /> New York, NY 10001
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="container-custom flex max-md:flex-col justify-between items-center max-md:text-center gap-3 py-6 border-t border-white/[0.06] text-[13px] text-neutral-600">
        <p>© {new Date().getFullYear()} PropertyKing. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
            <a key={t} href="#" className="text-neutral-600 font-medium transition-colors hover:text-neutral-400">{t}</a>
          ))}
        </div>
      </div>

      {/* Designed by UlMind */}
      <div className="container-custom flex items-center justify-center gap-2.5 py-4 border-t border-white/[0.04] text-[12px] text-neutral-600">
        <span>Designed & Built by</span>
        <a href="https://www.ulmind.com" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
          <img src="/ulmind.png" alt="UlMind" className="h-[28px] w-auto object-contain" />
        </a>
      </div>
    </footer>
  );
}
