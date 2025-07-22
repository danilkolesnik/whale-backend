//@ts-nocheck
import { useState } from "react";
import { useFetchMarketBuyItemsQuery,useDeleteMarketBuyItem } from "@/queries/market";
import filter_icon from "../assets/icons/play-arrow-line.svg"
import { MarketCard } from "./MarketCard";
import PlaceBuyOrder from "./MarketOrderBuy";
import { useMarketBuyStore, type MarketBuyItem } from "@/store/useMarketStore";
import { useUpdateMarketBuyItem } from "@/queries/market";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useUserStore";
import { toast } from "sonner";
import EditObject from "./EditObject";
import { useTranslation } from 'react-i18next';
import SortSelect from "./MarketBuy/sortSelect";

export default function MarketBuy() {
  const { t } = useTranslation();
  const [openEdit, setOpenEdit] = useState(false);
  const [selectItem, setSelectItem] = useState<MarketBuyItem | null>(null);
  const [openSortLevel, setOpenSortLevel] = useState(false);
  const [openSortType, setOpenSortType] = useState(false);
  const [openSortPrice, setOpenSortPrice] = useState(false);

  const [sortLevel] = useState([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  const [sortType] = useState(['helmet', "armor","leg"]);
  const [selectSortType, setSelectSortType] = useState(null);
  const [selectSortLevel, setSelectSortLevel] = useState(null);

  const marketBuyItems = useMarketBuyStore((state) => state.marketBuyItems);
  const user = useAuthStore((state) => state.user);

  const queryClient = useQueryClient();
  const updateMarketBuyItem = useUpdateMarketBuyItem();
  const deleteMarketBuyItem = useDeleteMarketBuyItem();

  const handleUpdateMarketBuyItem = async () => {
    await updateMarketBuyItem.mutateAsync({
      id: selectItem?.id ?? 0,
      price: selectItem?.price ?? 0,
      level: selectItem?.level ?? 0
    });
    await queryClient.invalidateQueries({ queryKey: ['marketBuyItems'] });
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    setOpenEdit(false);
    setSelectItem(null);
    toast.success(t('market.orderUpdated'));
  }

   const handleDeleteMarketBuyItem = async () => {
    await deleteMarketBuyItem.mutateAsync({
      itemId: selectItem?.id ?? 0,
    });
    toast.success(t('market.itemDeleted'));
    setOpenEdit(false);
    setSelectItem(null);
    await queryClient.invalidateQueries({ queryKey: ['marketBuyItems'] });
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    setOpenSortLevel(false);
  }

  const sortedMarketBuyItems = [...marketBuyItems]
    .filter(item => {
      if (selectSortType && item.itemType !== selectSortType) return false;
      if (selectSortLevel && item.level !== selectSortLevel) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.buyerId === user?.telegramId) return -1;
      if (b.buyerId === user?.telegramId) return 1;
      return 0;
    });

  useFetchMarketBuyItemsQuery();

  console.log(selectItem);
  
  return (
    <div>
      <div className="relative w-full">
        <div className="absolute top-0 bottom-0 left-[18%] w-[1px] bg-[#2D3B51] pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-[#2D3B51] pointer-events-none" />
        <div className="absolute top-9 right-0 left-0 h-[1px] bg-[#2D3B51] pointer-events-none z-[100]" />

        <div className="py-[7px] relative grid grid-cols-[18%_52%_30%] text-[12px] text-[#E4F1FF] mb-3  bg-[#AED2FF1A] rounded-tl-[18px] rounded-tr-[18px] rounded-br-[3px] rounded-bl-[3px] ">
          <div 
            className="flex justify-center items-center gap-[2px] font-encode  font-medium  leading-4 text-[10px] relative z-[100]"
            onClick={() => {
              setOpenSortLevel(!openSortLevel);
              setOpenSortType(false);
              setOpenSortPrice(false);
            }}
          >
            <div className="flex items-center gap-1">
              <span>{t('market.level')}</span>
              <img src={filter_icon} alt="filter icon 1" className={`${openSortLevel ? 'rotate-180' : ''}`} />
            </div>
            <div className="top-0 right-0">
              <SortSelect sortBy={sortLevel} openSort={openSortLevel} setOpenSort={setOpenSortLevel} sortSelect={setSelectSortLevel} selectedItem={selectSortLevel} />
            </div>
          </div>
          <div 
            className="flex justify-center gap-[2px] font-encode  font-medium  leading-4 text-[10px] relative z-[100]"
            onClick={() => {
              setOpenSortType(!openSortType);
              setOpenSortLevel(false);
              setOpenSortPrice(false);
            }}
          >
            {t('market.typeOfArmour')}
            <img src={filter_icon} alt="filter icon 2" className={`${openSortType ? 'rotate-180' : ''}`}/>
            <SortSelect sortBy={sortType} openSort={openSortType} setOpenSort={setOpenSortType} sortSelect={setSelectSortType} selectedItem={selectSortType} />
          </div>
          <div 
            className="flex justify-center gap-[2px] font-encode  font-medium  leading-4 text-[10px] relative z-[100]"
            // onClick={() => {
            //   setOpenSortPrice(!openSortPrice);
            //   setOpenSortLevel(false);
            //   setOpenSortType(false);
            //   setSelectSortPrice(selectSortPrice === 'asc' ? 'desc' : 'asc');
            // }}
          >
            {t('market.purchase')}
            <img src={filter_icon} alt="filter icon 3" className={`${openSortPrice ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div className="flex flex-col gap-3 overflow-y-scroll max-h-[600px]">
          {sortedMarketBuyItems.map((item, i) => (
              <div onClick={() => setSelectItem(item)} key={i}>
                <MarketCard 
                  setOpenEdit={setOpenEdit} 
                  sellerId={item.buyerId ?? ''} 
                  id={item.id} 
                  level={item.level ?? 0} 
                  part={item.itemType ?? ''} 
                  type={item.itemType ?? ''} 
                  price={item.price ?? 0} 
                  coins={item.price ?? 0} 
                  shield={item.shield ?? 0}
                  buyerBalance={item.buyerBalance ?? {}}
                  action="buy"/>
              </div>
          ))}
        </div>
      </div>
      <div className="w-full px-[8px] mt-[18px]">
          <div className="py-[17px] px-[23px] w-full bg-[#222930] h-[105px] rounded-[15px] [filter:drop-shadow(0_0_3px_rgba(18,19,24,0.5))_drop-shadow(0_0_10px_rgba(18,19,24,0.5))_drop-shadow(0_0_20px_rgba(18,19,24,0.5))]">
              <PlaceBuyOrder />
            </div>
      </div> 
      <EditObject 
        disabled={false} 
        open={openEdit} 
        onOpenChange={setOpenEdit} 
        price={selectItem?.price ?? null} 
        level={selectItem?.level ?? null} 
        type={selectItem?.itemType ?? null}
        setLevel={(level) => setSelectItem((prev) => prev ? {...prev, level: level ?? prev.level} : null)}
        setPrice={(price) => setSelectItem((prev) => prev ? {...prev, price: price ?? prev.price} : null)}
        buyerBalance={selectItem?.buyerBalance ?? {}}
        handleUpdateMarketSellItem={handleUpdateMarketBuyItem}
        deleteItem={handleDeleteMarketBuyItem}
      />
    </div>
    
  );
}