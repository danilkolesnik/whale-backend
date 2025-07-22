import Navbar from "../components/Navbar";
import bgImage from "../assets/bg/earnBg.jpg"
import GlowCard, { GlowWhiteCard } from "../components/GlowCard";
import Card from "../components/Card";
import InviteTelegramCards from "../components/InviteTelegramCard";
import type { Balance } from "@/store/useUserStore"

import FriendsList from "../components/MyFriends";
import DailyTasks from "../components/DailyTasks";
import Footer from "../components/Footer";
import { useFetchUser } from '@/queries/user';
import { LineIcon, LinkIcon, MessIcon, ViberIcon, XIcon } from "@/assets/icons/icons";
import { generateReferralLink, generateTelegramShareUrl } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import GlobalLoading from '@/components/ui/loading/GlobalLoading';

export default function Earn() {
    const { data: user ,isLoading: isUserLoading } = useFetchUser();
    const referralLink = generateReferralLink(user?.telegramId || "");
    const telegramShareUrl = generateTelegramShareUrl(referralLink);
    const { t } = useTranslation(); 
    const viberShareUrl = `viber://forward?text=${encodeURIComponent(referralLink)}`;
    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(referralLink)}`;
    const messengerShareUrl = `fb-messenger://share?link=${encodeURIComponent(referralLink)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`;

    const copyToClipboard = () => {
      navigator.clipboard.writeText(referralLink).then(() => {
        alert('Referral link copied to clipboard!');
      }, (err) => {
        console.error('Could not copy text: ', err);
      });
    };

    if (isUserLoading ) {
      return <GlobalLoading isReady={true} isLoading={false} isUserLoading={isUserLoading} />;
    }
  return (
    <div className="flex flex-col items-center w-full overflow-hidden h-[1580px] bg-cover bg-center p-[20px] relative" style={{ backgroundImage: `url(${bgImage})` }}>
        <Navbar balance={user?.balance ?? { money: 0, tools: 0, shield: 0, usdt: 0 }} />
        <Card height="340" >
          <div className="w-full flex flex-col items-center">
              <div className="w-full flex items-center justify-center flex-col font-encode text-[#E4F1FF] mb-[22px]">
                <p className="font-semibold text-[18px] leading-[100%] tracking-wide">{t('inviteTelegram.inviteFriends')}</p>
                <span className="h-0.5"></span>
                <span className="font-light text-[10px] leading-[100%] tracking-wide">{t('inviteTelegram.getBonus')}</span>
            </div>
            <InviteTelegramCards />
            <a href={telegramShareUrl} target="_blank" rel="noopener noreferrer">
              <button className="s:w-[269px] xs:w-full rounded-[10px] xs:px-[47px] xs:py-[15px] mt-[20px] bg-gradient-to-b from-[#2121318] to-[#25293C] shadow-[0_0_3px_#12131899,0_0_10px_#12131880,inset_0_1px_1px_#6DA0E180,inset_0_1px_4px_#6DA0E166]">
                  <p className="font-encode text-[#E4F1FF] leading-[20px] xs:text-[14px] s:text-[18px] font-semibold shadow-[0_0_3.29px_#AD2FFCC,0_0_6px_#AD2FFCC,0_0_20px_#AD2FF80,0_0_30px_#AD2FF80,0_0_50px_#AD2FF66]">{t('inviteTelegram.share')}</p>
              </button>
            </a>
            <div className="mt-2">
                <ul className="flex items-center justify-center gap-3">
                    <li>
                        <a href={viberShareUrl} target="_blank" rel="noopener noreferrer">
                          <ViberIcon />
                        </a>
                    </li>
                    <li>
                        <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer">
                          <MessIcon />
                        </a>
                    </li>
                    <li>
                        <a href={messengerShareUrl} target="_blank" rel="noopener noreferrer">
                          <LineIcon />
                        </a>
                    </li>
                    <li>
                        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
                          <XIcon />
                        </a>
                    </li>
                    <li>
                        <button onClick={copyToClipboard}>
                          <LinkIcon />
                        </button>
                    </li>
                </ul>
            </div>
          </div>
            
        </Card>

        <GlowCard>
            <FriendsList />
        </GlowCard>
        <GlowWhiteCard>
            <DailyTasks />
        </GlowWhiteCard>
        
        <Footer />
    </div>
  )
}

