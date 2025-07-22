import { useState } from "react";
import { GlowCardPadding } from "../components/GlowCard";
import { cn } from "@/lib/utils";
// import { useAuthStore } from "@/store/useUserStore";
import { useTranslation } from 'react-i18next';
import { useFetchUser } from '@/queries/user';
import { useFetchShop } from '@/queries/shop';

import Footer from "@/components/Footer";
import MarketBuy from "@/components/MarketBuy";
import MarketSell from "@/components/MarketSell";
import bgImage from "../assets//bg/marketBg.jpg";
import Navbar from "../components/Navbar";
import GlobalLoading from '@/components/ui/loading/GlobalLoading';

interface Balance {
  money: number;
  tools: number;
  shield: number;
  usdt: number;
}

export default function Market() {
    const { t } = useTranslation();
    const { data: user ,isLoading: isUserLoading } = useFetchUser();
    const { isLoading: isShopLoading  } = useFetchShop();
    const [activeTab, setActiveTab] = useState<'Buy' | 'Sell'>('Buy')

    console.log(user);
    
    
    if (isUserLoading || isShopLoading) {
        return <GlobalLoading isReady={true} isLoading={false} isUserLoading={isUserLoading} isShopLoading={isShopLoading} />;
      }
    
    return (
        <div className="flex flex-col rounded-0 overflow-hidden items-center w-full min-h-screen bg-cover bg-center p-[20px] pb-[138px] relative" style={{ backgroundImage: `url(${bgImage})` }}>
            <Navbar balance={user?.balance as Balance} />
            <div className="flex w-full flex-col items-center justify-center mt-6 gap-1 mb-3">
                <p className="uppercase font-cabin font-bold text-3xl leading-[100%] text-[#E4F1FF]"
                style={{
                    textShadow: `
                        0 0 3.29px rgba(174, 210, 255, 0.8),
                        0 0 6px rgba(174, 210, 255, 0.8),
                        0 0 20px rgba(174, 210, 255, 0.5),
                        0 0 40px rgba(174, 210, 255, 0.5),
                        0 0 60px rgba(174, 210, 255, 0.6),
                        0 0 75px rgba(174, 210, 255, 0.5)
                    `}}>
                    {t('market.title')}
                </p>
                <p className="font-encode font-normal text-[10px] leading-tight text-[#E4F1FF]/85 tracking-wide">
                    {t('market.description')}
                </p>
            </div>
            <div className="flex items-center gap-4 font-encode font-normal text-[12px] leading-[100%]">
                <button onClick={() => setActiveTab('Buy')} className={cn("pb-1",activeTab === "Buy" ? "text-[#6DA0E1] border-b border-[#6DA0E1]" : "text-[#E4F1FF]")}>{t('market.buy')}</button>
                <button onClick={() => setActiveTab('Sell')} className={cn("pb-1",activeTab === "Sell" ? "text-[#6DA0E1] border-b border-[#6DA0E1]" : "text-[#E4F1FF]")}>{t('market.sell')}</button>
            </div>
            <GlowCardPadding>
                {activeTab === 'Buy' && (
                    <MarketSell />
                )}
                {activeTab === 'Sell' && (
                   <MarketBuy />
                )}
            </GlowCardPadding>
            <Footer />
        </div>
    )
}
