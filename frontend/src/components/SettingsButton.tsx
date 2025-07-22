import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import go_icon from "../assets/icons/ArrowRight.svg"
import { cn } from "@/lib/utils"
import { AboutUsIcon, CnahgeLangIcon, ContactIcon, IconVibration, SettingsIcon } from "@/assets/icons/icons"
import i18n from '@/i18n'
import { useTranslation } from 'react-i18next'

export default function DialogCloseButton() {
  const { t } = useTranslation();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className=" outline-none focus:outline-none h-[30px] min-w-[30px] flex justify-center items-center gap-1 rounded-[10px] bg-[#30353E] px-1.5 py-[5px] shadow-[inset_0_1px_1px_#AED2FF66,inset_0_-2px_3px_#6DA0E133]">
            <SettingsIcon />
        </button>
      </DialogTrigger>
      <DialogContent className="z-[100] rounded-[20px] bg-[#4D597166]/70 backdrop-blur-[20px] h-[360px] max-w-[320px]" style={{
          boxShadow: `
            0 1px 5px rgba(18,19,24,0.3),
            0 1px 15px rgba(18,19,24,0.3),
            0 1px 40px rgba(18,19,24,0.3),
            inset 0 1px 4px rgba(174,210,255,0.3),
            inset 0 0px 10px rgba(174,210,255,0.3)
          `
      }}>
        <DialogHeader className="justify-end">
          <DialogTitle className="font-encode font-semibold text-[16px] text-[#E4F1FF] mb-2">{t('modalSettings.settings')}</DialogTitle>
        </DialogHeader>
        <DialogCards />
      </DialogContent>
    </Dialog>
  )
}

export function DialogCards(){
  const { t } = useTranslation();

  const lang = localStorage.getItem('lang');

  const langText = lang === 'ru' ? t('modalSettings.language.russian') : lang === 'uk' ? t('modalSettings.language.ukrainian') : t('modalSettings.language.english');
  return (
    <div className="flex flex-col gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <div className="flex relative gap-2 items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px]">
            <div className="size-8">
                <CnahgeLangIcon />
            </div>
            <div className="font-encode text-[11px] font-normal text-[#E4F1FF] leading-[100%] tracking-wide flex justify-between w-full">
                <span>{t('modalSettings.changeLanguage')}</span>
                <span className="pr-[8px] text-[#E4F1FF99]">{langText}</span>
            </div>  
            <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
          </div>
        </DialogTrigger>
        <DialogContent className="z-[200] rounded-[20px] bg-[#121318]/100 backdrop-blur-[20px] h-[200px] max-w-[230px]" style={{
            boxShadow: `
              0 1px 5px rgba(18,19,24,0.3),
              0 1px 15px rgba(18,19,24,0.3),
              0 1px 40px rgba(18,19,24,0.3),
              inset 0 1px 4px rgba(174,210,255,0.3),
              inset 0 0px 10px rgba(174,210,255,0.3)
            `
        }}>
            <DialogHeader>
                <DialogTitle className="font-encode font-medium text-[14px] text-[#FFFFFF] mt-5">{t('modalSettings.changeLanguage')}</DialogTitle>
            </DialogHeader>
            <LanguageChange />
        </DialogContent>
      </Dialog>
      
      
      <VibrationChange />
      <div className="flex relative items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px] gap-2">
        <div className="size-8">
          {/* <img src={about_icon} alt="about icon" className="h-full w-full" /> */}
          <AboutUsIcon />
        </div>
        <p className="font-encode text-[11px] font-normal text-[#E4F1FF] leading-[100%] tracking-wide">{t('modalSettings.aboutUs')}</p>
        <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
      </div>
      <div className="flex relative items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px] gap-2">
        <div className="size-8">
          {/* <img src={contact_icon} alt="contact icon" className="" /> */}
          <ContactIcon />
        </div>
        <p className="font-encode text-[11px] font-normal text-[#E4F1FF] leading-[100%] tracking-wide">{t('modalSettings.contactSupport')}</p>
        <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
      </div>
    </div>
    
  )
}


