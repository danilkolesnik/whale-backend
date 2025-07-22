import { useEffect, useState } from "react";
import type {Item} from "@/store/useUserStore"
import helmetImg from "@/assets/items/helmet_big.png";
import armorImg from "@/assets/items/armor_main_big.png";
import legImg from "@/assets/items/legs_big.png";
interface ItemStyleProps {
    textSize: number;
    item?: Item;
    selectedItem?: number;
    type?: string;
}

function preloadImages(urls: string[]) {
    urls.forEach((url: string) => {
        const img = new Image();
        img.src = url;
    });
}

export default function InventoryItem({ textSize, item, selectedItem, type }: ItemStyleProps) {
    const [image, setImage] = useState<string>(helmetImg);

    useEffect(() => {
        preloadImages([helmetImg, armorImg, legImg]);
    }, []);

    const getImageForItem = (type: string) => {
        switch (type.toLowerCase()) {
            case 'helmet':
                return helmetImg;
            case 'armor':
                return armorImg;
            case 'leg':
                return legImg;
            default:
                return helmetImg;
        }
    };

    useEffect(() => {
        if(item){
            setImage(getImageForItem(item.type));
        }
    }, [item])
    return (
        <>
            <div className={`relative w-[100%] h-[100%] overflow-hidden flex items-center justify-center ${selectedItem === item?.id ? 'bg-[#AED2FF] rounded-[15px]' : ''}`}>
                <div className="w-full h-full overflow-hidden">
                    <img src={image} alt="" className=" object-cover" />
                </div>
                <div className="absolute bottom-1 w-full p-[1px] px-1 flex items-center justify-between z-20">
                    <div className=" bg-[#294465] font-doppio font-normal py-[0px] px-[2px] rounded-[10px] flex items-center justify-center [box-shadow:0_0_2px_0_rgba(174, 210, 255, 0.7)]">
                    <span className="flex items-center text-[#AED2FF] font-doppio font-normal whitespace-nowrap" style={{ fontSize: `${textSize}px` }}>
                            Lv {item?.level}
                         </span>
                        
                    </div>
                    <div className="bg-black/40 h-[10px] font-doppio font-normal py-[1px] px-[2px] rounded-[10px] flex items-center justify-center [box-shadow:0_0_2px_0_rgba(174, 210, 255, 0.7)]">
                        {type !== "sell" && 
                        <span className="flex flex-row items-center text-white/90 font-doppio font-normal" style={{ fontSize: `${textSize}px` }}>
                            {item?.shield}
                        </span>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}