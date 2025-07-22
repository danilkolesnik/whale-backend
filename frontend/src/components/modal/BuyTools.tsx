//@ts-nocheck
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import { useBuyTools } from "@/queries/user";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../../components/ui/loader/loader";
import money from "@/assets/icons/tools/money.png"
import equals from "@/assets/icons/tools/equals.svg"
import bg from "@/assets/bg/tools/bg.png"
import bg2 from "@/assets/bg/tools/bg2.png"
import plus from "@/assets/icons/tools/plus.svg"
import minus from "@/assets/icons/tools/minus.svg"
import toolsBig from "@/assets/icons/shop/toolsBig.svg"
interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function BuyTools({ open, setOpen }: Props) {
    const { t } = useTranslation();

    const [quantity, setQuantity] = useState("1");  
    const [convertedQuantity, setConvertedQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const buyToolsMutation = useBuyTools();

    useEffect(() => {
        setConvertedQuantity(Number(quantity) * 1);
    }, [quantity]);

    const handleQuantity = (type: string) => {
        if(type === "plus") {
            setQuantity(Number(quantity) + 1);
        } else {
            if(Number(quantity) > 1) {
                setQuantity(Number(quantity) - 1);
            }
        }
    }

    const handleBuyTools = async () => {
        setIsLoading(true);
        await buyToolsMutation.mutateAsync({toolQuantity: Number(quantity)},{
            onSuccess: (data) => {
                if(data.data.code === 200){
                    queryClient.invalidateQueries({queryKey: ['user']});
                    toast.success(t('shop.buySuccess'));
                    setOpen(false);
                } else {
                    toast.error(t('shop.buyFailed'));
                }
                setIsLoading(false);
            }
        });
        setIsLoading(false);
    }
 
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="z-[100] rounded-[20px] bg-[#4D5971]/20 [backdrop-filter:blur(30px)] [box-shadow:0_1px_5px_0_rgba(18,19,24,0.7),0_1px_15px_0_rgba(18,19,24,0.7),0_1px_40px_0_rgba(18,19,24,0.7),inset_0_1px_4px_0_rgba(174,210,255,0.3),inset_0_0_10px_0_rgba(174,210,255,0.3)] backdrop-blur-[20px] max-h-[590px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                        <div className="w-full flex items-center justify-center mt-[10px] mb-[14px]">
                            <p className="text-center font-encode font-semibold text-[18px] text-[#E4F1FF] w-[165px]">
                            {t('buyTools.title')}
                            </p>
                        </div>
                        <div className="w-full flex flex-col items-center justify-center p-3 pt-[0px] max-w-[294px] rounded-[20px]">
                            <div className="bg-gradient-to-b from-[#263246] to-[#5D7BAC] flex justify-center flex-col  w-full rounded-[20px] relative p-2 text-center">
                                <span className="font-encode font-semibold text-[12px] text-[#E4F1FF]">Armor upgrade tool</span>
                                <img src={toolsBig} alt="item" className="w-[120px] object-cover m-auto" />
                            </div>
                            <div className="w-full relative bg-[#12131866] h-full w-full text-center pt-[11px] mt-[14px] rounded-[8px]">
                                <span className="font-encode font-semibold text-[10px] text-[#E4F1FF] text-center">{t('buyTools.quantitySelection')}</span>
                            <div className="flex flex-col justify-center items-center rounded-[40px] my-[15px] mx-[15px] relative" 
                            style={
                                {
                                    backgroundImage: `url(${bg})`,
                                    backgroundSize: '100% auto',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundBlendMode: 'overlay',
                                }
                            }
                            > 
                             <span className="font-encode font-semibold text-[8px] text-[#E4F1FF99] absolute top-[-5px] left-[22px] z-[10]">{t('buyTools.enterDesiredQuantity')}</span>

                              <div className="flex flex-row justify-center items-center gap-[10px] bg-[#23314A] rounded-[40px] py-[4px] my-[12px] w-[85%]">
                              <button onClick={() => handleQuantity("minus")} className=" outline-none focus:outline-none flex items-center justify-center">
                                <img src={minus} alt="minus" className="w-[16px] h-[16px]" />
                               </button>

                               <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "") {
                                        setQuantity(value);
                                        } else {
                                        const numberValue = Number(value);
                                        if (numberValue >= 1) {
                                            setQuantity(numberValue);
                                        }
                                        }
                                    }}
                                    min="1"
                                    className="font-encode font-semibold text-[8px] text-[#E4F1FF] bg-[#6DA0E133] py-[4px] rounded-[10px] max-w-[37px] text-center"
                                />

                               <button onClick={() => handleQuantity("plus")} className=" outline-none focus:outline-none flex items-center justify-center">
                                <img src={plus} alt="minus" className="w-[16px] h-[16px]" />
                               </button>
                              </div>
                            </div>

                            <div className="flex flex-col justify-center items-center rounded-[40px] my-[15px] mx-[15px] relative" 
                            style={
                                {
                                    backgroundImage: `url(${bg2})`,
                                    backgroundSize: '100% auto',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundBlendMode: 'overlay',
                                }
                            }
                            > 
                             <span className="font-encode font-semibold text-[8px] text-[#E4F1FF99] absolute top-[-5px] left-[22px] z-[10]">{t('buyTools.finalPrice')}</span>

                              <div className="flex flex-row justify-center items-center gap-[10px] bg-[#23314A] rounded-[40px] py-[4px] my-[12px] w-[85%]">
                                <div className="font-encode font-semibold text-[8px] text-[#E4F1FF] flex items-center gap-[3px] bg-[#6DA0E133] py-[2px] px-[14px] rounded-[20px]">
                                    <span >
                                        {quantity}
                                    </span>
                                    <span>
                                        {t('buyTools.items')}
                                    </span>
                                </div>

                                <img src={equals} alt="equals" className="w-[14px] h-[14px]" />

                                <div className="font-encode font-semibold text-[8px] text-[#E4F1FF] flex items-center gap-[3px] bg-[#6DA0E133] py-[2px] px-[14px] rounded-[20px]" >
                                    <span>
                                        {convertedQuantity.toFixed(2)}
                                    </span>
                                    <span>
                                        <img src={money} alt="usdt" className="w-[12px] object-cover" />
                                    </span>
                                </div>
                              </div>
                            </div>
                            </div>
                            <div className="py-1.5 w-full rounded-[30px] h-full bg-[#6DA0E133] w-full mt-3">
                                <p className="text-[#E4F1FF] text-center font-medium font-encode text-[10px] w-[220px] m-auto">
                                    {t('buyTools.quantitySelectionPlaceholder')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-full mt-[12px] mb-[12px]">
                            <button 
                                onClick={handleBuyTools} 
                                disabled={isLoading}
                                className={` ${isLoading ? 'opacity-50' : ''} focus:outline-none focus:ring-0 flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full  max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2 h-[46px]`}
                            >
                                {isLoading && <Loader/>}
                                {!isLoading && <span className="font-encode font-semibold text-[20px] text-[#E4F1FF]">{t('buyTools.buy')}</span>}
                            </button>
                        </div>             
                </DialogContent>
    </Dialog>
  )
}
