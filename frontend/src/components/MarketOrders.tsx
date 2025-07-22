//@ts-nocheck
import { useState,useRef } from "react";
import { DialogHeader, Dialog, DialogTrigger, DialogContent, DialogTitle } from "./ui/dialog";
import { useAuthStore, type Item } from "@/store/useUserStore";
import { useMarketBuyStore } from "@/store/useMarketStore";
import { useFetchMarketSellItemsQuery } from "@/queries/market";
import { useFetchUser } from "@/queries/user";
import { useTranslation } from 'react-i18next';
import { USER_ACCESS } from "@/constants";
import Loader from "@/components/ui/loader/loader";
import InventoryItem from "./InventoryItem";
import Inputs from "./MarketHelpers";

interface PlaceSellOrderProps {
    handleCreateMarketSellOrder: (itemId: number, price: number) => void;
    openSortSeller?: boolean;
    setOpenSortSeller?: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading?: boolean;
}

export default function PlaceSellOrder({
    handleCreateMarketSellOrder, 
    openSortSeller, 
    setOpenSortSeller,
    isLoading,
    usdtPrice,
    coinPrice,
    price,
    setUsdtPrice,
    setCoinPrice,
    setPrice
}: PlaceSellOrderProps){
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const {inventory, telegramId} = useAuthStore((state) => state.user);
    const marketSellItems = useMarketBuyStore((state) => state.marketSellItems);
    const { t } = useTranslation();
    const isSubmittingButton = useRef(false);

    const userAccess = USER_ACCESS.includes(Number(telegramId));

    const filteredInventory = inventory?.filter(item => !marketSellItems.some(sellItem => sellItem.item.id === item.id));
    const filledInventory = filteredInventory ? filteredInventory.concat(Array.from({ length: 15 - filteredInventory.length }, () => null)) : Array.from({ length: 15 }, () => null);
    
    useFetchUser();
    useFetchMarketSellItemsQuery();

    // Синхронизация значений
    const handleUsdtChange = (value: string) => {
        setUsdtPrice(value);
        setPrice(value)
        setCoinPrice(value ? String(Number(value) * 100) : '');
        setPrice(Number(value));
    };
    const handleCoinChange = (value: string) => {
        setCoinPrice(value);
        setPrice(value)
        setUsdtPrice(value ? String(Math.floor(Number(value) / 100)) : '');
        setPrice(value ? Math.floor(Number(value) / 100) : 0);
    };
    return (
        <Dialog open={openSortSeller} onOpenChange={setOpenSortSeller}>
                <DialogTrigger asChild>
                    <button disabled={!userAccess} className={`${!userAccess ? "opacity-50" : "opacity-80"} flex flex-col items-center justify-center rounded-[10px] h-[70px] w-full [background:linear-gradient(180deg,rgba(18,19,24,0.2)_0%,rgba(18,19,24,0.8)_100%)] [filter:drop-shadow(0_0_3px_rgba(18,19,24,0.5))_drop-shadow(0_0_10px_rgba(18,19,24,0.5))_drop-shadow(0_0_20px_rgba(18,19,24,0.5))] shadow-[0_0_2px_0_#AED2FF80,0_0_6px_0_#AED2FF66,0_0_14px_0_#AED2FF66]  outline-none focus:outline-none`}>
                        <p className="text-[#E4F1FF] font-encode text-[18px] font-semibold leading-5 [text-shadow:0_0_2px_#AED2FF,0_0_8px_rgba(174,210,255,0.7),0_0_24px_rgba(174,210,255,0.7),0_0_40px_rgba(174,210,255,0.7)]">
                        {t('marketOrderBuy.placeOrder')}
                        </p>
                        <p className="font-encode font-normal leading-5 text-[10px] text-[#AED2FF]">{t('marketOrderBuy.createOrder')}</p>
                    </button>
                </DialogTrigger>
        <DialogContent className="z-[100] rounded-[20px] bg-gradient-to-b from-[#121318] to-[#212C3D] shadow-[inset_0.25px_0.5px_2px_rgba(174,210,255,0.8),inset_-0.25px_-0.5px_2px_rgba(174,210,255,0.2)] backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                <DialogHeader>
                    <DialogTitle className="font-encode font-semibold text-[16px] text-[#FFFFFF] mt-5 mb-2">{t('marketOrderBuy.placeOrder')}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full items-center">
                    <div className="flex flex-col items-center bg-[#171920] border border-[#AED2FF4D]/30 rounded-[14px] h-[123px] px-[10px] max-w-[280px]">
                        <p className="w-full text-center font-encode text-[10px] text-normal text-[#ffffff] py-2">
                            {t('marketOrderBuy.selectItem')}
                        </p>
                        <div className="flex h-[77px] w-full">
                            <div className="grid grid-cols-6 gap-[5px] custom-scrollbar overflow-y-auto overflow-x-hidden pr-2">
                                {filledInventory.map((item, i) => (
                                    <div
                                        key={i}
                                        className={`w-9 h-9 rounded-md cursor-pointer transition-colors bg-[#1C1F26] ${item && selectedItem?.id === item.id ? 'bg-[#AED2FF]' : ''}`}
                                        onClick={() => item ? setSelectedItem(item) : null}
                                    >
                                        {item && <InventoryItem textSize={6} item={item} selectedItem={selectedItem?.id} type="sell"/>} 
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Inputs 
                        setPrice={handleUsdtChange} 
                        price={usdtPrice} 
                        action="sell" 
                        ref={formRef} 
                        item={selectedItem ?? undefined}
                        usdtPrice={usdtPrice}
                        coinPrice={coinPrice}
                        setUsdtPrice={handleUsdtChange}
                        setCoinPrice={handleCoinChange}
                    />
                    <p className="w-full text-[#AED2FF]/80 text-center text-[12px] font-encode font-normal">
                        {t('marketOrderBuy.placeOrderConfirm')}
                    </p>
                    <div className="flex items-center justify-center w-full">
                        <button
                            disabled={isLoading || !openSortSeller}
                            className={`${(isLoading || !openSortSeller) ? 'opacity-50 pointer-events-none' : ''} focus:outline-none focus:ring-0 flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full  max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2 h-[46px]`}
                            onClick={() => {
                                if (isLoading || isSubmittingButton.current) return;
                                isSubmittingButton.current = true;
                                handleCreateMarketSellOrder(selectedItem?.id ?? 0, price ?? 0)
                                  .finally(() => {
                                    isSubmittingButton.current = false;
                                  });
                            }}
                        >
                            {isLoading && <Loader />}
                            {!isLoading && 
                             <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">{t('marketOrderBuy.placeOrder')}</span>
                            }           
                        </button>
                    </div>
                    
                </div>
                </DialogContent>
            </Dialog>
    )
}

