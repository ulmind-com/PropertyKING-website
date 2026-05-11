import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, Calendar, Eye, Heart, Share2, ChevronLeft, ChevronRight, Phone, Mail, Send, Star, Building, Car, Home, DollarSign, Ruler, Layers } from 'lucide-react';
import { propertyAPI, inquiryAPI, reviewAPI, favoriteAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './PropertyDetails.css';

export default function PropertyDetails() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => { loadProperty(); }, [slug]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const res = await propertyAPI.getBySlug(slug);
      setProperty(res.data);
      setIsFav(res.data.is_favorited);
      try { const revRes = await reviewAPI.getForProperty(res.data.id); setReviews(revRes.data.reviews); setAvgRating(revRes.data.average_rating); } catch(e) {}
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return toast.error('Please login first');
    try { if (isFav) { await favoriteAPI.remove(property.id); } else { await favoriteAPI.add(property.id); } setIsFav(!isFav); toast.success(isFav ? 'Removed' : 'Saved!'); } catch(e) { toast.error('Failed'); }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please login to send inquiry');
    if (!inquiryMsg.trim()) return toast.error('Please enter a message');
    setInquiryLoading(true);
    try {
      await inquiryAPI.create({ property_id: property.id, message: inquiryMsg, inquiry_type: 'general' });
      toast.success('Inquiry sent!');
      setInquiryMsg('');
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed'); } finally { setInquiryLoading(false); }
  };

  const formatPrice = (p, u) => { const f = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(p); return u === 'per_month' ? `${f}/mo` : u === 'per_night' ? `${f}/night` : f; };

  if (loading) return <div className="detail-loading container"><div className="skeleton" style={{height:400,borderRadius:16}} /><div className="skeleton" style={{height:200,borderRadius:16,marginTop:24}} /></div>;
  if (!property) return <div className="container" style={{paddingTop:120,textAlign:'center'}}><h2>Property not found</h2></div>;

  const images = property.images?.length > 0 ? property.images : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200', caption: 'Property' }];
  const d = property.details || {};

  return (
    <div className="detail-page">
      {/* Image Gallery */}
      <div className="detail-gallery">
        <div className="gallery-main">
          <img src={images[currentImg]?.url} alt={images[currentImg]?.caption || property.title} />
          {images.length > 1 && (<>
            <button className="gallery-nav prev" onClick={() => setCurrentImg(i => i > 0 ? i - 1 : images.length - 1)}><ChevronLeft size={24} /></button>
            <button className="gallery-nav next" onClick={() => setCurrentImg(i => i < images.length - 1 ? i + 1 : 0)}><ChevronRight size={24} /></button>
            <div className="gallery-counter">{currentImg + 1} / {images.length}</div>
          </>)}
          <div className="gallery-actions">
            <button className={`gallery-action-btn ${isFav ? 'active' : ''}`} onClick={handleFavorite}><Heart size={20} fill={isFav ? '#EF4444' : 'none'} /></button>
            <button className="gallery-action-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}><Share2 size={20} /></button>
          </div>
        </div>
        {images.length > 1 && (
          <div className="gallery-thumbs">{images.slice(0, 5).map((img, i) => (
            <div key={i} className={`thumb ${currentImg === i ? 'active' : ''}`} onClick={() => setCurrentImg(i)}>
              <img src={img.url} alt="" />{i === 4 && images.length > 5 && <div className="thumb-more">+{images.length - 5}</div>}
            </div>
          ))}</div>
        )}
      </div>

      <div className="container detail-content">
        <div className="detail-main">
          {/* Header */}
          <div className="detail-header">
            <div className="detail-badges">
              <span className={`property-badge ${property.listing_type}`}>{property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'For Lease'}</span>
              {property.property_type_name && <span className="property-badge type">{property.property_type_name}</span>}
              <span className={`badge ${property.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{property.status}</span>
            </div>
            <h1 className="detail-title">{property.title}</h1>
            <div className="detail-location"><MapPin size={16} />{property.location?.address}, {property.location?.city}, {property.location?.state} {property.location?.zip_code}</div>
            <div className="detail-price">{formatPrice(property.price, property.price_unit)}</div>
            {d.property_tax_annual > 0 && <div className="detail-tax">Est. ${d.property_tax_annual.toLocaleString()}/yr property tax</div>}
          </div>

          {/* Quick Stats */}
          <div className="detail-quick-stats">
            {d.bedrooms > 0 && <div className="quick-stat"><Bed size={22} /><div><span className="qs-value">{d.bedrooms}</span><span className="qs-label">Bedrooms</span></div></div>}
            {d.bathrooms > 0 && <div className="quick-stat"><Bath size={22} /><div><span className="qs-value">{d.bathrooms}</span><span className="qs-label">Bathrooms</span></div></div>}
            {d.total_sqft > 0 && <div className="quick-stat"><Maximize size={22} /><div><span className="qs-value">{d.total_sqft.toLocaleString()}</span><span className="qs-label">Sqft</span></div></div>}
            {d.year_built > 0 && <div className="quick-stat"><Calendar size={22} /><div><span className="qs-value">{d.year_built}</span><span className="qs-label">Year Built</span></div></div>}
            {d.garage_spaces > 0 && <div className="quick-stat"><Car size={22} /><div><span className="qs-value">{d.garage_spaces}</span><span className="qs-label">Garage</span></div></div>}
            {d.lot_size_acres > 0 && <div className="quick-stat"><Ruler size={22} /><div><span className="qs-value">{d.lot_size_acres}</span><span className="qs-label">Acres</span></div></div>}
          </div>

          {/* Description */}
          <div className="detail-section"><h2>Description</h2><p className="detail-description">{property.description}</p></div>

          {/* Property Details */}
          <div className="detail-section"><h2>Property Details</h2>
            <div className="details-grid">
              {d.mls_number && <div className="detail-item"><span className="di-label">MLS #</span><span className="di-value">{d.mls_number}</span></div>}
              {d.stories && <div className="detail-item"><span className="di-label">Stories</span><span className="di-value">{d.stories}</span></div>}
              {d.parking_type && <div className="detail-item"><span className="di-label">Parking</span><span className="di-value">{d.parking_type.replace(/_/g,' ')}</span></div>}
              {d.basement && <div className="detail-item"><span className="di-label">Basement</span><span className="di-value">{d.basement}</span></div>}
              {d.heating && <div className="detail-item"><span className="di-label">Heating</span><span className="di-value">{d.heating}</span></div>}
              {d.cooling && <div className="detail-item"><span className="di-label">Cooling</span><span className="di-value">{d.cooling}</span></div>}
              {d.roof_type && <div className="detail-item"><span className="di-label">Roof</span><span className="di-value">{d.roof_type}</span></div>}
              {d.construction_material && <div className="detail-item"><span className="di-label">Construction</span><span className="di-value">{d.construction_material}</span></div>}
              {d.zoning && <div className="detail-item"><span className="di-label">Zoning</span><span className="di-value">{d.zoning}</span></div>}
              {d.hoa_fee > 0 && <div className="detail-item"><span className="di-label">HOA Fee</span><span className="di-value">${d.hoa_fee}/{d.hoa_frequency || 'mo'}</span></div>}
              {property.location?.county && <div className="detail-item"><span className="di-label">County</span><span className="di-value">{property.location.county}</span></div>}
              {property.location?.neighborhood && <div className="detail-item"><span className="di-label">Neighborhood</span><span className="di-value">{property.location.neighborhood}</span></div>}
            </div>
          </div>

          {/* Amenities */}
          {property.amenity_names?.length > 0 && (
            <div className="detail-section"><h2>Amenities</h2>
              <div className="amenities-grid">{property.amenity_names.map((a, i) => <span key={i} className="amenity-chip">✅ {a}</span>)}</div>
            </div>
          )}

          {/* Flooring & Appliances */}
          {d.flooring?.length > 0 && <div className="detail-section"><h2>Flooring</h2><div className="amenities-grid">{d.flooring.map((f,i) => <span key={i} className="amenity-chip">{f}</span>)}</div></div>}
          {d.appliances_included?.length > 0 && <div className="detail-section"><h2>Appliances Included</h2><div className="amenities-grid">{d.appliances_included.map((a,i) => <span key={i} className="amenity-chip">{a}</span>)}</div></div>}

          {/* Stats */}
          <div className="detail-meta"><Eye size={14} /> {property.views_count} views · <Heart size={14} /> {property.favorites_count} saves · Listed {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Recently'}</div>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          {/* Lister Card */}
          <div className="sidebar-card lister-card">
            <div className="lister-header">
              {property.lister_avatar ? <img src={property.lister_avatar} alt="" className="lister-avatar-lg" /> : <div className="lister-avatar-lg placeholder">{property.lister_name?.[0] || 'U'}</div>}
              <div><h4>{property.lister_name || 'Property Lister'}</h4>{property.lister_type && <span className="badge badge-info">{property.lister_type}</span>}</div>
            </div>
            {property.contact_phone && <a href={`tel:${property.contact_phone}`} className="btn btn-outline" style={{width:'100%'}}><Phone size={16} /> {property.contact_phone}</a>}
            {property.contact_email && <a href={`mailto:${property.contact_email}`} className="btn btn-ghost" style={{width:'100%'}}><Mail size={16} /> Email</a>}
          </div>

          {/* Inquiry Form */}
          <div className="sidebar-card">
            <h3>Interested in this property?</h3>
            <form onSubmit={handleInquiry} className="inquiry-form">
              <textarea className="input" rows={4} placeholder="Hi, I'm interested in this property. I'd like to schedule a viewing..." value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={inquiryLoading}>
                <Send size={16} /> {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
