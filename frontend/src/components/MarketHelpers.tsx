import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import down_icon from "../assets/icons/arrowDown.svg"
import type { Item } from '@/store/useUserStore';
import {  EditIcon } from '@/assets/icons/icons';
import CustomSelect from './CustomSelect';
import { useTranslation } from 'react-i18next';

import armorImg from "@/assets/items/armor_main_big.png";
import helmetImg from "@/assets/items/helmet_big.png";
import legImg from "@/assets/items/legs_big.png";
interface iAppProps {
  action: "buy" | "sell";
  item?: Item
  usdtPrice: string;
  coinPrice: string;
  setUsdtPrice: (val: string) => void;
  setCoinPrice: (val: string) => void;
  setLevel: (level: number) => void;
  level: number;
  selectType: string;
}

const Inputs = forwardRef(function Inputs(
  { action, item, usdtPrice, coinPrice, setUsdtPrice, setCoinPrice, setLevel, level, selectType }: iAppProps,
  ref: React.Ref<HTMLFormElement>
) {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const isSell = action === "sell";
  const isBuy = action === "buy";

  useImperativeHandle(ref, () => formRef.current!);

  const getImageForItem = (itemType: string) => {
    switch (itemType.toLowerCase()) {
        case 'helmet':
            return helmetImg;
        case 'armor':
            return armorImg;
        case 'leg':
            return legImg;
        default:
            return '';
    }
  };

  useEffect(() => {
    if (isSell) {
      setChecked(false);
      setSelectedLevel(null);
    } else if (isBuy) {
      setChecked(true);
    }
  }, [action]);
  return (
    <form
      className="bg-[#121318] text-white p-3 rounded-xl shadow-md max-w-[280px] w-full max-h-[147px] h-full border border-[#AED2FF4D]/50"
    >
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <div className="w-22 h-22 bg-gradient-to-b from-[#445162] via-[#4C5C72] to-[#AED2FF] rounded-[10px]">
            {item && (
              <img src={getImageForItem(item.type)} alt="item" className="w-full h-full object-cover" />
            )}
            {action === 'buy' && selectType && (
              <img src={getImageForItem(selectType)} alt="item" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex items-end justify-between">
            <label className="checkbox-wrapper">
              <span className={`custom-box ${checked ? "checked" : ""}`}>
                <svg
                  className="check-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 12 9 17 20 6" />
                </svg>
              </span>
            </label>

            <div className="relative w-[60px]">
              <CustomSelect
                value={level}
                onChange={setLevel}
                disabled={isSell}
              />

              <input
                type="hidden"
                name="level"
                value={selectedLevel ?? ""}
                required={isBuy}
              />

              <img
                src={down_icon}
                alt="arrow down"
                className="dropdown-arrow absolute right-2 top-5"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2 flex-1 pl-3">
          <input
            type="text"
            placeholder={`${action === 'buy' ? `You choose ${selectType.charAt(0).toUpperCase() + selectType.slice(1)}` : item?.name || 'The name of the selected item'}`}
            value={itemName}
            required
            onChange={(e) => setItemName(e.target.value)}
            disabled={true}
            className="bg-[#21262F] outline-0 focus:outline-0 text-[9px] h-7 font-encode font-normal text-[#E4F1FF]/90 pl-2 max-w-[155px] py-1 rounded-[5px]"
          />
          <div className="flex flex-col gap-0">
            <label
              htmlFor="usdtPrice"
              className="font-encode text-[9px] pl-[2px] text-[#ffffff] font-normal tracking-wide"
            >
              {t('market.priceInUsdt')} 
            </label>
            <div className='bg-[#21262F] flex items-center rounded-[5px] overflow-hidden justify-between pr-1.5'>
                  <input
                    required
                    id="usdtPrice"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder='0'
                    maxLength={7}
                    value={usdtPrice}
                    onChange={e => setUsdtPrice(e.target.value.replace(/\D/g, ""))}
                    className=" outline-0 focus:outline-0 text-[9px] h-6 font-encode font-normal text-[#E4F1FF]/90 pl-2 max-w-[145px] py-1 rounded-[5px]"
                  />
                  <EditIcon />
            </div>
            
          </div>
          <div className="flex flex-col gap-0">
            <label
              htmlFor="coinPrice"
              className="font-encode text-[9px] pl-[2px] text-[#ffffff] font-normal tracking-wide"
            >
              {t('market.priceInCoins')}
            </label>
            <div className='bg-[#21262F] flex items-center rounded-[5px] overflow-hidden justify-between pr-1.5'>
                <input
                  required
                  placeholder='0'
                  id="coinPrice"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={7}
                  value={coinPrice}
                  onChange={e => setCoinPrice(e.target.value.replace(/\D/g, ""))}
                  className=" text-[9px] h-6 font-encode font-normal text-[#E4F1FF]/90 pl-2 max-w-[145px] py-1 outline-0 focus:outline-0"
                />
                <EditIcon />
            </div>
            
          </div>
        </div>
      </div>
    </form>
  );
});

export default Inputs;