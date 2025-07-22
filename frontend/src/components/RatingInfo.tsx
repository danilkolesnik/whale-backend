import { Dialog, DialogClose, DialogContent, DialogTrigger } from "./ui/CustomDialog";
import i from "../assets/icons/i (1).svg"
import bgImage from "../assets/bg/Group 3.png"
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

export default function RatingInfo() {
  const { t } = useTranslation();

  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
  }, []);

  return (
    <Dialog>
                <DialogTrigger asChild>
                    <button className="  outline-none focus:outline-none border border-custom-blue rounded-[50%] p-[1px] bg-gradient-to-b from-[#344664]/10 to-[#527BAF]/40">
                        <img src={i} alt="i" className="size-[10px]"/>
                    </button>
                </DialogTrigger>
        <DialogContent showCloseButton={false} className="z-[100] rounded-[30px] w-full" >
                
                <div className="bg-center bg-cover h-full w-full rounded-[20px] z-50 absolute rounded-b-none flex flex-col items-center justify-end" style={{ backgroundImage: `url(${bgImage})` }}>
                    <div className="h-[50%] w-full p-4 flex flex-col">
                        <div className="flex flex-col gap-3 p-2">
                            <div className="w-full flex items-center justify-start">
                                <span className="font-encode font-semibold text-[16px] leading-5 text-[#FFFFFF]">
                                    {t('ratingInfo.aboutRating')}
                                </span>
                            </div>
                            
                            <p className="w-full h-[70px] text-[12px] font-encode font-normal leading-[14px] text-[#FFFFFF]">
                                {t('ratingInfo.description')}
                            </p>
                            <DialogClose>
                                <div className="w-full flex justify-center">
                                    <button className=" outline-none focus:outline-none bg-[#6DA0E1] shadow-[0_0_2px_0_rgba(109,160,225,0.6),0_0_6px_0_rgba(109,160,225,0.6),0_0_16px_0_rgba(109,160,225,0.4)] w-[130px] h-9 rounded-[30px] flex items-center justify-center">
                                        <span className="font-encode text-[14px] font-semibold text-[#121318]">
                                            {t('ratingInfo.allClear')}
                                        </span>
                                    </button>
                                </div>
                            </DialogClose>
                            
                        </div>
                        
                    </div>
                </div>
                    
                </DialogContent>
    </Dialog>
  )
}
