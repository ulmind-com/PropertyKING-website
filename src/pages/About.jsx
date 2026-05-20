import { Link } from 'react-router-dom';
import {
  Shield, Users, TrendingUp, Award, Search, Home, CheckCircle2,
  Globe, Star, Heart, ArrowRight
} from 'lucide-react';

export default function About() {
  return (
    <div className="pt-[72px]">
      {/* Hero */}
      <section className="relative bg-neutral-900 overflow-hidden py-24 max-md:py-16">
        <div className="absolute -top-[30%] -right-[5%] w-[400px] h-[400px] rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-[40%] left-[15%] w-[260px] h-[260px] rounded-full bg-white/[0.03]" />
        <div className="container-custom relative z-[1] text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.08] backdrop-blur-xl rounded-full text-white/70 text-[13px] font-semibold mb-6">
            <Award size={14} /> About PropertyKING
          </div>
          <h1 className="text-[clamp(32px,5vw,52px)] font-black text-white leading-tight tracking-tighter mb-5 max-w-[700px] mx-auto">
            Redefining Real Estate in America
          </h1>
          <p className="text-base text-white/55 max-w-[520px] mx-auto leading-relaxed">
            PropertyKING is the premium property listing platform built for the modern era —
            connecting buyers, sellers, and agents with a seamless, beautiful experience.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-md:py-14">
        <div className="container-custom">
          <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900"><Globe size={14} /></div>
                OUR MISSION
              </div>
              <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-5">
                Making Property Search Effortless
              </h2>
              <p className="text-[15px] text-neutral-500 leading-[1.8] mb-5">
                We believe everyone deserves to find their perfect home without the hassle.
                Our platform combines cutting-edge technology with human-centric design
                to create the most intuitive property search experience in the market.
              </p>
              <p className="text-[15px] text-neutral-500 leading-[1.8]">
                From luxurious villas to cozy apartments, PropertyKING covers every type of
                property across all 50 states. Every listing is verified by our team to ensure
                quality and trust.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Shield size={24} />, title: 'Verified Listings', desc: 'Every property is admin-verified before going live' },
                { icon: <Search size={24} />, title: 'Smart Search', desc: 'AI-powered search with advanced filters' },
                { icon: <Users size={24} />, title: 'Direct Connect', desc: 'Contact owners and agents instantly' },
                { icon: <CheckCircle2 size={24} />, title: 'Trusted Platform', desc: 'Transparent pricing with no hidden fees' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex flex-col gap-3 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900">{icon}</div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">{title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-neutral-50 border-y border-neutral-100">
        <div className="container-custom">
          <div className="grid grid-cols-4 max-md:grid-cols-2 gap-8 text-center">
            {[
              { value: '50K+', label: 'Properties Listed', icon: <Home size={20} /> },
              { value: '10K+', label: 'Happy Clients', icon: <Heart size={20} /> },
              { value: '50', label: 'States Covered', icon: <Globe size={20} /> },
              { value: '4.9', label: 'Average Rating', icon: <Star size={20} /> },
            ].map(({ value, label, icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-1">{icon}</div>
                <span className="text-[32px] font-black text-neutral-900 tracking-tighter">{value}</span>
                <span className="text-sm text-neutral-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 max-md:py-14">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900"><TrendingUp size={14} /></div>
              OUR PROCESS
            </div>
            <h2 className="text-[30px] max-sm:text-2xl font-extrabold text-neutral-900 tracking-tight">How PropertyKING Works</h2>
          </div>
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-8">
            {[
              { step: '01', title: 'List or Search', desc: 'Property owners list their properties with photos and details. Buyers search using smart filters across all property types.' },
              { step: '02', title: 'Connect & Inquire', desc: 'Send inquiries directly to property owners. Schedule viewings, ask questions, and get instant responses.' },
              { step: '03', title: 'Close with Confidence', desc: 'Every listing is verified by our admin team. Complete your transaction with full transparency and trust.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative p-7 bg-white border border-neutral-100 rounded-3xl transition-all hover:shadow-md hover:-translate-y-1">
                <div className="absolute top-4 right-5 text-[48px] font-black text-neutral-100 leading-none">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-extrabold text-lg mb-5">{step}</div>
                <h3 className="text-[17px] font-bold text-neutral-900 tracking-tight mb-3">{title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-0">
        <div className="container-custom">
          <div className="bg-neutral-900 rounded-3xl p-14 max-md:p-8 text-center relative overflow-hidden">
            <div className="absolute -top-[50%] -right-[5%] w-[350px] h-[350px] rounded-full bg-white/[0.05]" />
            <div className="absolute -bottom-[40%] left-[10%] w-[200px] h-[200px] rounded-full bg-white/[0.04]" />
            <div className="relative z-[1]">
              <h2 className="text-[28px] max-sm:text-2xl font-extrabold text-white mb-4 tracking-tight">Ready to Get Started?</h2>
              <p className="text-base text-white/55 max-w-[440px] mx-auto mb-8 leading-relaxed">
                Join thousands of users who trust PropertyKING for their real estate needs.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/register" className="btn btn-lg bg-white text-neutral-900 hover:bg-white/90 shadow-none">
                  Create Account <ArrowRight size={18} />
                </Link>
                <Link to="/properties" className="btn btn-lg border-[1.5px] border-white/30 text-white bg-transparent hover:bg-white/10">
                  Browse Properties
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
