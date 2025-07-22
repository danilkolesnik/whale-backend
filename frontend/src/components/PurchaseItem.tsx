//@ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { DarkerIcon2, UsdtIcon } from "@/assets/icons/icons";
import { useSellItem,useBuyItem, useFetchMarketSellItemsQuery, useFetchMarketBuyItemsQuery } from "@/queries/market";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useUserStore";
import { useTranslation } from 'react-i18next';
import { UPGRADE_SHIELD } from "@/constants";
import armorImg from "@/assets/items/armor_main_big.png";
import helmetImg from "@/assets/items/helmet_big.png";
import legImg from "@/assets/items/legs_big.png";
import edit_icon from "../assets/icons/edit.svg"
import shop_icon from "../assets/icons/shop.svg"
import sell_icon from "../assets/icons/Sell.svg"
interface ArmorCardProps {
  id?: number;
  price: number;
  coins: number;
  action?: "buy" | "sell";
  sellerId?: number;
  level?: number;
  name?: string;
  openEdit?: boolean;
  type?: string;
  part?: string;
  buyerBalance?:any,
  setOpenEdit?: (open: boolean) => void;
  shield?: number;
  setSelectItem?: (item: MarketSellItem) => void;
}

export default function PurchaseItem({
    id, 
    price, 
    coins,
    action, 
    sellerId, 
    level, 
    name, 
    type,
    part,
    setOpenEdit,
    shield,
    setSelectItem,
    buyerBalance
}: ArmorCardProps) {

  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string>(armorImg);
  const {balance} = useAuthStore((state) => state.user);
  const telegramId = useAuthStore((state) => state.user?.telegramId);

  const sellItem = useSellItem();
  const buyItem = useBuyItem();
  const queryClient = useQueryClient();

  let isDisabled = false;

if (action === 'buy') {
  if (buyerBalance?.usdt < price) {
    isDisabled = true;
  }
} else if (action === 'sell') {
  if (balance?.usdt < price) {
    isDisabled = true;
  }
}

// Coins (isDisabledCoins)
let isDisabledCoins = false;

if (action === 'buy') {
  if (buyerBalance?.money < (price * 100)) {
    isDisabledCoins = true;
  }
} else if (action === 'sell') {
  if (balance?.money < (price * 100)) {
    isDisabledCoins = true;
  }
}

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

  const handleSellItem = async (currency:string) => {
    setOpen(false);
    await sellItem.mutateAsync({
        id: id,
        currency: currency,
    },{
      onSuccess: async(data) => {
        console.log(data);
        
        if(data.data.success){
          toast.success(t('purchase.itemSold'));
          await queryClient.invalidateQueries({ queryKey: ['marketSellItems'] });
          await queryClient.invalidateQueries({queryKey: ['user']});
          setIsLoading(false);   
          return
        } else {
          // toast.success(t('purchase.itemMissing'));
          setIsLoading(false);
        }
      
      },
      onError: () => {
        setIsLoading(false);
      }
    })
    setSelectItem(null);
  };

  const handleBuyItem = async (currency: string) => {
    setOpen(false);
    await buyItem.mutateAsync({
      id: id,
      currency: currency
    },{
      onSuccess: async(data) => {
        if(data.data.code === 200){
          toast.success(t('purchase.orderSold'));
          await queryClient.invalidateQueries({ queryKey: ['marketBuyItems'] });
          await queryClient.invalidateQueries({ queryKey: ['user'] });
          return
        } 
        toast.success(t('purchase.itemMissing'));
      }
    });
    setSelectItem(null);
  }

  useFetchMarketBuyItemsQuery();
  useFetchMarketSellItemsQuery();

  useEffect(() => {
    setImage(getImage(part));
}, [part]);

  console.log(action);

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
        <div 
            className="flex font-encode items-center justify-center w-full bg-[#6DA0E180]/60 rounded-[6px] text-center py-[10px] px-[10px] ml-[12px] mr-[2px] my-[5px]" 
            onClick={() => sellerId === telegramId ? setOpenEdit && setOpenEdit(true) : setOpen(true)}
        >
            {sellerId === telegramId && 
                <span className="font-encode font-normal text-[10px] text-[#E4F1FF] tracking-wide">
                  {t('market.change')}
                </span>
            }
            {sellerId !== telegramId && 
              <span className="font-encode font-normal text-[10px] text-[#E4F1FF] tracking-wide">
              {action === "buy" ? t('market.sell') : t('market.buy')}
            </span>
            }
            {action === "sell" && (
              <img src={sellerId === telegramId ? edit_icon : sell_icon} alt="icon" className="ml-1 w-[15px] h-[13px]"/>
            )}
            {action === "buy" && (
              <img src={sellerId === telegramId ? edit_icon : shop_icon} alt="icon" className="ml-1 w-[15px] h-[13px]"/>
            )}
        </div>
        <DialogContent className="z-[100] rounded-[20px] bg-gradient-to-b from-[#0B0B0F] to-[#212C3D] shadow-[inset_0.25px_0.5px_2px_rgba(174,210,255,0.8),inset_-0.25px_-0.5px_2px_rgba(174,210,255,0.2)] backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                <DialogHeader>
                    <DialogTitle className="font-encode font-semibold text-[16px] text-[#FFFFFF] mt-5 mb-2">
                      {action === 'buy' ? t('purchase.objectSell') : t('purchase.objectPurchase')}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-[14px] w-full items-center">         
                        <div         
                            className="relative w-full max-w-[124px] h-[124px] rounded-[10px] bg-gradient-to-b from-[#6DA0E100]/90 to-[#AED2FF]/70 bg-opacity-30 flex text-white text-lg font-semibold p-1"
                            >
                            <div className="flex justify-between w-full h-3 items-center">
                                <div className=" bg-[#AED2FF80]/50 font-doppio font-normal text-[7px] px-[3px] h-3 rounded-[4px] text-[#AED2FF80] flex items-center">
                                    <span className="h-[8px] flex items-center">Lv {level}</span>
                                </div>
                                <div className=" bg-[#12131866] text-[#AED2FF]/60 h-3 font-doppio font-normal text-[7px] px-0.5 py-0.5 rounded-[4px] flex items-center">
                                    <span className="h-[8px] flex items-center">{UPGRADE_SHIELD[part][level]}</span>
                                </div>
                                
                            </div>
                            <img src={image} alt="armor" className="w-[100px] object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <div className=" absolute bottom-1 max-w-[116px] w-full text-center">
                                <span className="w-full font-encode font-medium text-[16px] text-[#FFFFFF]">
                                    {/* {t('purchase.armor')} */}
                                    {t(`${type}`)}
                                </span>
                                
                            </div>
                        </div>
                        <div className="flex flex-col w-full gap-[14px]">
                            <p className="bg-[#30353E] w-full rounded-[6px] p-[10px] h-[30px] flex items-center">
                                <span className="font-encode font-normal text-[9px] text-[#E4F1FF40] tracking-wide">
                                    {name ? name : type}
                                </span>
                            </p>
                            <p className="bg-[#30353E] w-full rounded-[6px] p-[10px] h-[30px] flex items-center">
                                <span className="font-encode font-normal text-[9px] text-[#E4F1FF40] tracking-wide">
                                    {action === 'buy' ? type : part}
                                </span>
                            </p>
                            <p className="bg-[#30353E] w-full rounded-[6px] p-[10px] h-[30px] flex items-center">
                                <span className="font-encode font-normal text-[9px] text-[#E4F1FF40] tracking-wide">
                                    {level}
                                </span>
                            </p>    
                        </div>
                        
                    </div>
                    <div className={`flex flex-col px-[15px] pt-[13px] pb-[15px] border border-[#AED2FF30] rounded-[10px] w-full gap-3 ${isDisabled ? 'bg-[#414853]' : 'bg-[#30353E]'}`}>
                        <div className="w-full flex flex-col gap-1">
                            <span className="w-full font-encode font-semibold text-[10px] text-[#FFFFFF] tracking-wide">
                                {t('purchase.priceInUsdt')}
                            </span>
                            {/* <p className="w-full font-encode font-normal text-[9px] text-[#E4F1FF40] tracking-wide">
                                {t('purchase.commission')}
                            </p> */}
                        </div>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-[3px]">
                                <p className="font-encode font-normal text-[9px] text-[#E4F1FF40] tracking-wide">
                                  {t('purchase.objectValue')}
                                </p>
                                <div className="flex gap-1 items-center">
                                    <UsdtIcon />
                                    <span className="font-encode font-medium text-[14px] text-[#FFFFFF]">{price}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => action === 'buy' ? handleBuyItem('USDT') : handleSellItem('USDT')} 
                                disabled={isDisabled}
                                className={`px-[10px]  outline-none focus:outline-none py-[5px] flex items-center justify-center bg-[#6DA0E166]/90 border border-[#AED2FF80]/90 rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180] gap-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className="font-doppio font-normal text-[14px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF] flex items-center justify-center">
                                  {action === 'buy' ? t('purchase.sell') : t('purchase.pay')}
                                </span> 
                                {/* <img src={arrow_icon} alt="arrow" className="w-[24px] h-[24px]" /> */}
                            </button>
                        </div>
                    </div>
                    <div className={`flex flex-col px-[15px] pt-3 pb-0 bg-[#30353E] border border-[#AED2FF30] rounded-[10px] w-full gap-3 ${isDisabledCoins ? 'bg-[#414853]' : 'bg-[#30353E]'}`}>
                        <div className="w-full flex flex-col gap-1">
                            <span className="w-full font-encode font-semibold text-[10px] text-[#FFFFFF] tracking-wide">
                                {t('purchase.priceInCoins')}
                            </span>
                            
                        </div>
                        <div className="flex items-start justify-between mb-[15px]">
                            <div className="flex flex-col gap-[3px]">
                                <p className="font-encode font-normal text-[9px] text-[#E4F1FF40] tracking-wide">
                                  {t('purchase.objectValue')}
                                </p>
                                <div className="flex gap-1 items-center">
                                    <DarkerIcon2 />
                                    <span className="font-encode font-medium text-[14px] text-[#FFFFFF]">{price * 100}</span>
                                </div>
                            </div>
                            <button onClick={() => action === 'buy' ? handleBuyItem('COINS') : handleSellItem('COINS')}  
                                disabled={isDisabledCoins}
                                className={`px-[10px] py-[5px]  outline-none focus:outline-none flex items-center justify-center bg-[#6DA0E166]/90 border border-[#AED2FF80]/90 rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180] gap-1 ${isDisabledCoins ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span className=" font-doppio font-normal text-[14px] text-[#E4F1FF] h-5 [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF] flex items-center justify-center">
                                {action === 'buy' ? t('purchase.sell') : t('purchase.pay')}
                                </span>
                            </button>
                        </div>
                    </div>
                    <p className="text-[#AED2FF] font-encode text-[10px] font-normal">
                      {t('purchase.noExchange')}
                    </p>
                </div>
                    
                </DialogContent>
    </Dialog>
    </>
  )
}
