import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();
export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pk_compare_list');
      if (stored) setCompareList(JSON.parse(stored));
    } catch(e) {}
  }, []);

  const save = (list) => {
    setCompareList(list);
    try { localStorage.setItem('pk_compare_list', JSON.stringify(list)); } catch(e) {}
  };

  const addToCompare = (property) => {
    if (compareList.find(p => p.id === property.id)) {
      toast('Already in compare list', { icon: 'ℹ️' });
      return;
    }
    if (compareList.length >= 3) {
      toast.error('Compare limit reached (max 3)');
      return;
    }
    save([...compareList, property]);
    toast.success('Added to compare');
  };

  const removeFromCompare = (propertyId) => {
    save(compareList.filter(p => p.id !== propertyId));
    toast.success('Removed from compare');
  };

  const clearCompare = () => save([]);

  const isInCompare = (propertyId) => compareList.some(p => p.id === propertyId);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};
