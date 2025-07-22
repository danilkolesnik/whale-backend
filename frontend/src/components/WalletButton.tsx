//@ts-nocheck
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useQueryClient } from "@tanstack/react-query";
import ton_icon from "../assets/icons/icon_ton.svg"
import go_icon from "../assets/icons/ArrowRight.svg"
import { cn } from "@/lib/utils"
import { UsdtIcon} from "@/assets/icons/icons"

import { CopyIcon, CopyTransparent } from "@/assets/icons/icons"
import { useAuthStore } from "@/store/useUserStore"
import { useTranslation } from 'react-i18next';
import api from '@/api/axios';
import { toast } from "sonner";
import Loader from "@/components/ui/loader/loader"; 

interface WalletButtonProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function WalletButton({open, setOpen}: WalletButtonProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'Deposit' | 'Withdrawal'>('Deposit')
    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="z-[200] rounded-[20px] bg-[#4D597166]/60 backdrop-blur-[20px] max-h-[540px] max-w-[320px]" style={{
            boxShadow: `
                0 1px 5px rgba(18,19,24,0.3),
                0 1px 15px rgba(18,19,24,0.3),
                0 1px 40px rgba(18,19,24,0.3),
                inset 0 1px 4px rgba(174,210,255,0.3),
                inset 0 0px 10px rgba(174,210,255,0.3)
            `
        }}>
            <DialogHeader className="justify-end">
            <DialogTitle className="font-encode font-semibold text-[16px] text-[#E4F1FF] my-4">
                {activeTab === 'Deposit' ? t('wallet.makeContribution') : t('wallet.withdrawal')}
            </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-4 font-encode font-normal text-[12px] leading-[100%] justify-center mb-2">
                <button onClick={() => setActiveTab('Deposit')} className={cn("pb-1",activeTab === "Deposit" ? "outline-none focus:outline-none text-[#6DA0E1] border-b border-[#6DA0E1]" : "text-[#E4F1FF]")}>{t('wallet.deposit')}</button>
                <button onClick={() => setActiveTab('Withdrawal')} className={cn("pb-1",activeTab === "Withdrawal" ? "outline-none focus:outline-none text-[#6DA0E1] border-b border-[#6DA0E1]" : "text-[#E4F1FF]")}>{t('wallet.withdrawal')}</button>
            </div>
            {activeTab === 'Deposit' ? (
                <DialogCardsDeposit />
            ) : (
                <DialogCardsWithdrawal setOpen={setOpen} />
            )}
            
        </DialogContent>
        </Dialog>
    )
}

export function DialogCardsDeposit(){
  return (
    <div className="flex flex-col gap-4 pb-[8px]">
      <TonDeposit />    
      <UsdtBepDeposit />
      {/* <UsdtTrcDeposit /> */}
    </div>
    
  )
}

interface DialogCardsWithdrawalProps {
    setOpen: (open: boolean) => void;
}