export function LanguageChange(){
  const { t } = useTranslation();
  const [lang, setLang] = useState<'en' | 'ru' | 'uk'>(() => {
    const storedLang = localStorage.getItem('lang');
    return storedLang === 'ru' || storedLang === 'uk' ? storedLang : 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    i18n.changeLanguage(lang);
  }, [lang]);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <button onClick={() => setLang('en')} className={cn("  outline-none focus:outline-none bg-[#5D6E8B40]/70 w-full rounded-[6px] text-[#ffffff] max-w-[180px] flex items-center justify-center h-[28px]", lang === "en" && "border border-[#6DA0E1] bg-[#5D6E8B99]/60 shadow-[0_0_2px_rgba(174,210,255,0.2),0_0_8px_rgba(174,210,255,0.2)] text-[#AED2FF]")}>
        <span className="font-encode font-normal tracking-wide text-[12px]">
          {t('modalSettings.language.english')}
        </span>
      </button>
      <button onClick={() => setLang('ru')} className={cn(" outline-none focus:outline-none bg-[#5D6E8B40]/70 w-full rounded-[6px] text-[#ffffff] max-w-[180px] flex items-center justify-center h-[28px]", lang === "ru" && "border border-[#6DA0E1] bg-[#5D6E8B99]/60 shadow-[0_0_2px_rgba(174,210,255,0.2),0_0_8px_rgba(174,210,255,0.2)] text-[#AED2FF]")}>
        <span className="font-encode font-normal tracking-wide text-[12px]">
          {t('modalSettings.language.russian')}
        </span>
      </button>
      <button onClick={() => setLang('uk')} className={cn(" outline-none focus:outline-none bg-[#5D6E8B40]/70 w-full rounded-[6px] text-[#ffffff] max-w-[180px] flex items-center justify-center h-[28px]", lang === "uk" && "border border-[#6DA0E1] bg-[#5D6E8B99]/60 shadow-[0_0_2px_rgba(174,210,255,0.2),0_0_8px_rgba(174,210,255,0.2)] text-[#AED2FF]")}>
        <span className="font-encode font-normal tracking-wide text-[12px]">
          {t('modalSettings.language.ukrainian')}
        </span>
      </button>
    </div>
  )
}

export function VibrationChange(){
  const { t } = useTranslation();
  return (
    <Dialog>
        <DialogTrigger asChild>
          <div className="flex relative gap-2 items-center h-[50px] bg-[#121318B2]/90 px-3 rounded-[10px]">
            <div className="size-8">
              <IconVibration />
            </div>
            <p className="font-encode text-[11px] font-normal text-[#E4F1FF] leading-[100%] tracking-wide">{t('modalSettings.vibration')}</p>
            <img src={go_icon} alt="arrow right go " className="absolute right-2"/>
          </div>
        </DialogTrigger>
        <DialogContent className=" z-[200] rounded-[20px] bg-[#121318]/100 backdrop-blur-[20px] h-[200px] max-w-[230px] flex items-center flex-col gap-3" style={{
            boxShadow: `
              0 1px 5px rgba(18,19,24,0.3),
              0 1px 15px rgba(18,19,24,0.3),
              0 1px 40px rgba(18,19,24,0.3),
              inset 0 1px 4px rgba(174,210,255,0.3),
              inset 0 0px 10px rgba(174,210,255,0.3)
            `
        }}>
          <DialogHeader className="mt-4 mb-0 ">
            <DialogTitle className="font-encode font-medium text-[14px] text-[#FFFFFF]">{t('modalSettings.vibration')}</DialogTitle>
          </DialogHeader>
          <div className="p-1 max-w-[180px] w-full bg-[#5D6E8B40]/25 rounded-[6px] flex items-center justify-center h-[52px]">
            <p className="font-encode text-[12px] font-medium text-[#AED2FF] w-full text-center">
              {t('modalSettings.vibrationDescription')}
            </p>    
          </div>
          <VibrationHandle />
          
        </DialogContent>
      </Dialog>
  )
}


export function VibrationHandle(){
  const { t } = useTranslation();
  const [vib, setVib] = useState<'on' | 'off'>(
    (localStorage.getItem('vibration') === 'on' || localStorage.getItem('vibration') === 'off') 
      ? localStorage.getItem('vibration') as 'on' | 'off' 
      : 'off'
  );

  const handleVibration = (type: 'on' | 'off') => {
    setVib(type);
    localStorage.setItem('vibration', type);
  }

  return (
    <div className="flex items-center justify-around w-full ">
      <button onClick={() => handleVibration("on")} className={cn(" outline-none focus:outline-none bg-[#5D6E8B40]/70 w-[70px] rounded-[6px] text-[#ffffff] max-w-[180px] flex items-center justify-center h-[28px]",vib === "on" && "border border-[#6DA0E1] bg-[#5D6E8B99]/60 shadow-[0_0_2px_rgba(174,210,255,0.2),0_0_8px_rgba(174,210,255,0.2)] text-[#AED2FF]")}>
        <span className="font-encode font-normal tracking-wide text-[12px]">
          {t('modalSettings.on')}
        </span>
      </button>
      <button onClick={() => handleVibration("off")} className={cn(" outline-none focus:outline-none bg-[#5D6E8B40]/70 w-[70px] rounded-[6px] text-[#ffffff] max-w-[180px] flex items-center justify-center h-[28px]",vib === "off" && "border border-[#6DA0E1] bg-[#5D6E8B99]/60 shadow-[0_0_2px_rgba(174,210,255,0.2),0_0_8px_rgba(174,210,255,0.2)] text-[#AED2FF]")}>
        <span className="font-encode font-normal tracking-wide text-[12px]">
          {t('modalSettings.off')}
        </span>
      </button>
      
    </div>
  )
}
