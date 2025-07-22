//@ts-nocheck
import { useRef, useState } from "react";
import Inputs from "./MarketHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useCreateMarketBuyOrder } from "@/queries/market";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useFetchMarketBuyItemsQuery } from "@/queries/market";
import { useAuthStore} from "@/store/useUserStore";
import helmetImg from "@/assets/items/helmet_big.png";
import armorImg from "@/assets/items/armor_main_big.png";
import legImg from "@/assets/items/legs_big.png";
import Loader from "@/components/ui/loader/loader";
import { useTranslation } from 'react-i18next';
import { USER_ACCESS } from "@/constants";

interface EquipmentItem {
  label: string;
  level: string;
  durability: string;
  image: string;
}

interface EquipmentBlocksProps {
  setSelectType: (type: string) => void;
  selectType: string;
}

const items: EquipmentItem[] = [
  { label: "Helmet", level: "Lv 12", image: helmetImg, durability: "100/100" },
  { label: "Armor", level: "Lv 18", image: armorImg, durability: "85/100" },
  { label: "Leg", level: "Lv 19", image: legImg, durability: "95/100" },
];

export default function PlaceBuyOrder(){
  const queryClient = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectType, setSelectType] = useState<string>();
  const [usdtPrice, setUsdtPrice] = useState('');
  const [coinPrice, setCoinPrice] = useState('');
  const [price, setPrice] = useState();
  const [level, setLevel] = useState<number>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [error, setError] = useState<boolean>(false);

  const createMarketBuyOrder = useCreateMarketBuyOrder();
  const { telegramId} = useAuthStore((state) => state.user);
  const { t } = useTranslation();

  const userAccess = USER_ACCESS.includes(Number(telegramId));

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

  const handleCreateMarketBuyOrder = async () => {
    if (!price || !level || price <= 0 || level <= 0) {
      toast.error(t('marketOrderBuy.errorPriceLevel'));
      return;
    }

    setIsLoading(true)

    await createMarketBuyOrder.mutate({
      itemType: selectType ?? '',
      price,
      level,
    },{
      onSuccess: (data) => {
        if(data.data.success){
          toast.success(t('marketOrderBuy.orderCreated'));
          queryClient.invalidateQueries({ queryKey: ['marketBuyItems'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
          setSelectType('');
          setPrice(0);
          setLevel(0);
          setError(false);
          setIsOpen(false);
          setIsLoading(false)
          setUsdtPrice('')
          setCoinPrice('')
        }else{
          // toast.error(`${data.data.error}`);
          setError(true);
          setIsOpen(true);
          setIsLoading(false)
        }
      }
    });
  }

  useFetchMarketBuyItemsQuery();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button disabled={!userAccess} onClick={() => setIsOpen(true)} className={`${!userAccess ? "opacity-50" : "opacity-80"} flex flex-col items-center justify-center rounded-[10px] h-[70px] w-full [background:linear-gradient(180deg,rgba(18,19,24,0.2)_0%,rgba(18,19,24,0.8)_100%)] [filter:drop-shadow(0_0_3px_rgba(18,19,24,0.5))_drop-shadow(0_0_10px_rgba(18,19,24,0.5))_drop-shadow(0_0_20px_rgba(18,19,24,0.5))] shadow-[0_0_2px_0_#AED2FF80,0_0_6px_0_#AED2FF66,0_0_14px_0_#AED2FF66]  outline-none focus:outline-none`}>
          <p className="text-[#E4F1FF] font-encode text-[18px] font-semibold leading-5 [text-shadow:0_0_2px_#AED2FF,0_0_8px_rgba(174,210,255,0.7),0_0_24px_rgba(174,210,255,0.7),0_0_40px_rgba(174,210,255,0.7)]">
            {t('marketOrderBuy.placeOrder')}
          </p>
          <p className="font-encode font-normal leading-5 text-[10px] text-[#AED2FF]">
            {t('marketOrderBuy.createOrder')}
          </p>
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
          <DialogTitle className="font-encode font-semibold text-[16px] text-[#FFFFFF] mt-5 mb-2">{t('marketOrderBuy.createOrder')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 w-full items-center">
          <div className="flex flex-col items-center max-w-[280px] px-0.5">
            <p className="w-full text-center font-encode text-[10px] text-normal text-[#ffffff] py-2">
              {t('marketOrderBuy.selectItem')}
            </p>
            <EquipmentBlocks setSelectType={setSelectType} selectType={selectType ?? ''}/>
          </div>
          <Inputs 
          action="buy" 
          ref={formRef} 
          setPrice={handleUsdtChange} 
          price={price ?? 0} 
          usdtPrice={usdtPrice}
          coinPrice={coinPrice}
          setLevel={setLevel} 
          level={level ?? 0} 
          selectType={selectType ?? ''}
          setUsdtPrice={handleUsdtChange}
          setCoinPrice={handleCoinChange}
          
          />
          <p className="w-full text-[#AED2FF]/80 text-center text-[12px] font-encode font-normal">
            {t('marketOrderBuy.placeOrderConfirm')}
          </p>
          {error && (
            <span className="text-red-500 text-center text-[12px] font-encode font-normal bg-[#6DA0E120] rounded-[10px] py-[4px] w-full">
              {t('marketOrderBuy.insufficientFunds')}
            </span>
          )}
          <div className="flex items-center justify-center w-full">
            <button disabled={isLoading} onClick={handleCreateMarketBuyOrder} className={`${isLoading ? 'opacity-50' : ''} focus:outline-none focus:ring-0 flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full  max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2 h-[46px]`}>
            {isLoading && <Loader />}
            {!isLoading && 
              <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                {t('marketOrderBuy.placeOrder')}
              </span>
            }          
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const EquipmentBlocks: React.FC<EquipmentBlocksProps> = ({setSelectType, selectType}) => {
  return (
    <div className="flex gap-2 w-full">
      {items.map((item, index) => (
        <div
          key={index}
          className={` relative w-[86px] h-[86px] rounded-[10px] bg-gradient-to-b from-[#6DA0E100]/90 to-[#AED2FF]/80 bg-opacity-30 flex text-white text-lg font-semibold p-1 ${selectType === item.label.toLowerCase() ? 'bg-[#6DA0E166]/70' : ''}`}
          onClick={() => setSelectType(item.label.toLowerCase())}
        >
         <div className="flex justify-between items-center flex-col w-full items-center pt-[5px]">
            <img src={item.image} alt={item.label} className="w-[70px] object-cover translate-y-[-5px]"/>
         </div>
          
          <div className="font-encode text-center font-medium text-[12px] text-[#E4F1FF] absolute bottom-1 w-[80px]">
            <span className="">
                {item.label}
            </span>     
          </div>
        </div>
      ))}
    </div>
  );
};
