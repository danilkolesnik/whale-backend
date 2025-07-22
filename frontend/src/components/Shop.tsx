//@ts-nocheck
// import GlowCard from "./GlowCard";
import React, { useState } from "react";
import type { ShopItem } from "@/store/useShopStore";
import { toast } from "sonner";
import { useBuyItem } from "@/queries/equipActions";
import { useQueryClient } from "@tanstack/react-query";
import { GlowCardShop } from "./GlowCard";
import { useTranslation } from 'react-i18next';

import money from "@/assets/icons/tools/money.png"
import BuyTools from "./modal/BuyTools";
import InventoryItem from "./InventoryItem";
import CustomScrollbar from "./CustomScrollbar";
import Loader from "./ui/loader/loader";
import tools from "@/assets/icons/shop/tools.svg"

import "../index.css"
import { useAuthStore } from "@/store/useUserStore";

interface iAppProps {
    children?: React.ReactNode
    itemId: number
    itemPrice?: number
}
 
interface ShopProps {
    shopItems: ShopItem[]
}

const Shop = React.memo(({shopItems}: ShopProps) => {
    const { t } = useTranslation();
    const items = shopItems
    return (
        <GlowCardShop>
            <div className="w-full flex flex-col items-center gap-3">
                <span className="font-encode font-semibold text-[20px] text-[#E4F1FF]">
                    {t('shop.title')}
                </span>
                <CustomScrollbar>
                    <div className="grid gap-[14px] grid-cols-3 max-h-[380px] max-w-[320px] w-full m-auto justify-items-center">
                    {items ? (
                    <>
                    {items.map((item, index) => (
                        <ShopCard key={index} itemId={item.id} itemPrice={item.price}>
                            <InventoryItem item={item} textSize={8} />
                        </ShopCard>
                        ))}
                        <ToolCard />
                        {[...Array(5)].map((_, index) => (
                            <ShopCard key={`empty-${index}`} itemId={0} />          
                        ))}
                    </>
                    ) : null}
                    
                    </div>             
                </CustomScrollbar>
            </div>
        </GlowCardShop>
    )
})
 

export function ShopCard( { children, itemId, itemPrice } : iAppProps ) {
    const { t } = useTranslation();
    const buyItemMutation = useBuyItem();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const {inventory} = useAuthStore((state) => state.user) || [];

    const buyItem = async () => {
        if(itemId === 0) return;
        setIsLoading(true);
        if(inventory.leading !== 50){
            await buyItemMutation.mutateAsync(itemId,{
                onSuccess: (data) => {
                    if(data.data.code === 200){
                        queryClient.invalidateQueries({ queryKey: ['user'] });
                        toast.success(t('shop.buySuccess'));
                    } else {
                        toast.error(t('shop.limit'));
                    }
                    setIsLoading(false);
                },
                onError: () => {
                    setIsLoading(false);
                }
            });
        }
        setIsLoading(false);     
    }
    return (
        <div className="s:h-[120px] h-[110px] s:w-[92px] w-[82px] rounded-[10px] bg-[#222930] border border-[#AED2FF33] p-2 flex flex-col items-center s:gap-1 gap-1.5">
            <div className=" size-17 s:w-[74px] s:h-[76px] rounded-[8px] bg-[#434F64]">
                {children}
            </div>
            <button onClick={buyItem} className=" outline-none focus:outline-none w-[74px] h-6 bg-[#6DA0E133] border border-[#6DA0E1] rounded-[8px] flex items-center justify-center text-center">
                {isLoading && <Loader className="!text-[2px]"/>}
                {!isLoading && <div className="flex items-center justify-center pl-[5px]">
                <span className="font-doppio font-normal text-[14px] text-[#6DA0E1] pr-[2px]">
                    {itemId === 0 ? t('shop.buy') : itemPrice}      
                </span>
                {itemId !== 0 && <img src={money} alt="money" className="w-[13px] h-[13px]" />}
                </div>
                }              
            </button>
        </div>
    )
}

export function ToolCard( ) {
    // const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <div className="s:h-[120px] h-[110px] s:w-[92px] w-[82px] rounded-[10px] bg-[#222930] border border-[#AED2FF33] p-2 flex flex-col items-center s:gap-1 gap-1.5">
            <div className=" size-17 s:w-[74px] s:h-[76px] rounded-[8px] bg-[#434F64] flex flex-col items-center justify-center">
                <img src={tools} alt="tools" className="w-[44px]" />
                <span className="font-encode font-semibold text-[8px] text-[#E4F1FF] bg-[#12131880] py-[2px] px-[5px] rounded-[20px] mt-[4px]">one item</span>
            </div>
            <button 
            onClick={() => setOpen(true)} className=" outline-none focus:outline-none w-[74px] h-6 bg-[#6DA0E133] border border-[#6DA0E1] rounded-[8px] flex items-center justify-center">
                <div className="flex items-center justify-center pl-[5px]">
                <span className="font-doppio font-normal text-[14px] text-[#6DA0E1] h-[22px] pr-[2px]">
                    1
                </span>
                <img src={money} alt="money" className="w-[13px] h-[13px]" />
                </div>
            </button>
            <BuyTools open={open} setOpen={setOpen} />
        </div>
    )
}



export default Shop;