//@ts-nocheck
import { MarketCard } from "./MarketCard";
import { useMarketBuyStore, type MarketSellItem } from "@/store/useMarketStore";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateMarketSellOrder, useUpdateMarketSellItem, useDeleteMarketSellItem } from "@/queries/market";
import { useFetchMarketSellItemsQuery } from "@/queries/market";
import { useAuthStore } from "@/store/useUserStore";
import { toast } from "sonner";
import EditObject from "./EditObject";
import PlaceSellOrder from "./MarketOrders";
import filter_icon from "../assets/icons/play-arrow-line.svg"
import { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import SortSelect from "./MarketBuy/sortSelect";

export default function MarketSell() {
  const { t } = useTranslation();
  const marketSellItems = useMarketBuyStore((state) => state.marketSellItems);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const createMarketSellOrder = useCreateMarketSellOrder();
  const updateMarketSellItem = useUpdateMarketSellItem();
  const deleteMarketSellItem = useDeleteMarketSellItem();

  const [openEdit, setOpenEdit] = useState(false);
  const [openSortLevel, setOpenSortLevel] = useState(false);
  const [openSortType, setOpenSortType] = useState(false);
  const [openSortPrice, setOpenSortPrice] = useState(false);
  const [openSortSeller, setOpenSortSeller] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usdtPrice, setUsdtPrice] = useState('');
  const [coinPrice, setCoinPrice] = useState('');
  const [price, setPrice] = useState();

  const [selectItem, setSelectItem] = useState<MarketSellItem | null>(null);
  const [sortLevel] = useState([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);
  const [sortType] = useState(['helmet', "armor","leg"]);
  const [selectSortType, setSelectSortType] = useState(null);
  const [selectSortLevel, setSelectSortLevel] = useState(null);

  const isSubmittingRef = useRef(false);
  const handleCreateMarketSellOrder = async(itemId:number, price:number) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsLoading(true)
    try {
      await createMarketSellOrder.mutateAsync({
        itemId: itemId,
        price: price,
      },{
        onSuccess: async(data) => {    
          if(data.data.success){
            await queryClient.invalidateQueries({ queryKey: ['user'] });
            await queryClient.invalidateQueries({ queryKey: ['marketSellItems'] });
            toast.success(t('marketOrderBuy.orderCreated'));
            setIsLoading(false);
            setSelectItem(null);
            setOpenSortSeller(false);
          }else{
            toast.success(t('marketOrderBuy.levelLimit'));
            setIsLoading(false);
            setSelectItem(null);
            setOpenSortSeller(false);
          }
        },
        onError: () => {
          setIsLoading(false);
        }
      });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleUpdateMarketSellItem = async () => {
    await updateMarketSellItem.mutate({ 
      itemId: selectItem?.id ?? 0, 
      price: selectItem?.price ?? 0, 
      level: selectItem?.item.level ?? 0 
    });
    await queryClient.invalidateQueries({ queryKey: ['marketSellItems'] });
    await queryClient.invalidateQueries({queryKey: ['user']});
    setOpenEdit(false);
    setOpenSortSeller(false);
    setSelectItem(null);
    toast.success(t('market.itemUpdated'));
  }

  const handleDeleteMarketSellItem = async () => {
    await deleteMarketSellItem.mutateAsync({
      itemId: selectItem?.id ?? 0,
    });
    toast.success(t('market.itemDeleted'));
    setOpenEdit(false);
    setSelectItem(null);
    await queryClient.invalidateQueries({ queryKey: ['marketSellItems'] });
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    setOpenSortSeller(false);
  }

  const sortedMarketSellItems = [...marketSellItems]
    .filter(item => {
      if (selectSortType && item.item.type !== selectSortType) return false;
      if (selectSortLevel && item.item.level !== selectSortLevel) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.sellerId === user?.telegramId) return -1;
      if (b.sellerId === user?.telegramId) return 1;
      return 0;
  });

  useFetchMarketSellItemsQuery();

  return (
    <div>
      <div className="relative w-full">
        <div className="absolute top-0 bottom-0 left-[18%] w-[1px] bg-[#2D3B51] pointer-events-none" />
        <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-[#2D3B51] pointer-events-none" />
        <div className="absolute top-9 right-0 left-0 h-[1px] bg-[#2D3B51] pointer-events-none" />

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
          {sortedMarketSellItems.map((item, i) => (
              <div onClick={() => setSelectItem(item)} key={i}> 
                <MarketCard setOpenEdit={setOpenEdit} setSelectItem={setSelectItem} name={item.item.name} sellerId={item.sellerId} id={item.id} level={item.item.level} part={item.item.type} type={item.item.name} price={item.price} coins={item.price} key={i} action="sell"/>
              </div>
          ))}
        </div>
      </div>
      <div className="w-full px-[8px] mt-[18px]">
          <div className="py-[17px] px-[23px] w-full bg-[#222930] h-[105px] rounded-[15px] [filter:drop-shadow(0_0_3px_rgba(18,19,24,0.5))_drop-shadow(0_0_10px_rgba(18,19,24,0.5))_drop-shadow(0_0_20px_rgba(18,19,24,0.5))]">
              <PlaceSellOrder 
              usdtPrice={usdtPrice}
              coinPrice={coinPrice}
              price={price}
              setUsdtPrice={setUsdtPrice}
              setCoinPrice={setCoinPrice}
              setIsLoading={setIsLoading}
              setPrice={setPrice} 
              isLoading={isLoading} 
              handleCreateMarketSellOrder={handleCreateMarketSellOrder} 
              openSortSeller={openSortSeller} 
              setOpenSortSeller={setOpenSortSeller}
              />
          </div>
      </div> 
      <EditObject 
        open={openEdit} 
        disabled={true}
        onOpenChange={setOpenEdit}
        price={selectItem?.price ?? 0} 
        level={selectItem?.item.level ?? 0}
        name={selectItem?.item.name ?? ''}
        shield={selectItem?.item.shield ?? 0}
        type={selectItem?.item.type ?? null}
        setLevel={(level) => setSelectItem((prev) => prev ? {...prev, item: {...prev.item, level: level ?? prev.item.level}} : null)}
        setPrice={(price) => setSelectItem((prev) => prev ? {...prev, price: price ?? prev.price} : null)}
        handleUpdateMarketSellItem={handleUpdateMarketSellItem}
        deleteItem={handleDeleteMarketSellItem}
      />
    </div>
    
  );
}