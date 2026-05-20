import { Link, useLocation } from 'react-router-dom';
import { GitCompareArrows } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';

export default function CompareFloatingButton() {
  const { compareList } = useCompare();
  const location = useLocation();

  if (compareList.length === 0 || location.pathname === '/compare') return null;

  return (
    <Link
      to="/compare"
      className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 bg-neutral-900 text-white px-5 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:bg-black transition-all hover:scale-105 hover:-translate-y-1 no-underline"
      style={{ fontFamily: 'Raleway, sans-serif' }}
    >
      <div className="relative">
        <GitCompareArrows size={20} />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {compareList.length}
        </span>
      </div>
      <span className="font-bold text-[14px]">Compare</span>
    </Link>
  );
}
