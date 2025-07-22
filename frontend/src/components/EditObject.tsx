//@ts-nocheck
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useFetchMarketBuyItemsQuery, useFetchMarketSellItemsQuery } from "@/queries/market";
import { useTranslation } from "react-i18next";
import CustomSelect from "./CustomSelect";
import edit_icon from "../assets/icons/edit_obj.svg"
import deleteIcon from "../assets/icons/edit/delete_icon.png"
import armorImg from "@/assets/items/armor_main_big.png";
import helmetImg from "@/assets/items/helmet_big.png";
import legImg from "@/assets/items/legs_big.png";
import { useEffect, useState } from "react";
interface EditObjectProps {
  
  open: boolean;
  onOpenChange: (open: boolean) => void;
  price: number | null;
  level?: number | null;
  name?: string | null;
  shield?: number | null;
  disabled?: boolean;
  setLevel: (level: number | null) => void;
  setPrice: (price: number | null) => void;
  handleUpdateMarketSellItem: () => void;
  deleteItem: () => void;
  type: string | null;
  buyerBalance?: {
    money: number;
    usdt: number;
  } | null;
}

interface InputsProps {
  level: number | null;
  price: number | null;
  name?: string | null;
  shield?: number | null;
  disabled?: boolean;
  setLevel: (level: number | null) => void;
  setPrice: (price: number | null) => void;
  image: string;
}

export default function EditObject({
    open, 
    onOpenChange, 
    price, 
    level, 
    name, 
    shield,
    setLevel, 
    setPrice, 
    handleUpdateMarketSellItem, 
    disabled, 
    deleteItem,
    type,
    buyerBalance
}: EditObjectProps) {
    const { t } = useTranslation();
    const [image, setImage] = useState<string>(armorImg);
    const getImage = () => {
        switch(type?.toLowerCase() ?? 'armor'){
            case 'helmet':
                return helmetImg;
            case 'armor':
                return armorImg;
            case 'leg':
                return legImg;
        }
    }

    useFetchMarketSellItemsQuery();
    useFetchMarketBuyItemsQuery();

    useEffect(() => {
        setImage(getImage());
    }, [type]);
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <DialogTitle className="font-encode font-semibold text-[16px] text-[#FFFFFF] mt-5 mb-2">{t('editObject.editTitle')}</DialogTitle>
                    </DialogHeader>
                        <div className="flex flex-col gap-4 w-full items-center">
                            <Inputs image={image} shield={shield} disabled={disabled} level={level ?? 0} setLevel={setLevel} price={price ?? 0} setPrice={setPrice} name={name} type={type}/>
                            
                            <div className="bg-[#121318] border border-[#AED2FF4D] rounded-xl py-[19px] px-[12px] w-full">
                            <div className="flex items-center justify-between gap-2 w-full">
                                <div className="flex flex-col gap-1">
                                    <span className="font-encode font-medium text-[12px] text-[#FFFFFF]">{t('editObject.deleteObject')}</span>
                                    <span className="font-encode font-regular text-[8px] text-[#AED2FF]">{t('editObject.deleteObjectDescription')}</span>
                                </div>
                                <button onClick={() => deleteItem()} className="flex items-center justify-center gap-2 bg-[#30353E] border-[#AED2FF99] border rounded-[20px] py-[9px] px-[12px]">
                                    <span className="font-encode font-normal text-[12px] text-[#AED2FF]">{t('editObject.deleteObject')}</span>
                                    <img src={deleteIcon} alt="delete" className="w-[15px] h-[15px]"/>
                                </button>
                            </div>
                            <div className="font-encode font-regular bg-[#222930] rounded-[20px] py-[4px] px-[10px] text-[8px] text-[#DD173E] text-center w-full mt-[14px]">
                                {t('editObject.deleteWarning')}
                            </div>
                            </div>
                            <div className="flex items-center justify-center w-full">
                                <button 
                                onClick={() => handleUpdateMarketSellItem()}
                                className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2  outline-none focus:outline-none">       
                                    <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">{t('editObject.saveChanges')}</span>
                                </button>
                            </div>
                            
                        </div>
                    </DialogContent>
        </Dialog>
    )
}


