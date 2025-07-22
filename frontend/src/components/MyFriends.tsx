import { useAuthStore } from "@/store/useUserStore";
import user_line from "../assets/icons/user-line.svg";
import money from "../assets/icons/tools/money.png";
import CustomScrollbar from "@/components/CustomScrollbar";
import { useTranslation } from 'react-i18next';

interface iAppProps {
  name: string;
  progress: string;
  reward?: string;
}

export default function FriendsList() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="w-full mx-auto rounded-lg shadow">
      <div className="mb-4 text-[#E4F1FF]">
        <h2 className="font-semibold text-[18px] leading-[100%] tracking-wide mb-1">
          {t('myFriends.title')}
        </h2>
        <p className="font-normal text-[10px] leading-[100%] tracking-wide">
          {t('myFriends.inviteMore')}
        </p>
      </div>

      <CustomScrollbar className="h-[460px] pr-3 scrollbar-hide">
        <div className="space-y-3">
          {user?.friends?.map((friend, index) => (
            <FriendCard
              key={index}
              name={friend.displayName}
              progress={friend.balance.shield.toString()}
              reward={t('myFriends.reward', { amount: 1000 })}
            />
          ))}
        </div>
      </CustomScrollbar>
    </div>
  );
}

export function FriendCard({ name, progress }: iAppProps) {
  return (
    <div className="bg-gradient-to-r from-[#AED2FF33] to-[#6DA0E133] w-full h-[46px] rounded-[23.5px] flex items-center p-1 relative">
      <img src={user_line} alt="user icon" className="text-left mr-[13px]" />
      <div className="flex flex-col">
        <p className="h-[20px] font-encode text-[12px] font-semibold leading-[20px] text-[#E4F1FF]">{name}</p>
        <p className="h-[14px] font-encode text-[10px] font-medium leading-[100%] text-[#6DA0E1] w-[70px] bg-[#12131899] rounded-[3px] text-center pt-0.5">{progress}</p>
      </div>
      <div className="h-[21px] bg-[#22293066] flex items-center justify-center rounded-[10px] p-2 absolute right-3">
        <div className="flex items-center gap-[2px]">
          <span className="font-encode leading-5 text-[10px] text-[#6DA0E1] font-medium">+1000</span>
          <img src={money} alt="tools" className="w-[12px]" />
        </div>
      </div>
    </div>
  );
}