export function DialogCardsWithdrawal({ setOpen }: DialogCardsWithdrawalProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState<number | "">('');
    const [withdrawalAddress, setWithdrawalAddress] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const { balance, telegramId, displayName } = useAuthStore((state) => state.user);

    const isAmountExceedingBalance = typeof amount === "number" && amount > (balance?.usdt ?? 0);

    const createTransaction = async () => {
        if (!telegramId || !displayName || amount === "") {
            console.log("Missing required fields");
            return;
        }
        setIsLoading(true);
        try {
            await api.post(`/transactions`, {
                telegramId: telegramId,
                displayName: displayName,
                amount: Number(amount) - (Number(amount) * (1.3 / 100)),
                walletNumber: withdrawalAddress,
                status: 'pending'
            });
            await queryClient.invalidateQueries({ queryKey: ['user'] });
            setAmount("");
            setWithdrawalAddress("");
            setOpen(false);
            toast.success('Transaction created successfully');
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full z-[100]">
            <div className="flex justify-center items-center bg-[#121318CC]/80 border border-[#6DA0E1] rounded-[32px] px-13 py-[14px]">
                <p className="text-center font-encode font-medium text-[12px] text-[#AED2FF]">
                    {t('wallet.outputNetworkAddress', { network: 'BEP20' })}
                </p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <p className="font-encode font-semibold text-[16px] text-[#E4F1FF]">
                    {t('wallet.outputAddress')}
                </p>
                <div className="w-full p-[12px] bg-[#1B1D25] rounded-[10px]">
                    <div className="w-full flex p-[13px] bg-[#AED2FF33] h-full rounded-[10px]">
                        <input
                            type="text"
                            className="font-encode font-medium text-[12px] text-[#E4F1FF] h-full w-full outline-none"
                            placeholder="3MGTRzttkMtsMEy9dRq4Sf1xiSsWKg"
                            value={withdrawalAddress}
                            onChange={(e) => setWithdrawalAddress(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-3">
                <p className="font-encode font-semibold text-[16px] text-[#E4F1FF]">
                    {t('wallet.amountUSDT')}
                </p>
                <div className="w-full p-3 bg-[#1B1D25] rounded-[10px] h-auto">
                    <div className={`w-full flex items-center p-[13px] bg-[#AED2FF33] h-[50px] rounded-[10px] mb-1 ${isAmountExceedingBalance ? 'border border-red-500' : ''}`}>
                        <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            className="font-encode font-medium text-[12px] w-[90%] text-[#E4F1FF] h-full outline-none"
                            value={amount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                    setAmount('');
                                } else {
                                    const num = Number(value);
                                    if (!isNaN(num)) {
                                        setAmount(num);
                                    }
                                }
                            }}
                        />
                        <div className="scale-120">
                            <UsdtIcon />
                        </div>
                    </div>
                    <p className="text-center font-encode font-normal text-[11px] text-[#E4F1FF66]/75 w-full h-auto">
                        {t('wallet.balanceAndCommission', { balance: `${balance?.usdt ?? 0} USDT`,  commission: '1.3%'})}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-center w-full">
               
                <button
                    onClick={createTransaction}
                    className={`${isLoading ? 'opacity-50' : ''} ${balance?.usdt === 0 ? 'opacity-50' : ''} outline-none focus:outline-none relative flex items-center justify-center bg-[#6DA0E166]/40 border border-[#AED2FF80]/50 px-[15px] py-[10px] w-full h-full max-h-[46px] max-w-[146px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2`}
                    disabled={isLoading || balance?.usdt === 0}
                >
                    {isLoading && <Loader />}

                    {!isLoading && 
                        <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                            {t('wallet.continue')}
                        </span>
                    }
                </button>
            </div>
        </div>
    );
}

export function TonDeposit(){
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);

    const tonDepositAddress = "UQALYD4-Z2p9LBlp0FR0Y74cuplpfXEUj502Exf1P36fX8q7"

    const handleCopy = async (text: string) => {
        try {
        await navigator.clipboard.writeText(text);
        alert("copied")
        setTimeout(() => setCopied(false), 2000);
        } catch (err) {
        console.error("Не удалось скопировать:", err);
        }
    };
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex relative items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px] gap-3">
                        <div className="size-[22px] ml-10">
                        <img src={ton_icon} alt="ton icon" className="h-full w-full" />
                        </div>
                        <p className="font-encode text-[13px] font-medium text-[#E4F1FF] leading-[100%] tracking-wide">Top up TON(TON)</p>
                        <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
                    </div>
                </DialogTrigger>
        <DialogContent className=" z-[200] rounded-[20px] bg-[#4D597166]/60 backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                <DialogHeader>
                    <DialogTitle className="font-encode font-medium text-[14px] text-[#FFFFFF] mt-5 mb-2">Top up TON(TON)</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex justify-center items-center bg-[#121318CC]/80 border border-[#6DA0E1] rounded-[32px] px-[25px] py-[14px]">
                        <p className="text-center font-encode font-light text-[12px] text-[#AED2FF] max-w-[223px] w-full">
                            {t('wallet.sendOnly', { asset: 'TON' })}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <p className="font-encode font-semibold text-[16px] text-[#E4F1FF]">{t('wallet.tonTopUpAddress')}</p>
                        <div className="w-full p-3 pb-2 bg-[#1B1D25] rounded-[10px] h-auto flex flex-col gap-1">
                            <div className="w-full flex px-[13px] py-[2px] bg-[#AED2FF33] rounded-[10px] relative items-center justify-center">
                                <p className="text-center font-encode font-medium text-[12px] text-[#FFFFFF] w-[173px] py-[5px] break-words">{tonDepositAddress}</p>
                                
                                <button className="absolute right-3" onClick={() => handleCopy(tonDepositAddress)}><CopyIcon /></button>
                            </div>
                            <p className="text-center font-encode font-light text-[12px] text-[#E4F1FF40] w-full ">
                                {t('wallet.commissionAndMinDeposit', { commission: '0.05 TON', minDeposit: '1 TON' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-full p-3 pb-2 bg-[#1B1D25] rounded-[10px] h-auto flex flex-col gap-1">
                            <div className="w-full flex px-[13px] py-[2px] bg-[#AED2FF33] h-[50px] rounded-[10px] relative items-center justify-center">
                                <p className="text-center font-encode font-medium text-[12px] text-[#FFFFFF] w-[173px] break-words">{user?.telegramId}</p>
                                
                                <button className="absolute right-3" onClick={() => handleCopy(Number(user?.telegramId) || "")}><CopyIcon /></button>
                            </div>
                            <p className="text-center font-encode font-light text-[12px] text-[#E4F1FF40] w-full ">
                                {t('wallet.specifyMemo')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <button className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[242px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2" onClick={() => handleCopy(tonDepositAddress)}>
                            <div className="flex items-center gap-2">
                                <CopyTransparent />                           
                                <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                                    {t('wallet.copyAddress')}
                                </span>
                            </div>
                             
                        </button>
                    </div>
                    
                </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export function UsdtBepDeposit(){
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);

    const handleCopy = async (text: string) => {
        try {
        await navigator.clipboard.writeText(text);
        alert("copied")
        setTimeout(() => setCopied(false), 2000); // Убираем надпись через 2 сек
        } catch (err) {
        console.error("Не удалось скопировать:", err);
        }
    };
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex relative items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px] gap-3">
                        <div className="size-[22px] ml-10">
                        <img src={ton_icon} alt="ton icon" className="h-full w-full" />
                        </div>
                        <p className="font-encode text-[13px] font-medium text-[#E4F1FF] leading-[100%] tracking-wide">Top up USDT(BEP20)</p>
                        <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
                    </div>
                </DialogTrigger>
        <DialogContent className="z-[200] rounded-[20px] bg-[#4D597166]/60 backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                <DialogHeader>
                    <DialogTitle className="font-encode font-medium text-[14px] text-[#FFFFFF] mt-5 mb-2">Top up USDT(BEP20)</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex justify-center items-center bg-[#121318CC]/80 border border-[#6DA0E1] rounded-[32px] px-[15px] py-[14px]">
                        <p className="text-center font-encode font-light text-[12px] text-[#AED2FF]  w-full">
                            {t('wallet.sendOnly', { asset: 'USDT BEP-20' })}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <p className="font-encode font-semibold text-[16px] text-[#E4F1FF]">USDT top-up address</p>
                        <div className="w-full p-3 pb-2 bg-[#1B1D25] rounded-[10px] h-auto flex flex-col gap-1">
                            <div className="w-full flex px-[13px] py-[2px] bg-[#AED2FF33] h-[50px] rounded-[10px] relative items-center justify-center">
                                <p className="text-center font-encode font-medium text-[12px] text-[#FFFFFF] w-[173px] break-words">{user?.usdtAddressBEP20}</p>
                                
                                <button className="absolute right-3" onClick={() => handleCopy(user?.usdtAddressBEP20 || "")}><CopyIcon /></button>
                            </div>
                            <p className="text-center font-encode font-light text-[12px] text-[#E4F1FF40] w-full ">Commission 0.01 BNB. Min. deposit 1 USDT</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <button className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[242px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2" onClick={() => handleCopy(user?.usdtAddressBEP20 || "")}>
                            <div className="flex items-center gap-2">
                                <CopyTransparent />                           
                                <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                                    {t('wallet.copyAddress')}
                                </span>
                            </div>
                             
                        </button>
                    </div>
                    
                </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
export function UsdtTrcDeposit(){
    const { t } = useTranslation();
    const user = useAuthStore((state) => state.user);

    const [copied, setCopied] = useState(false);

    const handleCopy = async (text: string) => {
        try {
        await navigator.clipboard.writeText(text);
        alert("copied")
        setTimeout(() => setCopied(false), 2000); // Убираем надпись через 2 сек
        } catch (err) {
        console.error("Не удалось скопировать:", err);
        }
    };
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="flex relative items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px] gap-3">
                        <div className="size-[22px] ml-10">
                        <img src={ton_icon} alt="ton icon" className="h-full w-full" />
                        </div>
                        <p className="font-encode text-[13px] font-medium text-[#E4F1FF] leading-[100%] tracking-wide">Top up USDT(TRC20)</p>
                        <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
                    </div>
                </DialogTrigger>
        <DialogContent className=" z-[200] rounded-[20px] bg-[#4D597166]/60 backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                <DialogHeader>
                    <DialogTitle className="font-encode font-medium text-[14px] text-[#FFFFFF] mt-5 mb-2">Top up USDT(BEP20)</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex justify-center items-center bg-[#121318CC]/80 border border-[#6DA0E1] rounded-[32px] px-[15px] py-[14px]">
                        <p className="text-center font-encode font-light text-[12px] text-[#AED2FF]  w-full">
                            {t('wallet.sendOnly', { asset: 'USDT TRC-20' })}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <p className="font-encode font-semibold text-[16px] text-[#E4F1FF]">USDT top-up address</p>
                        <div className="w-full p-3 pb-2 bg-[#1B1D25] rounded-[10px] h-auto flex flex-col gap-1">
                            <div className="w-full flex px-[13px] py-[2px] bg-[#AED2FF33] h-[50px] rounded-[10px] relative items-center justify-center">
                                <p className="text-center font-encode font-medium text-[12px] text-[#FFFFFF] w-[173px] break-words">{user?.usdtAddressTRC20}</p>
                                
                                <button className="absolute right-3" onClick={() => handleCopy(user?.usdtAddressTRC20 || "")}><CopyIcon /></button>
                            </div>
                            <p className="text-center font-encode font-light text-[12px] text-[#E4F1FF40] w-full ">Commission 0.01 BNB. Min. deposit 1 USDT</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full">
                        <button className="flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full h-full max-h-[46px] max-w-[242px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2" onClick={() => handleCopy(user?.usdtAddressTRC20 || "")}>
                            <div className="flex items-center gap-2">
                                <CopyTransparent />                           
                                <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                                    {t('wallet.copyAddress')}
                                </span>
                            </div>
                             
                        </button>
                    </div>
                    
                </div>
                </DialogContent>
            </Dialog>
        </>
    )
}