export function Inputs({
    level, 
    setLevel, 
    price, 
    setPrice, 
    disabled,
    name,
    shield,
    image,
    type
}: InputsProps) {
    const { t } = useTranslation();

    // Coins = price * 100
    const [coinsPrice, setCoinsPrice] = useState<number | ''>(price ? price * 100 : '');

    // Обновляем coinsPrice, если внешний price меняется
    useEffect(() => {
        if (price === '') {
            setCoinsPrice('');
        } else {
            setCoinsPrice(price * 100);
        }
    }, [price]);

    // Обработка изменения coins input
    const handleCoinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setCoinsPrice('');
            setPrice('');
        } else {
            const numeric = Number(val);
            setCoinsPrice(numeric);
            setPrice(numeric / 100); // обновляем USDT
        }
    };

    // Обработка изменения USDT input
    const handleUsdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setPrice('');
        } else {
            setPrice(Number(val));
        }
    };

    return (
        <div className="bg-[#121318] text-white p-3 rounded-xl shadow-md max-w-[280px] w-full max-h-[147px] h-full border border-[#AED2FF4D]/50">
            <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                    <div className="relative w-[90px] h-[90px] rounded-[10px] bg-gradient-to-b from-[#6DA0E100]/90 to-[#AED2FF]/70 bg-opacity-30 flex text-white text-lg font-semibold">
                        <div className="flex justify-between w-full items-end pb-[6px] px-[6px]">
                            <div className="font-doppio font-normal text-[8px] h-3 rounded-[4px] flex justify-between w-full items-center z-[10]">
                                <span className="flex items-center bg-[#AED2FF80]/50 text-[#AED2FFCC] p-[2px] rounded-[4px]">
                                    Lv {level}
                                </span>
                                <span className="bg-[#121318CC] flex items-center text-[#AED2FFCC] rounded-[4px] p-[2px]">
                                    {shield || 0}
                                </span>
                            </div>
                            <img src={image} alt="armor" className="absolute top-[6px] object-cover w-[80px]" />
                        </div>
                        <div className="font-encode text-center font-medium text-[14px] text-[#E4F1FF] absolute top-[6px] w-full items-center z-[10]">
                            <span>{t(`${type}`)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`custom-box ${!disabled ? 'checked' : ''}`}>
                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="4 12 9 17 20 6" />
                            </svg>
                        </span>
                        <CustomSelect value={level} onChange={setLevel} disabled={disabled} />
                    </div>
                </div>

                <div className="flex flex-col flex-1 pl-3">
                    <form className="h-full space-y-2">
                        <input
                            type="text"
                            placeholder={name ?? "The name of the selected item"}
                            disabled
                            className="bg-[#21262F] outline-0 text-[9px] h-7 font-encode font-normal text-[#E4F1FF]/90 pl-2 max-w-[155px] py-1 rounded-[5px] w-full"
                        />
                        
                        {/* USDT input */}
                        <div className="flex flex-col gap-0">
                            <label htmlFor="UsdtPrice" className="font-encode text-[9px] pl-[2px] text-white font-normal tracking-wide">
                                {t('market.priceInUsdt')}
                            </label>
                            <div className="flex w-full bg-[#21262F] items-center justify-between rounded-[5px]">
                                <input
                                    id="UsdtPrice"
                                    type="number"
                                    value={price === '' ? '' : price}
                                    onChange={handleUsdtChange}
                                    className="text-[9px] h-6 font-encode font-normal text-[#E4F1FF]/90 pl-2 py-1 outline-0 w-full max-w-[155px]"
                                    maxLength={7}
                                />
                                <img src={edit_icon} alt="edit" className="size-4 mr-1"/>
                            </div>
                        </div>

                        {/* Coins input */}
                        <div className="flex flex-col gap-0">
                            <label htmlFor="CoinsPrice" className="font-encode text-[9px] pl-[2px] text-white font-normal tracking-wide">
                                {t('market.priceInCoins')}
                            </label>
                            <div className="flex w-full bg-[#21262F] items-center justify-between rounded-[5px]">
                                <input
                                    id="CoinsPrice"
                                    type="number"
                                    value={coinsPrice === '' ? '' : coinsPrice}
                                    onChange={handleCoinsChange}
                                    className="text-[9px] h-6 font-encode font-normal text-[#E4F1FF]/90 pl-2 py-1 outline-0 w-full max-w-[155px]"
                                    maxLength={7}
                                />
                                <img src={edit_icon} alt="edit" className="size-4 mr-1"/>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}