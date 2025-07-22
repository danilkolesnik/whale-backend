//@ts-nocheck
import { ArrowGo } from "@/assets/icons/icons";
import { useFetchDailyTasks, useTakeDailyTask, useCompleteDailyTask } from "@/queries/daily";
import { useDailyStore } from "@/store/useDailyStore";
import { useAuthStore } from "@/store/useUserStore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { parseUrl } from "@/lib/utils";
import CustomScrollbar from "./CustomScrollbar";
import userInvite from "../assets/icons/user-invite.svg";
import youtube from "@/assets/icons/youTube_icon.png";
import telegram from "@/assets/icons/telegram_icon.png";
import instagram from "@/assets/icons/instagram_icon.png";
import twitter from "@/assets/icons/twitter_icon.png";
import completed_icon from "@/assets/icons/completed_task.png";

interface iAppProps {
    name?: string;
    reward?: number;
    friendsCount?: number;
    requiredSubscribers?: number;
    isCompleted?: boolean;
    link?: string;
}

const dailtImage = {
  "www.youtube.com": youtube,
  "t.me": telegram,
  "www.instagram.com": instagram,
  "x.com": twitter,
}

export default function DailyTasks() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { tasks } = useDailyStore();
  const takeDailyTask = useTakeDailyTask();
  const completeDailyTask = useCompleteDailyTask();
  const queryClient = useQueryClient();
 
  const takeTask = async(taksId: number, type: string) => {
    if(type !== "invite" && type !== "subscription") {
      await takeDailyTask.mutateAsync(taksId);
      await completeDailyTask.mutateAsync(taksId);
      await queryClient.invalidateQueries({ queryKey: ['dailyTasks'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(t('dailyTasks.taskCompleted'));
      return;
    }
    await takeDailyTask.mutateAsync(taksId);
    await queryClient.invalidateQueries({ queryKey: ['dailyTasks'] });
    await queryClient.invalidateQueries({ queryKey: ['user'] });
    toast.success(t('dailyTasks.taskTaken'));
  }
  const filteredTasks = tasks.map(task => {
    const userTask = user?.tasks?.find(userTask => userTask.taskId === task.id);
    return {
      ...task,
      isCompleted: userTask && userTask.status === 'completed'
    };
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return -1;
    if (!a.isCompleted && b.isCompleted) return 1;
    return 0;
  });

  useFetchDailyTasks();
  return (
    <div className="w-full mx-auto rounded-lg shadow">
      <div className="mb-4 text-[#E4F1FF] ">
        <h2 className="font-semibold text-[18px] leading-[100%] tracking-wide mb-1">
          {t('dailyTasks.title')}
        </h2>
        <p className="font-normal text-[10px] leading-[100%] tracking-wide">
          {t('dailyTasks.completeTasks')}
        </p>
      </div>
      <CustomScrollbar className="pr-2">
          <div className="h-[360px] pr-2">
            {sortedTasks.map((task, index) => (
              task.type === "invite" ? (
                <span key={index} className="flex flex-col mb-3" onClick={() => !task.isCompleted && takeTask(task.id, task.type)}>
                  <FriendCard link={task.channelLink} isCompleted={task.isCompleted} name={task.title} reward={task.coin} requiredSubscribers={task.requiredFriends} friendsCount={user?.tasks?.find(userTask => userTask.taskId === task.id)?.friendsCount}/>
                </span>
              ) : task.type === "subscription" ? (
                <span key={index} className="flex flex-col mb-3" onClick={() => {
                  if (!task.isCompleted) {
                    takeTask(task.id, task.type);
                    setTimeout(() => {
                      window.location.href = task.channelLink || "";
                    }, 500);
                  }
                }}>
                  <FriendCard link={task.channelLink} isCompleted={task.isCompleted} name={task.title} reward={task.coin}/>
                </span>
              ) : task.type === "external_sub" ? (
                <span key={index} className="flex flex-col mb-3" onClick={() => {
                  if (!task.isCompleted) {
                    takeTask(task.id, task.type);
                    setTimeout(() => {
                      window.open(task.channelLink, '_blank');
                    }, 500);
                  }
                }}>
                  <FriendCard link={task.channelLink} isCompleted={task.isCompleted} name={task.title} reward={task.coin}/>
                </span>
              ) : (
                <a key={index} className="flex flex-col mb-3" href={task.isCompleted ? undefined : task.channelLink} onClick={() => !task.isCompleted && takeTask(task.id, task.type)}>
                  <FriendCard link={task.channelLink} isCompleted={task.isCompleted} name={task.title} reward={task.coin}/>
                </a>
              )
            ))}
          </div>
      </CustomScrollbar>
      
    </div>
  );
}


export function FriendCard({ name, reward, friendsCount, requiredSubscribers, isCompleted, link }: iAppProps) {
    return (
        <div 
        className={`bg-gradient-to-r from-[#AED2FF33] to-[#6DA0E133] w-full h-[46px] rounded-[23.5px] flex items-center p-1 relative ${isCompleted ? 'opacity-50' : ''}`}
        >
            <img src={parseUrl(link)?.host ? dailtImage[parseUrl(link)?.host] : userInvite} alt="task icon" className="text-left mr-[13px] size-[32px] ml-1"/>
            <div className="flex flex-col">
                <p className="h-[20px] font-encode text-[12px] font-semibold leading-[20px] text-[#E4F1FF]">{name}</p>
                <p className="font-encode leading-5 text-[10px] text-[#6DA0E1] font-medium">{reward}</p>
                {(friendsCount !== undefined && friendsCount > 0) ? <p className="font-encode leading-5 text-[10px] text-[#fff] font-medium absolute right-[60px] top-[50%] translate-y-[-50%]">{friendsCount}/{requiredSubscribers}</p> : (requiredSubscribers ? <p className="font-encode leading-5 text-[10px] text-[#fff] font-medium absolute right-[60px] top-[50%] translate-y-[-50%]">0/{requiredSubscribers}</p> : null)}
            </div>
            <div className="absolute  right-0 flex items-center justify-center">
            {isCompleted ? <img src={completed_icon} alt="completed" className="text-left mr-[10px] size-[32px] ml-1" /> : <ArrowGo />}
            </div>   
        </div>
    )
}
