import React, { useState } from "react"
import { UsdtToCoins } from "./CoinPurchase"
import { DarkerIcon, PlusIcon, ToolsIcon, UsdtIcon, WalletIcon } from "@/assets/icons/icons"
import DialogCloseButton from "./SettingsButton"
import WalletButton from "./WalletButton"
import BuyTools from "@/components/modal/BuyTools";
import type { Balance } from "@/store/useUserStore"

interface NavbarProps {
  balance: Balance;
}

const Navbar = React.memo(({balance}: NavbarProps) => {
    const {money, tools, usdt} = balance;
    const [open, setOpen] = useState(false);
    const [openTools, setOpenTools] = useState(false);
    return (
        <nav className='w-full h-[60px] px-[20px] py-[15px] bg-gradient-to-r from-[rgba(18,19,24,1)] to-[rgba(34,41,48,1)] flex items-center justify-between rounded-[20px]'>
            <UsdtToCoins>                
                <button className="h-[30px] min-w-[30px] flex justify-between items-center gap-1 rounded-[10px] bg-[#30353E] px-1.5 py-[5px] shadow-[inset_0_1px_1px_#AED2FF66,inset_0_-2px_3px_#6DA0E133]">
                    <DarkerIcon />
                        <div className="flex items-end justify-center">
                            <span className="font-doppio text-[12px] text-[#E4F1FF] h-[17px] w-fit">{Math.round(money)}</span>
                        </div>
                    <PlusIcon />
                </button>
            </UsdtToCoins>
            {/* <CoinsToUsdt>
                <button className="h-[30px] min-w-[30px] flex justify-between items-center gap-1 rounded-[10px] bg-[#30353E] px-1.5 py-[5px] shadow-[inset_0_1px_1px_#AED2FF66,inset_0_-2px_3px_#6DA0E133]">
                    <UsdtIcon />
                    <div className="flex items-end justify-center">
                            <span className="font-doppio text-[12px] text-[#E4F1FF] h-[17px] w-fit">{usdt}</span>
                    </div>
                    <PlusIcon />
                </button>
            </CoinsToUsdt>    */}
             <button 
                className="h-[30px] min-w-[30px] flex justify-between items-center gap-1 rounded-[10px] bg-[#30353E] px-1.5 py-[5px] shadow-[inset_0_1px_1px_#AED2FF66,inset_0_-2px_3px_#6DA0E133]" 
                onClick={() => setOpen(true)}
            >
                    <UsdtIcon />
                    <div className="flex items-end justify-center">
                            <span className="font-doppio text-[12px] text-[#E4F1FF] h-[17px] w-fit">{usdt.toFixed(2)}</span>
                    </div>
                    <PlusIcon />
                </button>
        
            <button 
            className="h-[30px] min-w-[30px] flex justify-center items-center gap-1 rounded-[10px] bg-[#30353E] px-1.5 py-[5px] shadow-[inset_0_1px_1px_#AED2FF66,inset_0_-2px_3px_#6DA0E133]"
            onClick={() => setOpenTools(true)}
            >
                        <ToolsIcon />
                        <div className="flex items-end justify-center">
                            <span className="font-doppio text-[12px] text-[#E4F1FF] h-[17px] w-fit">{tools}</span>
                        </div>                 
            </button>
            <button 
                className="h-[30px] min-w-[30px] flex justify-center items-center gap-1 rounded-[10px] bg-[#30353E] px-1.5 py-[5px] shadow-[inset_0_1px_1px_#AED2FF66,inset_0_-2px_3px_#6DA0E133]" 
                onClick={() => setOpen(true)}
            >
                <WalletIcon /> 
            </button>
            <WalletButton open={open} setOpen={setOpen} />
            <DialogCloseButton />
            <BuyTools open={openTools} setOpen={setOpenTools} />
        </nav>
    )
})

export default Navbar