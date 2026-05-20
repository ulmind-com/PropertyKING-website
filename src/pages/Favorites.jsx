import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PropertyCard, { PropertyCardSkeleton } from '../components/PropertyCard/PropertyCard';
import { favoriteAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadFavorites();
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      const res = await favoriteAPI.list({ params: { limit: 10 } });
      setFavorites(res.data?.favorites || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleFavoriteToggle = (propertyId, isFav) => {
    if (!isFav) {
      setFavorites(favorites.filter(f => f.property?.id !== propertyId));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="pt-[72px]">
      {/* Header — matches app */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="container-custom flex items-end justify-between py-5">
          <h1 className="text-[26px] font-extrabold tracking-tight text-neutral-900">Favorites</h1>
          <span className="text-sm text-neutral-400 font-medium">{favorites.length} saved</span>
        </div>
      </div>

      <div className="container-custom py-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-md:grid-cols-1 gap-5">
            {Array(4).fill(null).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-md:grid-cols-1 gap-5 stagger-children">
            {favorites.map(fav => (
              <PropertyCard
                key={fav.id}
                property={{ ...fav.property, is_favorited: true }}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          /* Empty state — matches app */
          <div className="flex flex-col items-center justify-center pt-20 pb-20 text-center">
            <Heart size={48} className="text-neutral-200 mb-4" />
            <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">No favorites yet</h3>
            <p className="text-sm text-neutral-400 mt-2 max-w-[300px]">Properties you save will appear here</p>
            <button className="btn btn-primary mt-6" onClick={() => navigate('/properties')}>Browse Properties</button>
          </div>
        )}
      </div>
    </div>
  );
}
