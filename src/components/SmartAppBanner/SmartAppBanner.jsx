import { useState, useEffect } from 'react'; // Trigger Vercel deployment
import Lottie from 'lottie-react';
import toast from 'react-hot-toast';
import playStoreLottie from '../../../lotties/GooglePlayButton.json';
import appStoreLottie from '../../../lotties/AppStore.json';

export default function SmartAppBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('appBannerDismissed');
    const isMobile = window.innerWidth <= 768;
    
    if (!isDismissed && isMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem('appBannerDismissed', 'true');
    }, 300);
  };

  const handleAppStore = () => {
    toast('App Store version coming soon!', { icon: '🍏' });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300 md:hidden backdrop-blur-[2px] ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        onClick={handleDismiss}
      />
      
      {/* Bottom Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-[#0F0F0F] z-[9999] rounded-t-3xl border-t border-white/10 p-5 pb-8 md:hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
      >
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center p-2.5 shadow-lg shrink-0">
             <img src="/logoremovebg.png" alt="PropertyKing" className="w-full h-full object-contain drop-shadow-md" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-[19px] leading-tight mb-1">PropertyKing Pro</h3>
            <p className="text-neutral-400 text-[13px] leading-snug">Find off-market deals on the go.</p>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-white text-xs font-bold mr-1">4.9</span>
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-3.5 h-3.5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <a 
            href="https://play.google.com/store/apps/details?id=com.propertykingpro.app&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#1A1A1A] hover:bg-[#222222] border border-white/[0.05] transition-all rounded-xl h-[52px] flex items-center justify-center overflow-hidden active:scale-[0.98]"
          >
            <Lottie animationData={playStoreLottie} loop={true} style={{ width: '130px', transform: 'scale(1.2)' }} />
          </a>
          <button 
            onClick={handleAppStore}
            className="flex-1 bg-[#1A1A1A] hover:bg-[#222222] border border-white/[0.05] transition-all rounded-xl h-[52px] flex items-center justify-center overflow-hidden active:scale-[0.98]"
          >
            <Lottie animationData={appStoreLottie} loop={true} style={{ width: '130px', transform: 'scale(1.2)' }} />
          </button>
        </div>

        <button 
          onClick={handleDismiss}
          className="w-full h-[48px] rounded-xl text-neutral-500 font-semibold text-[15px] transition-colors hover:text-neutral-300 hover:bg-white/[0.02]"
        >
          Continue in browser
        </button>
      </div>
    </>
  );
}
