
import { DollarIcon, WhiteDarker } from "@/assets/icons/icons"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from './ui/dialog'
import { useState } from "react";
import { useCoinsConversion, useUsdtConversion } from "@/queries/user";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import Arrow from '@/assets/icons/arrow_right.svg'

interface iAppProps {
    children: React.ReactNode
}

export function UsdtToCoins({children}: iAppProps) {
    const [value, setValue] = useState<string>('');
    const [valueCoins, setValueCoins] = useState<number>()
    const [usdtValue, setUsdtValue] = useState<string>('');
    const [usdtConvertValue, setUsdtConvertValue] = useState<number>();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const coinsConversion = useCoinsConversion();
    const usdtConversion = useUsdtConversion();

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        
        if (/^\d*$/.test(newValue)) {
            setValue(newValue);
            setValueCoins(Number(newValue) / 100)
        }
    };

    const handleChangeUsdt = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (/^\d*$/.test(newValue)) {
            setUsdtValue(newValue);
            setUsdtConvertValue(Number(newValue) * 100)
        }
    };

    const handlePurchase = () => {
        coinsConversion.mutate({coinsQuantity: Number(valueCoins)},{
            onSuccess: (data) => {
                console.log(data);
                if(data.data.code === 200){
                    toast.success(t('whaleComponent.purchaseSuccess'));
                    queryClient.invalidateQueries({ queryKey: ['user'] });
                    setIsOpen(false);
                    return;
                }
                setError(true);
            }
        });
    }

    const handlePurchaseUsdt = () => {
        usdtConversion.mutate({usdtQuantity: Number(usdtConvertValue)},{
            onSuccess: (data) => {
                console.log(data);
                if(data.data.code === 200){
                    toast.success(t('whaleComponent.purchaseSuccess'));
                    queryClient.invalidateQueries({ queryKey: ['user'] });
                    setIsOpen(false);
                    return;
                }
                setError(true);
            }
        });
    }

    const handlePurchaseButtonClick = () => {
        if (value) {
            console.log('value');
            handlePurchase();
        } else if (usdtValue) {
            console.log('usdtValue');
            handlePurchaseUsdt();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
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
                </DialogHeader>
                <div className="w-full flex items-center justify-center mt-5 mb-5">
                    <p className="text-center font-encode font-semibold text-[18px] text-[#E4F1FF] w-[138px]">
                        {t('whaleComponent.coinPurchase')}
                    </p>
                </div>
                <div className='flex flex-col gap-[14px] w-full items-center'>
                    <div className='w-full bg-[#30353E] max-w-[270px] rounded-[10px] py-[13px] flex flex-col items-center'>
                        <p className='text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center'>
                            {t('whaleComponent.currentCoinExchangeRate')}
                        </p>
                        <div className='bg-[#242629] max-w-[114px] h-[38px] w-full rounded-[10px] flex items-center justify-center [box-shadow:0_0_3px_0_rgba(174,210,255,0.5),0_0_10px_0_rgba(174,210,255,0.4)]'>
                            <div className="flex gap-0.5 font-encode font-normal text-[16px] text-[#FFFFFF] items-center">
                                <span>100</span>
                                <WhiteDarker />
                                =
                                <span>1$</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-[#30353E] max-w-[270px] rounded-[10px] py-[13px] flex flex-col items-center gap-1">
                        <p className="text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center">
                            {t('whaleComponent.convertValueAtCurrentRate')}
                        </p>
                        <div className={`flex items-center gap-0.5 w-full justify-center ${usdtValue ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex items-center gap-1">
                                <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                    <input inputMode="numeric" pattern="[0-9]*" value={value} disabled={!!usdtValue} onChange={handleChange} className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                    <div className="absolute z-50 right-1 bottom-2">
                                      
                                        <WhiteDarker />
                                    </div>
                                </div>
                                <img src={Arrow} alt="Arrow Icon" />
                                <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative">
                                    <input inputMode="numeric" pattern="[0-9]*" value={valueCoins} disabled={!!usdtValue} onChange={handleChange} className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                    <div className="absolute z-50 right-1 bottom-2">
                                    <DollarIcon />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-[#30353E] max-w-[270px]  rounded-[10px] py-[13px] flex flex-col items-center gap-1">
                        <p className="text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center">
                            {t('whaleComponent.convertValueAtCurrentRate')}
                        </p>
                        <div className={`flex items-center gap-0.5 w-full justify-center ${value ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex items-center gap-1">
                                <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                    <input inputMode="numeric" pattern="[0-9]*" value={usdtValue} disabled={!!value} onChange={handleChangeUsdt} className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                    <div className="absolute z-50 right-1 bottom-2">
                                    <DollarIcon />
                                    </div>                 
                                </div>
                                <img src={Arrow} alt="Arrow Icon" />
                                <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                    <input inputMode="numeric" pattern="[0-9]*" value={usdtConvertValue} disabled={!!value} onChange={handleChangeUsdt} className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                    <div className="absolute z-50 right-1 bottom-2">
                                     
                                        <WhiteDarker />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {error && (
                        <p className="bg-[#6DA0E133] py-[4px] rounded-[30px] w-full text-[#DD173E] text-center font-medium font-encode text-[10px]">
                            {t('whaleComponent.insufficientFunds')}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-center w-full mt-3">
                    <button onClick={handlePurchaseButtonClick} className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2">
                        <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                            {t('whaleComponent.purchase')}
                        </span>
                    </button>
                </div>                    
            </DialogContent>
        </Dialog>
    )
}

export function CoinsToUsdt({children}: iAppProps) {
     const [value, setValue] = useState<string>('');
     const [isOpen, setIsOpen] = useState<boolean>(false);
     const [error, setError] = useState<boolean>(false);

     const coinsConversion = useCoinsConversion();

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (/^\d*$/.test(newValue)) {
            setValue(newValue);
        }
    };

    const handlePurchase = () => {
        coinsConversion.mutate({coinsQuantity: Number(value)},{
            onSuccess: (data) => {
                console.log(data);
                if(data.data.code === 200){
                    toast.success(t('whaleComponent.purchaseSuccess'));
                    queryClient.invalidateQueries({ queryKey: ['user'] });
                    setIsOpen(false);
                    return;
                }
                setError(true);
            }
        });
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        {children}
                    </DialogTrigger>
            <DialogContent className="z-[100] rounded-[20px] bg-gradient-to-b from-[#0B0B0F] to-[#212C3D] shadow-[inset_0.25px_0.5px_2px_rgba(174,210,255,0.8),inset_-0.25px_-0.5px_2px_rgba(174,210,255,0.2)] backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                        boxShadow: `
                        0 1px 5px rgba(18,19,24,0.3),
                        0 1px 15px rgba(18,19,24,0.3),
                        0 1px 40px rgba(18,19,24,0.3),
                        inset 0 1px 4px rgba(174,210,255,0.3),
                        inset 0 0px 10px rgba(174,210,255,0.3)
                        `
                    }}>

                            <div className="w-full flex items-center justify-center mt-5 mb-5">
                                <p className="text-center font-encode font-semibold text-[18px] text-[#E4F1FF] w-[138px]">
                                {t('whaleComponent.usdtPurchase')}
                                </p>
                            </div>
                            <div className='flex flex-col gap-3 w-full items-center'>
                                <div className='w-full bg-[#30353E] max-w-[270px] h-20 rounded-[10px] py-[13px] flex flex-col items-center gap-1'>
                                    <p className='text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center'>
                                        {t('whaleComponent.currentCoinExchangeRate')}
                                    </p>
                                    <div className='bg-[#242629] max-w-[114px] h-[38px] w-full rounded-[10px] flex items-center justify-center [box-shadow:0_0_3px_0_rgba(174,210,255,0.5),0_0_10px_0_rgba(174,210,255,0.4)]'>
                                        <div className="flex gap-0.5 font-encode font-normal text-[16px] text-[#FFFFFF] items-center">
                                            <span>100</span>
                                            <WhiteDarker />
                                            =
                                            <span>100$</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-[#30353E] max-w-[270px] h-20 rounded-[20px] py-[13px] flex flex-col items-center gap-1">
                                    <p className="text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center">
                                        {t('whaleComponent.convertValueAtCurrentRate')}
                                    </p>
                                    <div className="flex items-center gap-0.5 w-full justify-center">
                                        <div className="flex items-center gap-1">
                                            <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                                <input inputMode="numeric" pattern="[0-9]*" value={value} onChange={handleChange}className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                                <div className="absolute z-50 right-1 bottom-2">
                                                    <WhiteDarker />
                                                    
                                                </div>                 
                                            </div>
                                            <img src={Arrow} alt="Arrow Icon" />
                                            <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                                <input inputMode="numeric" pattern="[0-9]*" value={value} onChange={handleChange}className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                                <div className="absolute z-50 right-1 bottom-2">
                                                    <DollarIcon />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                                {error && (
                                    <p className="bg-[#6DA0E133] py-[4px] rounded-[30px] w-full text-[#DD173E] text-center font-medium font-encode text-[10px]">
                                        {t('whaleComponent.insufficientFunds')}
                                    </p>
                                )}
                            </div>
                        
                            <div className="flex items-center justify-center w-full mt-3">
                                <button onClick={handlePurchase} className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2">
                                    <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                                        {t('whaleComponent.purchase')}
                                    </span>
                                </button>
                            </div>                                
                    </DialogContent>
        </Dialog>
    )
}

export default function CoinPurchase({children}: iAppProps) {
    const { t } = useTranslation();

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="rounded-[20px] bg-gradient-to-b from-[#0B0B0F] to-[#212C3D] shadow-[inset_0.25px_0.5px_2px_rgba(174,210,255,0.8),inset_-0.25px_-0.5px_2px_rgba(174,210,255,0.2)] backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                boxShadow: `
                  0 1px 5px rgba(18,19,24,0.3),
                  0 1px 15px rgba(18,19,24,0.3),
                  0 1px 40px rgba(18,19,24,0.3),
                  inset 0 1px 4px rgba(174,210,255,0.3),
                  inset 0 0px 10px rgba(174,210,255,0.3)
                `
            }}>
                <div className="w-full flex items-center justify-center mt-5 mb-5">
                    <p className="text-center font-encode font-semibold text-[18px] text-[#E4F1FF] w-[138px]">
                        {t('whaleComponent.coinPurchase')}
                    </p>
                </div>
                <div className='flex flex-col gap-3 w-full items-center'>
                    <div className='w-full bg-[#30353E] max-w-[270px] h-20 rounded-[20px] py-[13px] flex flex-col items-center gap-1'>
                        <p className='text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center'>
                            {t('whaleComponent.currentCoinExchangeRate')}
                        </p>
                        <div className='bg-[#242629] max-w-[114px] h-[38px] w-full rounded-[10px] flex items-center justify-center [box-shadow:0_0_3px_0_rgba(174,210,255,0.5),0_0_10px_0_rgba(174,210,255,0.4)]'>
                            <div className="flex gap-0.5 font-encode font-normal text-[16px] text-[#FFFFFF]">
                                <span>100</span>
                                <WhiteDarker />
                                =
                                <span>1$</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-[#30353E] max-w-[270px] h-20 rounded-[20px] py-[13px] flex flex-col items-center gap-1">
                        <p className="text-[#FFFFFF] font-normal font-encode text-[10px] tracking-wide text-center">
                            {t('whaleComponent.convertValueAtCurrentRate')}
                        </p>
                        <div className="flex items-center gap-0.5 w-full justify-center">
                            <div className="flex items-center gap-1">
                                <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                    <input type="number" inputMode="numeric" pattern="[0-9]*" className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                    <div className="absolute z-50 right-1 bottom-2">
                                        <DollarIcon />
                                    </div>
                                </div>
                                <img src={Arrow} alt="Arrow Icon" />
                                <div className="flex gap-1 w-20 h-[30px] bg-[#AED2FF4D] rounded-[10px] relative" >
                                    <input type="number" inputMode="numeric" pattern="[0-9]*" className="text-[16px] text-[#E4F1FF] font-encode font-normal p-1 w-[80%] outline-0" placeholder="..."/>
                                    <div className="absolute z-50 right-1 bottom-2">
                                        <WhiteDarker />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="py-1 w-full rounded-[30px] max-h-[42px] h-full bg-[#6DA0E120] max-w-[260px] mt-1 flex justify-center items-center">
                        <p className="text-[#DD173E] text-center font-medium font-encode text-[10px]">
                            {t('whaleComponent.insufficientFunds')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-center w-full mt-3">
                    <button className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2">
                        <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                            {t('whaleComponent.purchase')}
                        </span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
