import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Building2, Home as HomeIcon, Landmark, Trees, Shield, Star, Users, TrendingUp } from 'lucide-react';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import { propertyAPI, propertyTypeAPI } from '../../api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState('sale');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [typesRes, propsRes] = await Promise.allSettled([
        propertyTypeAPI.list(),
        propertyAPI.recommendations({ limit: 8 })
      ]);
      if (typesRes.status === 'fulfilled') setPropertyTypes(typesRes.value.data);
      if (propsRes.status === 'fulfilled') setFeaturedProperties(propsRes.value.data.properties);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${searchQuery}&listing_type=${listingType}`);
  };

  const typeIcons = { 'House': '🏠', 'Condo': '🏢', 'Townhouse': '🏘️', 'Apartment': '🏬', 'Villa': '🏡', 'Land': '🌾', 'Commercial': '🏪', 'Multi-Family': '🏗️' };

  return (
    <div className="home-page">
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80" alt="" />
          <div className="hero-overlay" />
        </div>

        <div className="hero-content container">
          <div className="hero-badge animate-fade-in">🇺🇸 #1 Property Platform in the US</div>
          <h1 className="hero-title animate-fade-in">
            Find Your Dream<br /><span className="gradient-text">Home Today</span>
          </h1>
          <p className="hero-subtitle animate-fade-in">
            Discover thousands of properties across the United States.<br />
            Buy, rent, or list your property with confidence.
          </p>

          {/* Search Bar */}
          <div className="hero-search animate-slide-up">
            <div className="search-tabs">
              <button className={`search-tab ${listingType === 'sale' ? 'active' : ''}`} onClick={() => setListingType('sale')}>Buy</button>
              <button className={`search-tab ${listingType === 'rent' ? 'active' : ''}`} onClick={() => setListingType('rent')}>Rent</button>
              <button className={`search-tab ${listingType === 'lease' ? 'active' : ''}`} onClick={() => setListingType('lease')}>Lease</button>
            </div>
            <form className="search-bar" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <MapPin size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by city, state, zip code, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-btn">
                <Search size={20} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="hero-stats animate-slide-up">
            <div className="hero-stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Properties Listed</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Happy Clients</span>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat">
              <span className="stat-number">50</span>
              <span className="stat-label">States Covered</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROPERTY TYPES ─── */}
      <section className="section property-types-section">
        <div className="container">
          <div className="section-header">
            <h2>Browse by Property Type</h2>
            <p>Explore different categories of properties available across the US</p>
          </div>
          <div className="property-types-grid stagger-children">
            {(propertyTypes.length > 0 ? propertyTypes : Array(8).fill(null)).map((type, i) => (
              <div
                key={type?.id || i}
                className={`property-type-card animate-fade-in ${!type ? 'skeleton' : ''}`}
                onClick={() => type && navigate(`/properties?property_type_id=${type.id}`)}
                style={{ animationDelay: `${i * 0.05}s`, cursor: type ? 'pointer' : 'default' }}
              >
                {type && (
                  <>
                    <span className="type-icon">{type.icon || typeIcons[type.name] || '🏠'}</span>
                    <span className="type-name">{type.name}</span>
                    <span className="type-count">{type.properties_count} listings</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ─── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Featured Properties</h2>
              <p>Hand-picked premium listings for you</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/properties')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="properties-grid stagger-children">
            {loading ? (
              Array(4).fill(null).map((_, i) => (
                <div key={i} className="card skeleton" style={{ height: 360, animationDelay: `${i * 0.1}s` }} />
              ))
            ) : featuredProperties.length > 0 ? (
              featuredProperties.slice(0, 8).map((prop, i) => (
                <PropertyCard key={prop.id} property={prop} />
              ))
            ) : (
              <div className="empty-state">
                <Building2 size={48} />
                <h3>No properties yet</h3>
                <p>Be the first to list a property!</p>
                <button className="btn btn-primary" onClick={() => navigate('/list-property')}>List Property</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header centered">
            <h2>How PropertyKING Works</h2>
            <p>Simple steps to find or list your perfect property</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Search size={28} /></div>
              <h3>Search & Discover</h3>
              <p>Browse thousands of verified listings with advanced filters, map view, and location-based search.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><HomeIcon size={28} /></div>
              <h3>Explore Details</h3>
              <p>View high-quality photos, virtual tours, floor plans, and complete property information.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><Users size={28} /></div>
              <h3>Connect & Inquire</h3>
              <p>Directly contact property owners or agents. Schedule viewings and get instant responses.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon"><Shield size={28} /></div>
              <h3>Secure & Move In</h3>
              <p>All listings are admin-verified for your safety. Find your dream home with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to List Your Property?</h2>
              <p>Join thousands of property owners and agents who trust PropertyKING to reach millions of potential buyers and renters across the United States.</p>
              <div className="cta-buttons">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                  Get Started Free <ArrowRight size={18} />
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/about')}>Learn More</button>
              </div>
            </div>
            <div className="cta-stats">
              <div className="cta-stat">
                <TrendingUp size={24} />
                <div>
                  <span className="cta-stat-number">95%</span>
                  <span className="cta-stat-label">Client Satisfaction</span>
                </div>
              </div>
              <div className="cta-stat">
                <Star size={24} />
                <div>
                  <span className="cta-stat-number">4.9/5</span>
                  <span className="cta-stat-label">Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
