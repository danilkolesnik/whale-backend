//@ts-nocheck
import { useEffect,useState } from "react";
import { Dialog, DialogContent,DialogTrigger } from "./ui/dialog";
import { useUpgradeItem } from "@/queries/equipActions";
import { useAuthStore } from "@/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Item } from "@/store/useUserStore";
import { useTranslation } from 'react-i18next';
import armorImg from "@/assets/items/armor_main_big.png";
import helmetImg from "@/assets/items/helmet_big.png";
import legImg from "@/assets/items/legs_big.png";
import { IconKey } from "@/assets/icons/icons";
import { UPGRADE_SHIELD,UPGRADE_TOOL_PRICE } from "@/constants";
import Loader from "@/components/ui/loader/loader";
import failSound from '@/assets/sound_updrate/fail.mp3'
import luckySound from '@/assets/sound_updrate/lucky.mp3'
import Arrow from '@/assets/icons/arrow_right.svg'
interface ArmourImprovementProps {
    item: Item;
    setSelectedItem: (item: Item) => void;
}

function preloadImages(urls: string[]) {
    urls.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
}

export default function ArmourImprovement({ item,setSelectedItem }: ArmourImprovementProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<string>(armorImg);
    const { type, level, shield } = item;
    const { balance } = useAuthStore((state) => state.user);
    const upgradeItemMutation = useUpgradeItem();
    const queryClient = useQueryClient();

    const { t } = useTranslation();

    const getImage = (type: string) => {
        switch(type.toLowerCase()){
            case 'helmet':
                return helmetImg;
            case 'armor':
                return armorImg;
            case 'leg':
                return legImg;
        }
    }

    const playSound = (sound: string) => {
        const audio = new Audio(sound);
        audio.play();
    }

    const handleUpgrade = async () => {
        setIsLoading(true);
        const res = await upgradeItemMutation.mutateAsync(item.id);
        await queryClient.invalidateQueries({queryKey: ['user']});
        
        if(res.data.code === 200){
            setIsLoading(false);
            playSound(luckySound);
            toast.success(t('whaleComponent.upgradeSuccess'));
            setOpen(false);
            setSelectedItem(res.data.data.inventory.find((i: Item) => i.id === item.id));
            return;
        } 
        setSelectedItem(null);
        playSound(failSound);
        setIsLoading(false);
        setOpen(false);
        toast.error(t('whaleComponent.upgradeFailed'));
    };


    useEffect(() => {
        preloadImages([armorImg,helmetImg,legImg]);
    }, []);

    useEffect(() => {
        setImage(getImage(type));
    }, [type]);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="w-20 h-6 bg-[#6DA0E133] border border-[#AED2FF] rounded-[10px] flex items-center justify-center outline-none focus:outline-none">
                        <span className="font-doppio font-normal text-[14px] text-[#AED2FF] h-[22px]">
                            {t('whaleComponent.upgrade')}
                        </span>
                    </button>
                </DialogTrigger>
            <DialogContent className="z-[100] rounded-[20px] bg-[#4D5971]/20 [backdrop-filter:blur(30px)] [box-shadow:0_1px_5px_0_rgba(18,19,24,0.7),0_1px_15px_0_rgba(18,19,24,0.7),0_1px_40px_0_rgba(18,19,24,0.7),inset_0_1px_4px_0_rgba(174,210,255,0.3),inset_0_0_10px_0_rgba(174,210,255,0.3)] backdrop-blur-[20px] max-h-[560px] max-w-[320px]" style={{
                    boxShadow: `
                    0 1px 5px rgba(18,19,24,0.3),
                    0 1px 15px rgba(18,19,24,0.3),
                    0 1px 40px rgba(18,19,24,0.3),
                    inset 0 1px 4px rgba(174,210,255,0.3),
                    inset 0 0px 10px rgba(174,210,255,0.3)
                    `
                }}>
                        <div className="w-full flex items-center justify-center mt-5 mb-5">
                            <p className="text-center font-encode font-semibold text-[18px] text-[#E4F1FF] w-[170px]">
                                {t('whaleComponent.mainItemImprovements', { itemType: t(`${type}`) })}
                            </p>
                        </div>
                        <div className="w-full bg-[#121318] flex flex-col items-center justify-center p-3 max-w-[294px] rounded-[20px]">
                            <div className="flex justify-center flex-col bg-[#263246] w-full rounded-[20px] relative p-2">
                                <div className="flex items-center justify-between m-auto bg-[#374E74] w-[70px] max-w-[90px] rounded-[20px] h-[14px] font-encode font-medium text-[8px] ">
                                    <span className="text-[#E4F1FF60] text-center rounded-[20px] bg-[#374E74] w-8">
                                        Lvl {level}
                                    </span>
                                    <img src={Arrow} alt="arrow" className="w-[10px] h-[10px]" />
                                    <span className="bg-[#4B6996] rounded-[20px] h-full text-[#E4F1FF] w-8 text-center">
                                        Lvl {level + 1}
                                    </span>
                                </div>
                                <img src={image} alt="item" className="w-[141px] object-cover m-auto" />

                                <div className="bg-[#6DA0E1]/30 p-[9px] flex items-center justify-center absolute bottom-1.5 right-1.5 rounded-[12px] [box-shadow:inset_0_1px_1px_0_rgba(174,210,255,0.4),inset_0_-2px_3px_0_rgba(106,208,225,0.2)]">   
                                    <div className="relative flex items-center justify-center">
                                        <IconKey />
                                        <span className="absolute bg-[#22293099] pr-[5px] pl-[5px] pt-[2px] pb-[2px] rounded-[20px] -top-2 -right-2 text-[#E4F1FF] font-doppio font-normal text-[8px]">
                                            {UPGRADE_TOOL_PRICE[type]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center py-1.5 w-full rounded-[8px] max-h-[42px] h-full bg-[#22293080] max-w-[220px] mt-3">
                                <p className="text-[#E4F1FF] font-medium font-encode text-[10px] tracking-wide">
                                    {t('whaleComponent.pointsOfDefense')}
                                </p>
                                <div className="bg-gradient-to-r from-[#1C232F] to-[#23314A] w-[124px] h-[14px] rounded-[10px] flex items-center justify-center gap-[8px] mt-1 py-[4px]">
                                    <span className="text-[#E4F1FF50] text-[8px] font-encode font-medium">{shield}</span>
                                    <img src={Arrow} alt="arrow" className="w-[10px] h-[10px]" />
                                    <span className="text-[#AED2FF] text-[8px] font-encode font-medium">{UPGRADE_SHIELD[type][level + 1]}</span>
                                </div>
                            </div>
                            <div className=" w-full rounded-[20px] h-full bg-[#6DA0E120] mt-3 py-[8px] px-[5px]">
                                <p className="text-[#DD173E] text-center font-medium font-encode text-[10px]">
                                    {t('whaleComponent.itemCanImproveOrBreak')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center w-full mt-5">
                            <button 
                                onClick={handleUpgrade} 
                                className={`${isLoading ? 'opacity-50' : ''} ${balance.tools < UPGRADE_TOOL_PRICE[type] ? 'opacity-50' : ''} focus:outline-none focus:ring-0 flex items-center justify-center bg-[#6DA0E166]/70 border border-[#AED2FF80]/50 w-full  max-w-[178px] rounded-[40px] shadow-[0_0_4px_#6DA0E180,0_0_10px_#6DA0E180,0_0_18px_#6DA0E180,0_0_28px_#6DA0E180] mb-5 mt-2 h-[46px]`}
                                disabled={isLoading || balance.tools < UPGRADE_TOOL_PRICE[type]}
                            >
                                {isLoading && <Loader />}
                                {!isLoading && 
                                <span className="font-doppio font-normal text-[20px] text-[#E4F1FF] [text-shadow:0_0_1px_#AED2FF,0_0_7px_#AED2FF,0_0_24px_#AED2FF,0_0_40px_#AED2FF]">
                                    {t('whaleComponent.upgrade')}
                                </span>
                                }
                            </button>
                        </div>
                        
                    
                             
                </DialogContent>
    </Dialog>
  )
}
