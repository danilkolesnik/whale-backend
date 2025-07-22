//@ts-nocheck
import Navbar from "@/components/Navbar"
import bgImage from "../assets/bg/ratingBg.jpg"
import arrow_icon from "../assets/icons/arrow.svg"
import Card from "@/components/Card"
import {CountdownTimer} from "@/components/Timer"

import GlowCard from "@/components/GlowCard"
import { RatingList } from "@/components/RatingList"
import Footer from "@/components/Footer"

import RatingInfo from "@/components/RatingInfo"
import { useNavigate } from "react-router-dom"
import { useFetchUser } from '@/queries/user';
import { useRatingStore } from "@/store/useRatingStore"
import { useAddRating,useFetchRating } from "@/queries/rating"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from 'react-i18next'
import { toast } from "sonner";
import GlobalLoading from '@/components/ui/loading/GlobalLoading';

interface Balance {
  money: number;
  tools: number;
  shield: number;
  usdt: number;
}

export default function Rating() {
    const { t } = useTranslation();

    const { data: user ,isLoading: isUserLoading } = useFetchUser();
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    }

    const addRatingMutation = useAddRating();
    const queryClient = useQueryClient();

    const ratings = useRatingStore((state) => state.ratings) 
    const users = ratings?.flatMap(item => item.users) || [];
    const roundCreatedAt = ratings?.[0]?.roundCreatedAt || '';
    const userExis = users.find(item => item.telegramId === user?.telegramId)

    const addToRating = async() =>{
        try {
            const res = await addRatingMutation.mutateAsync();
            if(res.data.success){
                await queryClient.invalidateQueries({ queryKey: ['rating'] });
                toast.success(t('rating.drawing'));
                return
            } 

            toast.success(t('rating.levelLimit'));
    
        } catch (error) {
            console.log(error);
        }
    }

    useFetchRating();

    if (isUserLoading ) {
        return <GlobalLoading isReady={true} isLoading={false} isUserLoading={isUserLoading} />;
    }
    return (

    <div className="flex flex-col items-center w-[100%] h-[1050px] bg-cover bg-center p-[20px] relative" style={{ backgroundImage: `url(${bgImage})` }}>
        <Navbar balance={user?.balance ?? { money: 0, tools: 0, shield: 0, usdt: 0 }} />
        <div className="w-full flex mt-3">
            <button className="flex items-center gap-1 bg-[#424F6866] px-1 py-[2px] rounded-[5px]" onClick={goBack}>
                <img src={arrow_icon} alt="arrow icon" className="szie-[22px]"/>
                <span className="font-encode font-medium text-[12px] leading-[100%] text-[#6DA0E1] opacity-70">{t('rating.exitPageRanking')}</span>
            </button>
        </div>
        <Card height="220">
            <div className="w-full flex items-center flex-col mb-3">
                    <p className="text-[#E4F1FF] text-[18px] font-semibold font-encode mb-3 text-center">{t('rating.nextDraw')}:</p>
                    <CountdownTimer targetDate={new Date(roundCreatedAt)} />
                    <div className="w-full flex items-center justify-center gap-1 mt-3">
                        <p className="font-encode text-[10px] text-[#E4F1FF]/80 font-normal">{t('rating.dontMissChance')}</p>
                        <RatingInfo />
                    </div>
                    <button onClick={addToRating} disabled={userExis} className={`${userExis ? "opacity-50" : ""} bg-[#6DA0E1] shadow-[0_0_2px_0_rgba(109,160,225,0.6),0_0_6px_0_rgba(109,160,225,0.6),0_0_16px_0_rgba(109,160,225,0.4)] h-8 rounded-2xl mt-[14px] flex items-center justify-center`}>
                        <span className="font-encode text-[12px] font-semibold text-[#121318] text-center px-[10px]">
                            {t('rating.joinNow')}
                        </span>
                    </button>
            </div>
        </Card>
        <GlowCard>
            <RatingList rating={users} />
        </GlowCard>
        <Footer />
    </div>
    )
}
