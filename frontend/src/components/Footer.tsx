import { NavLink, useLocation  } from "react-router-dom"
import { useTranslation } from 'react-i18next';
import { hapticFeedback } from '@telegram-apps/sdk';
import home_icon from "../assets/icons/home_inactive.svg"
import home_icon_active from "../assets/icons/Home_active.svg"
import earn_icon from "../assets/icons/Earn_active.svg"
import earn_icon_inactive from "../assets/icons/earn_inactive.svg"
import market_icon from "../assets/icons/market_inactive_v2.svg"
import market_icon_active from "../assets/icons/Market_active_v2.svg"
import rating_icon from "../assets/icons/navBar/rating.svg"
import rating_icon_active from "../assets/icons/navBar/rating_active.svg"

function preloadImages(urls: string[]) {
  urls.forEach((url: string) => {
    const img = new Image();
    img.src = url;
  });
}

export default function Footer() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const handleHapticFeedback = () => {
    const vib = localStorage.getItem('vibration');
    if (vib === 'on') {
      if (typeof hapticFeedback !== 'undefined' && hapticFeedback.impactOccurred) {
        setTimeout(() => {
          hapticFeedback.impactOccurred('medium');
        }, 0);
      }
      return;
    } 
  };

  preloadImages([
    home_icon,
    home_icon_active,
    earn_icon,
    earn_icon_inactive,
    market_icon,
    market_icon_active,
    rating_icon,
    rating_icon_active
  ]);

  return (
     <div className="
        w-[90%] rounded-[20px] h-[90px] fixed bottom-5 max-w-[420px]
        bg-[rgb(18,19,24)]
        shadow-[0_0_3px_rgba(174,210,255,0.5),0_0_10px_rgba(174,210,255,0.3),0_0_16px_rgba(174,210,255,0.2)]
        backdrop-blur-sm
        border border-[rgba(140,175,218,0.2) opacity-10]
        z-100
    ">
    <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-[#6DA0E1CC] blur-[30px] rounded-full opacity-90"     
      />
    <ul className="flex justify-center gap-6 font-encode items-center mt-[6px]">
                {/* <li className={`size-[60px] ${pathname === '/market' ? 'scale-125' : ''} size-[60px]`}>
                    <NavLink to="/market" className="flex flex-col items-center" onClick={handleHapticFeedback}>
                        <img src={pathname === '/market' ? market_icon_active : market_icon} className={`object-cover ${pathname === '/market' ? 'w-[80px]' : 'w-[60px]'}`} alt="" />
                        <p className={`text-[8px] font-medium leading-[100%] ${pathname === '/market' ? 'text-[#98C1F5]' : 'text-[#5D6E8B]'}`} style={{filter: 'drop-shadow(0 0 0.7px rgba(93,110,139,0.8)) drop-shadow(0 0 3px rgba(93,110,139,0.8))'}}>
                            {t('footer.market')}
                        </p>
                    </NavLink>
                </li> */}
                <li className={`relative ${pathname === '/' ? 'scale-125' : ''} size-[60px]`}>
                    <NavLink to="/" className="flex flex-col items-center" onClick={handleHapticFeedback}>
                        <img src={pathname === '/' ? home_icon_active : home_icon} className={`object-cover`} alt="" />
                        <p className={`text-[8px] font-medium leading-[100%] ${pathname === '/' ? 'text-[#98C1F5]' : 'text-[#5D6E8B]'}`} style={{filter: 'drop-shadow(0 0 0.7px rgba(93,110,139,0.8)) drop-shadow(0 0 3px rgba(93,110,139,0.8))'}}>
                            {t('footer.home')}
                        </p>
                    </NavLink>
                </li>
            <li className={`size-[60px] ${pathname === '/earn' ? 'scale-125' : ''} size-[60px]`}>
                <NavLink to="/earn" className="flex flex-col items-center" onClick={handleHapticFeedback}>
                    <img src={pathname === '/earn' ? earn_icon : earn_icon_inactive} className={`object-cover ${pathname === '/earn' ? 'w-[80px]' : 'w-[60px]'}`} alt="" />
                    <p className={`text-[8px] font-medium leading-[100%] ${pathname === '/earn' ? 'text-[#98C1F5]' : 'text-[#5D6E8B]'}`} style={{filter: 'drop-shadow(0 0 0.7px rgba(93,110,139,0.8)) drop-shadow(0 0 3px rgba(93,110,139,0.8))'}}>
                        {t('footer.earn')}
                    </p>
                </NavLink>
            </li>
            <li className={`size-[60px] ${pathname === '/rating' ? 'scale-120' : 'translate-y-[5px]'}`}>
                <NavLink to="/rating" className="flex flex-col items-center" onClick={handleHapticFeedback}>
                    <img src={pathname === '/rating' ? rating_icon_active : rating_icon} className={`object-cover ${pathname === '/rating' ? 'w-[80px]' : 'w-[60px]'}`} alt="" />
                    <p className={`text-[8px] font-medium leading-[100%] ${pathname === '/rating' ? 'text-[#98C1F5]' : 'text-[#5D6E8B]'}`} style={{filter: 'drop-shadow(0 0 0.7px rgba(93,110,139,0.8)) drop-shadow(0 0 3px rgba(93,110,139,0.8))'}}>
                        {t('footer.rating')}
                    </p>
                </NavLink>
            </li> 
    </ul>
  </div>
  )
}