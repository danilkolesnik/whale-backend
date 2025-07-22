//@ts-nocheck
import type { FC } from "react";
import { StarLightingIcon } from "@/assets/icons/icons";
import { useAuthStore } from "@/store/useUserStore";
import { useTranslation } from 'react-i18next';
import PurchaseItem from "./PurchaseItem";
import star_full from "../assets/icons/Star_full.svg"
import armorImg from "@/assets/items/armor_main_big.png";
import coins_icon from "../assets/icons/market/coins_icon.svg";

import helmetImg from "@/assets/items/helmet_big.png";
import legImg from "@/assets/items/legs_big.png";

interface ArmorCardProps {
  level: number;
  part: string;
  type: string;
  price: number;
  coins: number;
  key?: number;
  id?: number;
  action?: "buy" | "sell";
  sellerId?: string;
  name?: string;
  shield?: number;
  buyerBalance?: {
    money: number;
    usdt: number;
  } | null;
  setOpenEdit?: (open: boolean) => void;
  setSelectItem?: (item: MarketSellItem) => void;
}


export const MarketCard: FC<ArmorCardProps> = ({ level, part, type, price, coins, action, id, sellerId, name, setOpenEdit, shield, setSelectItem, buyerBalance }) => {

  const { t } = useTranslation();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}${t('market.million')}`;
    if (num >= 100000) return `${(num / 1000).toFixed(0)}${t('market.thousand')}`;
    if (num >= 10000) return `${(num / 1000).toFixed(0)}${t('market.thousand')}`;
    return num.toString();
  };

  const getImage = (type: string) => {
    switch(type.toLowerCase()){
        case 'helmet':
            return helmetImg;
        case 'armor':
            return armorImg;
        case 'leg':
            return legImg;
    }

}
  const telegramId = useAuthStore((state) => state.user?.telegramId);
  return (
    <div className={`flex items-center bg-[#AED2FF1A] text-white rounded-[8px] pr-[6px] pl-[11px] py-2 ${sellerId === telegramId ? 'bg-[#AED2FF66]' : ''}`} style={{ boxShadow: sellerId === telegramId ? '0px 1px 2px 0px rgba(174, 210, 255, 0.2) inset, 0px 1px 4px 0px rgba(174, 210, 255, 0.3) inset, 0px 1px 6px 0px rgba(174, 210, 255, 0.3) inset' : 'none' }}>

      <div className="flex items-center justify-start text-blue-300 font-bold text-base relative w-[18%]">
        <div className="relative">
          <img src={star_full} alt="star icon" className="size-[32px] absolute left-[3px]"/>
          <StarLightingIcon />
          <span className="font-doppio text-[10px] leading-2 font-normal absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">{level}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 font-encode w-[52%]">
        <div className="size-[42px] bg-gradient-to-b from-[#445162] via-[#4C5C72] to-[#AED2FF] rounded-[3px]">
          <img src={getImage(part)} alt="armor" className="object-cover" />
        </div>
        <div className="flex flex-col leading-tight gap-[2px]">
        <span className="text-[10px] font-semibold text-[#ffffff]">{part}</span>
        <div className="flex flex-row items-center bg-[#6DA0E133] rounded-[8px] py-[3px] px-[6px] gap-[2px]">
          <span className="text-[9px] font-normal text-[#FFFFFF]/90 leading-[100%] whitespace-nowrap">{formatNumber(price)} USDT</span>
          <span className="text-[9px] font-normal text-[#FFFFFF]/90 leading-[100%]">/</span>
          <span className="flex items-center gap-[3px] text-[9px] font-normal text-[#FFFFFF]/90 leading-[100%] whitespace-nowrap">{formatNumber(coins * 100)} <img src={coins_icon} alt="coins" className="w-[12px] h-[12px]"/> </span>
        </div>

      </div>
        
      </div>
      <div className="flex justify-end w-[30%]">
        <PurchaseItem buyerBalance={buyerBalance} setSelectItem={setSelectItem} part={part} type={type} level={level} sellerId={sellerId} id={id} price={price} coins={coins} action={action} name={name} setOpenEdit={setOpenEdit} shield={shield}/> 
      </div>
    </div>
  )
}