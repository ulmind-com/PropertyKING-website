import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize, Star } from 'lucide-react';
import { useState } from 'react';
import { favoriteAPI } from '../../api';
import './PropertyCard.css';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const [isFav, setIsFav] = useState(property.is_favorited || false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const primaryImage = property.images?.find(i => i.is_primary)?.url
    || property.images?.[0]?.url
    || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600';

  const formatPrice = (price, unit) => {
    if (!price) return '$0';
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
    if (unit === 'per_month') return `${formatted}/mo`;
    if (unit === 'per_night') return `${formatted}/night`;
    return formatted;
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isFav) {
        await favoriteAPI.remove(property.id);
      } else {
        await favoriteAPI.add(property.id);
      }
      setIsFav(!isFav);
      onFavoriteToggle?.(property.id, !isFav);
    } catch (err) {
      console.error('Favorite toggle failed', err);
    }
  };

  return (
    <Link to={`/property/${property.slug || property.id}`} className="property-card card">
      {/* Image */}
      <div className="property-card-image">
        {!imgLoaded && <div className="skeleton" style={{ width: '100%', height: '100%', position: 'absolute' }} />}
        <img
          src={primaryImage}
          alt={property.title}
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
        />

        {/* Overlays */}
        <div className="property-card-badges">
          <span className={`property-badge ${property.listing_type}`}>
            {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'For Lease'}
          </span>
          {property.property_type_name && (
            <span className="property-badge type">{property.property_type_name}</span>
          )}
        </div>

        <button className={`property-fav-btn ${isFav ? 'active' : ''}`} onClick={handleFavorite}>
          <Heart size={18} fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : 'white'} />
        </button>

        {property.images?.length > 1 && (
          <span className="property-image-count">📷 {property.images.length}</span>
        )}
      </div>

      {/* Info */}
      <div className="property-card-info">
        <div className="property-card-price">
          {formatPrice(property.price, property.price_unit)}
          {property.details?.hoa_fee > 0 && (
            <span className="hoa-tag">+${property.details.hoa_fee}/mo HOA</span>
          )}
        </div>

        <h3 className="property-card-title">{property.title}</h3>

        <div className="property-card-location">
          <MapPin size={14} />
          <span>
            {property.location?.city}, {property.location?.state}
            {property.location?.zip_code ? ` ${property.location.zip_code}` : ''}
          </span>
        </div>

        {/* Stats */}
        <div className="property-card-stats">
          {property.details?.bedrooms > 0 && (
            <div className="stat">
              <Bed size={15} />
              <span>{property.details.bedrooms} Beds</span>
            </div>
          )}
          {property.details?.bathrooms > 0 && (
            <div className="stat">
              <Bath size={15} />
              <span>{property.details.bathrooms} Baths</span>
            </div>
          )}
          {property.details?.total_sqft > 0 && (
            <div className="stat">
              <Maximize size={15} />
              <span>{property.details.total_sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {property.lister_name && (
          <div className="property-card-footer">
            <div className="lister-info">
              {property.lister_avatar ? (
                <img src={property.lister_avatar} alt="" className="lister-avatar" />
              ) : (
                <div className="lister-avatar-placeholder">{property.lister_name[0]}</div>
              )}
              <span>{property.lister_name}</span>
            </div>
            {property.views_count > 0 && (
              <span className="views-count">👁 {property.views_count}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
