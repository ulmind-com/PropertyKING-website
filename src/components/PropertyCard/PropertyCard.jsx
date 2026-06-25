import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Maximize, GitCompareArrows } from 'lucide-react';
import { useState } from 'react';
import { favoriteAPI } from '../../api';
import { useCompare } from '../../context/CompareContext';

export default function PropertyCard({ property, onFavoriteToggle }) {
  const [isFav, setIsFav] = useState(property.is_favorited || false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(property.id);

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
      if (isFav) { await favoriteAPI.remove(property.id); }
      else { await favoriteAPI.add(property.id); }
      setIsFav(!isFav);
      onFavoriteToggle?.(property.id, !isFav);
    } catch (err) { console.error('Favorite toggle failed', err); }
  };

  return (
    <Link to={`/property/${property.slug || property.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 no-underline text-inherit"
    >
      {/* Image */}
      <div className="relative aspect-[16/11] overflow-hidden bg-neutral-100">
        {!imgLoaded && <div className="skeleton absolute inset-0" />}
        <img
          src={primaryImage}
          alt={property.title}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide
            ${property.listing_type === 'sale' ? 'bg-neutral-900 text-white' : property.listing_type === 'rent' ? 'bg-violet-500 text-white' : 'bg-amber-500 text-white'}
          `}>
            {property.listing_type === 'sale' ? 'For Sale' : property.listing_type === 'rent' ? 'For Rent' : 'For Lease'}
          </span>
          {property.property_type_name && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-white/90 text-neutral-900 backdrop-blur-sm">
              {property.property_type_name}
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-all backdrop-blur-sm
            ${isFav ? 'bg-white/95' : 'bg-black/30 hover:bg-black/50 hover:scale-110'}
          `}
          onClick={handleFavorite}
        >
          <Heart size={16} fill={isFav ? '#EF4444' : 'none'} stroke={isFav ? '#EF4444' : 'white'} />
        </button>

        {/* Compare */}
        <button
          className={`absolute top-12 right-3 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-all backdrop-blur-sm
            ${inCompare ? 'bg-green-500' : 'bg-black/30 hover:bg-black/50 hover:scale-110'}
          `}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); inCompare ? removeFromCompare(property.id) : addToCompare(property); }}
          title={inCompare ? 'Remove from compare' : 'Add to compare'}
        >
          <GitCompareArrows size={14} stroke="white" />
        </button>


      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-neutral-900 tracking-tight">
            {formatPrice(property.price, property.price_unit)}
          </span>
          {property.details?.hoa_fee > 0 && (
            <span className="text-[11px] font-medium text-neutral-400">+${property.details.hoa_fee}/mo HOA</span>
          )}
        </div>

        <h3 className="text-[15px] font-bold text-neutral-900 leading-snug line-clamp-2">{property.title}</h3>

        <div className="flex items-center gap-1 text-neutral-400 text-[13px] font-medium">
          <MapPin size={13} />
          <span>{property.location?.city}, {property.location?.state}{property.location?.zip_code ? ` ${property.location.zip_code}` : ''}</span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-2.5 mt-1 border-t border-neutral-100">
          {property.details?.bedrooms > 0 && (
            <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
              <Bed size={14} /> <span>{property.details.bedrooms} Beds</span>
            </div>
          )}
          {property.details?.bathrooms > 0 && (
            <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
              <Bath size={14} /> <span>{property.details.bathrooms} Baths</span>
            </div>
          )}
          {property.details?.total_sqft > 0 && (
            <div className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
              <Maximize size={14} /> <span>{property.details.total_sqft.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {property.lister_name && (
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-neutral-100">
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
              {property.lister_avatar ? (
                <img src={property.lister_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] font-extrabold">
                  {property.lister_name[0]}
                </div>
              )}
              <span>{property.lister_name}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden mb-5">
      {/* Image Skeleton */}
      <div className="w-full aspect-[16/11] bg-neutral-100 skeleton" />
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col gap-3">
        <div className="w-3/4 h-5 bg-neutral-100 rounded-md skeleton" />
        <div className="w-1/2 h-4 bg-neutral-100 rounded-md skeleton mt-1" />
        <div className="flex gap-4 mt-2">
          <div className="w-12 h-4 bg-neutral-100 rounded-md skeleton" />
          <div className="w-12 h-4 bg-neutral-100 rounded-md skeleton" />
          <div className="w-12 h-4 bg-neutral-100 rounded-md skeleton" />
        </div>
        <div className="w-24 h-6 bg-neutral-100 rounded-md skeleton mt-2" />
      </div>
    </div>
  );
}
