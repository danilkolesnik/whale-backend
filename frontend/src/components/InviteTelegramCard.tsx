import user_invite from "../assets/icons/user-invite.svg"
import user_premium_invite from "../assets/icons/user-invitePrem.svg"
import { useTranslation } from 'react-i18next';
import money from "../assets/icons/tools/money.png";


export default function InviteTelegramCards() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center flex-col gap-[18px] w-full">
        <div className="bg-gradient-to-r from-[#AED2FF33] to-[#6DA0E133] max-w-[270px] h-[46px] rounded-[23.5px] flex items-center w-full">
            <img src={user_invite} alt="tg icon" className="text-left mr-[13px]"/>
            <div className="flex flex-col">
                <p className="h-[20px] font-encode text-[12px] font-semibold leading-[20px] text-[#E4F1FF]">
                    {t('inviteTelegram.inviteFriends')}
                </p>
                <div className="h-[20px] flex items-center gap-[2px]">
                    <span className="font-encode text-[10px] font-medium  text-[#6DA0E1]">+1000</span>
                    <img src={money} alt="tools" className="w-[12px]" />
                </div>
            </div>
        </div>
        <div className="bg-gradient-to-r from-[#AED2FF33] to-[#6DA0E133] max-w-[270px] h-[46px] rounded-[23.5px] flex items-center w-full">
            <img src={user_premium_invite} alt="tg icon" className="text-left mr-[13px]"/>
            <div className="flex flex-col">
                <p className="h-[20px] font-encode text-[12px] font-semibold leading-[20px] text-[#E4F1FF]">
                    {t('inviteTelegram.invitePremiumFriends')}
                </p>
                <div className="h-[20px] flex items-center gap-[2px]">
                    <span className="font-encode text-[10px] font-medium  text-[#6DA0E1]">+2000</span>
                    <img src={money} alt="tools" className="w-[12px]" />
                </div>
            </div>
        </div>
    </div>
    
  )
}
