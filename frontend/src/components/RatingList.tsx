import { cn } from "@/lib/utils";
import { useState } from "react";
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon, FourthPlaceIcon, FifthPlaceIcon, AllPlacesIcon } from "@/assets/icons/icons";
import type { User } from "@/store/useRatingStore";
import user_line from "../assets/icons/user-line.svg"
import { FirstPlaceIconLead, SecondPlaceIconLead, ThirdPlaceIconLead } from "@/assets/icons/icons";
import CustomScrollbar from "./CustomScrollbar";
import { useTranslation } from 'react-i18next';
import money from "../assets/icons/tools/money.png";

interface iAppProps {
    name?: string;
    progress?: string;
    place: number;
}
interface RewardCardProps {
  place: string;
  reward: string;
  index: number;
}

const icons = [
  <FirstPlaceIcon />,
  <SecondPlaceIcon />,
  <ThirdPlaceIcon />,
  <FourthPlaceIcon />,
  <FifthPlaceIcon />,
  <AllPlacesIcon />
]


const rewards = [
  { place: "1st Place", reward: "10 000"},
  { place: "2nd Place", reward: "9 000"},
  { place: "3rd Place", reward: "8 000"},
  { place: "4th Place", reward: "7 000 "},
  { place: "5th Place", reward: "6 000"},
  { place: "6th Place", reward: "5 000"},
  { place: "7th Place", reward: "4 000"},
  { place: "8th Place", reward: "3 000"},
  { place: "9th Place", reward: "2 000"},
  { place: "10th Place", reward: "1 000"}
];

export function RatingList({ rating }: { rating: User[] } ) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'Leaderboard' | 'Price'>('Leaderboard')
  return (
    <div className="w-full mx-auto rounded-lg shadow">
      <div className="mb-4 text-[#E4F1FF]">
        <h2 className="font-semibold text-[18px] leading-[100%] tracking-wide mb-1">{t('ratingList.rating')}</h2>
        {/* <p className="font-normal text-[10px] leading-[100%] tracking-wide text-[#E4F1FF]/80">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p> */}
      </div>
      
      <div className="flex items-center font-encode font-normal text-[12px] leading-[100%] my-3 pl-16 pr-26 justify-between">
        <button 
          onClick={() => setActiveTab('Leaderboard')} 
          className={cn(
            "pb-1 outline-none focus:outline-none",
            activeTab === "Leaderboard" 
              ? "text-[#6DA0E1] border-b border-[#6DA0E1]" 
              : "text-[#E4F1FF]/60"
          )}
        >
          {t('ratingList.leaderboard')}
        </button>
        <button 
          onClick={() => setActiveTab('Price')} 
          className={cn(
            "pb-1 outline-none focus:outline-none",
            activeTab === "Price" 
              ? "text-[#6DA0E1] border-b border-[#6DA0E1]" 
              : "text-[#E4F1FF]/60"
          )}
        >
          {t('ratingList.price')}
        </button>
      </div>

      {activeTab === "Leaderboard" ? (
        <div className="h-[420px]">
          <CustomScrollbar className="pr-2">
            <div className="pr-2 space-y-3">
              {rating.map((user, index) => (
                <RatingCard key={index} name={user?.displayName} progress={user?.shield.toString()} place={index} />
              ))}
            </div>
          </CustomScrollbar>
        </div>
      ) : (
        <div>
          <p className="font-encode font-normal text-[10px] text-[#E4F1FF]/70 text-center mb-3">{t('ratingList.topPlayers')}</p>
          <CardPrice />
        </div>
      )}
    </div>
  );
}

export function RatingCard({ name, progress, place }: iAppProps) {
    return (
        <div className="bg-gradient-to-r from-[#AED2FF33] to-[#6DA0E133] w-full h-[46px] rounded-[23.5px] flex items-center p-1 relative">
            <img src={user_line} alt="user icon" className="text-left mr-[13px]"/>
            <div className="flex flex-col">
                <p className="h-[20px] font-encode text-[12px] font-semibold leading-[20px] text-[#E4F1FF]">{name}</p>
                <p className="h-[14px] font-encode text-[10px] font-medium leading-[100%] text-[#6DA0E1] w-[70px] bg-[#12131899] rounded-[3px] text-center pt-0.5">{progress}</p>
            </div>
            {place !== 0 && place !== 1 && place !== 2 ? (
              <div className="h-[21px] bg-[#222930]/80 flex items-center justify-center rounded-[10px] p-2 absolute right-3">
                <span className="font-encode leading-5 text-[10px] text-[#6DA0E1] font-medium">#{place > 2 ? place + 1 : place}</span>
              </div>
            ) : null}
            {place === 0 && (
              <div className="h-[32px]  flex items-center justify-center absolute right-1">
                  <FirstPlaceIconLead />
              </div>
              
            )}
            {place === 1 && (
              <div className="h-[32px]  flex items-center justify-center absolute right-1">
                <SecondPlaceIconLead />
              </div>  
            )}
            {place === 2 && (
              <div className="h-[32px]  flex items-center justify-center absolute right-1">
                <ThirdPlaceIconLead />
               </div> 
            )}
            
        </div>
    )
}

export function CardList({ place, reward, index }: RewardCardProps) {
  
  const icon = index < 5 ? icons[index] : icons[5];
  return (
    <div className="flex items-center text-white rounded-[3px] h-10 w-full border border-[#6DA0E133] bg-[#6DA0E133]">
      {index == 3 || index == 4 ? (
          <div className="flex items-center justify-start text-blue-300 font-bold text-base relative w-[20%] pl-1.5">
            <div className="h-full w-full flex items-center justify-start pl-[1.5px]">
                {icon}
            </div>
            
          </div>
      ) : (
        <div className="flex items-center justify-start text-blue-300 font-bold text-base relative w-[20%] pl-1">
          {icon}
        </div>
      )}
      

      <div className="flex items-center justify-start pl-2 w-[45%]">
        <span className="font-encode font-semibold text-[12px] tracking-wide">
          {place}
        </span>
      </div>

      <div className="flex items-center justify-center w-[35%] bg-[#AED2FF1A] h-full">
        <div className="flex items-center gap-[2px]">
          <span className="text-[#E4F1FF] text-[10px] font-encode font-medium">{reward}</span>
          <img src={money} alt="tools" className="w-[12px]" />
        </div>
      </div>
    </div>
  );
}

export function CardPrice() {
  return (
    <CustomScrollbar className="h-full pr-2">
      <div className="w-full max-w-[320px] mx-auto">
          <div className="relative ">
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full max-w-[320px] h-[380px] overflow-y-auto custom-scrollbar pr-2">
                <div className="border border-[#AED2FF66] rounded-[6px] px-3 py-4 bg-gradient-to-b from-[#1A1C24] to-[#121318] shadow-[inset_0_0_4px_0_#6DA0E110,inset_0_0_10px_0_#6DA0E126,inset_0_0_10px_0_#6DA0E110]">
                  <div className="relative flex flex-col gap-3 w-full">
                    <div className="absolute top-0 bottom-0 left-[20%] w-px bg-gradient-to-b from-[#4F5D74] to-[#1A1D2B]" />
                    <div className="absolute top-0 bottom-0 left-[65%] w-px bg-gradient-to-b from-[#4F5D74] to-[#1A1D2B]" />
                    {rewards.map((item, i) => (
                      <CardList key={i} index={i} reward={item.reward} place={item.place} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </CustomScrollbar>
  );
}