import { useEffect, useState, useRef } from 'react';
import { GlowCardPadding } from "./GlowCard";
import { useAuthStore } from "@/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useLocation } from "react-router-dom";
import { useEquipItem, useUnequipItem } from "@/queries/equipActions";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import InventoryItem from "./InventoryItem";
import ArmourImprovement from "./ArmourImprovement";
import type { ItemType } from "@/store/useUserStore";
import type {Item} from "@/store/useUserStore"
import rating_icon from "../assets/icons/rating_png.png"

export default function WhaleComponent() {
    const queryClient = useQueryClient();
    const equipMutation = useEquipItem();
    const unequipMutation = useUnequipItem();
    const { t } = useTranslation();
    const location = useLocation();

    const user = useAuthStore((state) => state.user)
    const inventory = useAuthStore((state) => state.user?.inventory) || []
    const equipmentStore = useAuthStore((state) => state.user?.equipment) || []
    const balance = useAuthStore((state) => state.user?.balance)
    const [selectedItem, setSelectedItem] = useState<Item | null | undefined>()
    const [equipment, setEquipment] = useState<Partial<Record<ItemType, Item>>>({})

    const [armorItem, setArmorItem] = useState<Item | null>(null);
    const [helmetItem, setHelmetItem] = useState<Item | null>(null);
    const [legItem, setLegItem] = useState<Item | null>(null);

    const inventorySlots: (Item | null)[] = [...inventory];
    const equipmentSlots: ItemType[] = ['Helmet', 'Armor', 'Leg'];

    while (inventorySlots.length < 10) {
        inventorySlots.push(null);
    }

    const detailRef = useRef<HTMLDivElement | null>(null);

    const handleItemClick = (item: Item) => {
        setSelectedItem(item);
    };

    // const putOnItem = async (item: Item) => {
    //     const currentItem = equipment[item.type];
    //     if(item.type === 'Armor'){
    //         setArmorItem(item);
    //     } else if(item.type === 'Helmet'){
    //         setHelmetItem(item);
    //     } else if(item.type === 'Leg'){
    //         setLegItem(item);
    //     }

    //     toast.success(t('whaleComponent.putOnSuccess'));
    //     try {
    //         if(currentItem){
    //             await unequipMutation.mutateAsync(currentItem.id);
    //         }
    //         await equipMutation.mutateAsync(item.id);
    //         await queryClient.invalidateQueries({queryKey: ['user']});
    //     } catch (error) {
    //       console.log(error);
    //     }
    // };

    useEffect(() => {
        if (equipmentStore) {
            const equipmentObject: Partial<Record<ItemType, Item>> = {};
            for (const item of equipmentStore) {
                equipmentObject[item.type] = item;
            }
            setEquipment(equipmentObject);
        }
    }, [equipmentStore]);

    useEffect(() => {
        if (equipmentStore) {
            const armor = equipmentStore.find(item => item.type.toLowerCase() === 'armor');
            const helmet = equipmentStore.find(item => item.type.toLowerCase() === 'helmet');
            const leg = equipmentStore.find(item => item.type.toLowerCase() === 'leg');
            setArmorItem(armor || null);
            setHelmetItem(helmet || null);
            setLegItem(leg || null);
        }
    }, [equipmentStore]);

    useEffect(() => {
        const img = new Image();
        img.src = 'https://i.ibb.co/yc6XQQ8h/whale.png';
    }, []);

    useEffect(() => {
        if(selectedItem){
            detailRef.current?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [selectedItem]);

    useEffect(() => {
        setSelectedItem(null);
    }, [location]);

    return (
        <>
            <GlowCardPadding>
                <div className="flex flex-col items-center">
                    <div className="flex justify-between px-1 py-0.5 w-full">
                        <div></div>
                        <h1 className="font-cabin font-bold text-[30px] text-[#E4F1FF] [text-shadow:0_0_3.29px_rgba(174,210,255,0.8),0_0_6px_rgba(174,210,255,0.8),0_0_20px_rgba(174,210,255,0.5),0_0_40px_rgba(174,210,255,0.5),0_0_60px_rgba(174,210,255,0.6),0_0_75px_rgba(174,210,255,0.5)]">
                            {user?.displayName}
                        </h1>
                        <div className=" bg-[#222930]  font-doppio font-normal text-[7px] px-1 py-1.5 rounded-[10.5px] flex items-center max-w-[56px] w-fit h-6 [box-shadow:0_0_4px_0_rgba(174,210,255,0.3),0_0_10px_0_rgba(174,210,255,0.2)]">
                            <span className="h-[8px] flex items-center text-[#AED2FF]/50 font-doppio text-[12px] font-normal">
                                {balance?.shield}
                            </span>
                        </div>
                    </div>
                    <div className="w-full p-[10px] flex flex-col items-end justify-center relative">
                        <img src={"https://i.ibb.co/yc6XQQ8h/whale.png"} alt="" className="w-full h-70 object-cover" />
                        <div className="flex gap-4 h-15 items-center justify-center absolute bottom-0 right-0 w-full">
                            {equipmentSlots.map((slot) => {
                                let item;
                                switch (slot.toLowerCase()) {
                                    case 'helmet':
                                        item = helmetItem;
                                        break;
                                    case 'armor':
                                        item = armorItem;
                                        break;
                                    case 'leg':
                                        item = legItem;
                                        break;
                                    default:
                                        item = null;
                                }
                                return (
                                    <div 
                                        onClick={() => {
                                            handleItemClick(item)
                                            detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }} 
                                        key={slot} 
                                        className={`
                                            size-16 relative  rounded-[10px] [box-shadow:0_0_2px_0_rgba(174,210,255,0.8),0_0_4px_0_rgba(174,210,255,0.4),0_0_8px_0_rgba(174,210,255,0.3),0_0_12px_0_rgba(174,210,255,0.4),0_0_20px_0_rgba(174,210,255,0.3)] flex items-center justify-center
                                            ${selectedItem?.id === item?.id ? 'bg-[#AED2FF]': 'bg-[#222930]'}
                                        `}
                                    >
                                        <div className="flex justify-center w-full absolute top-[2px] z-10">
                                            <span className={`${selectedItem?.id === item?.id ? 'text-[#000]' : 'text-[#E4F1FF]'} font-normal font-doppio text-[8px] [text-shadow:0_0_1_rgba(0, 0, 0, 1),0_0_4_rgba(0, 0, 0, 1)]`}>
                                                {slot}
                                            </span>
                                        </div>
                                        {item && <InventoryItem textSize={6} item={item} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-4 w-[94%] h-[1px] bg-[#6DA0E1] [box-shadow:0_0_0.62px_0_#6DA0E1,0_0_1.24px_0_#6DA0E1,0_0_4.33px_0_#6DA0E1,0_0_14.84px_0_#6DA0E1,0_0_25.97px_0_#6DA0E1]" />
                    {/* <div className="flex flex-col p-1 items-center gap-4 mt-2">
                        <div className="w-full flex items-center justify-center h-6">
                            <span className="text-[#E4F1FF] text-[20px] font-encode font-semibold">{t('whaleComponent.inventory')}</span>
                        </div>
                        <div className="flex justify-center w-full items-center">
                            <div className="flex flex-wrap w-full max-w-[320px] gap-[8px] m-auto">
                                {inventorySlots.map((item, index) => (
                                    item ? (
                                        <div key={index} className="w-[68px] bg-[#222930] rounded-[15px] shadow-[inset_0_0_2px_0_#6DA0E133,inset_0_0_5px_0_#6DA0E126,inset_0_0_12px_0_#AED2FF26]" onClick={() => {
                                            handleItemClick(item);
                                            detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }} >
                                            <InventoryItem selectedItem={selectedItem?.id} textSize={8} item={item} />
                                        </div>
                                    ) : (
                                        <div key={index} className="w-[68px] h-[69px] bg-[#222930] rounded-[15px] shadow-[inset_0_0_2px_0_#6DA0E133,inset_0_0_5px_0_#6DA0E126,inset_0_0_12px_0_#AED2FF26]" />
                                    )
                                ))}
                            </div>
                        </div>
                    </div> */}
                    {selectedItem ? (
                        <div ref={detailRef} className="w-full bg-[#222930] rounded-[15px] h-[112px] mt-4 max-w-[315px] mx-auto">
                        <div className="flex p-[18px] justify-around">
                            <div className="h-[77px] w-[72px] bg-[#AED2FF] rounded-[15px] [shadow:0_0_20px_0_rgba(109, 160, 225, 0.2),0_0_14px_0_rgba(109, 160, 225, 0.2),0_0_3px_0_rgba(174, 210, 255, 0.15)]">
                                <InventoryItem textSize={10} item={selectedItem!}/>
                            </div>
                            <div className="flex flex-col justify-between">
                                <span className="text-center font-encode font-semibold text-[14px] text-[#E4F1FF]">
                                    {selectedItem.name}
                                </span>
                                <p className="text-center font-encode font-normal text-[8px] leading-2.5 text-[#AED2FF] tracking-wide">
                                    {t('whaleComponent.level')} {selectedItem.level} {selectedItem.type}. {t('whaleComponent.shield')} {selectedItem.shield}.
                                </p>
                                <div className="flex gap-1 w-[170px] h-6">
                                    <ArmourImprovement item={selectedItem} setSelectedItem={setSelectedItem} />
                                </div>
                            </div>
                        </div>
                    </div>
                    ) : null}
                    
                </div>
            </GlowCardPadding>
        </>
    )
}

