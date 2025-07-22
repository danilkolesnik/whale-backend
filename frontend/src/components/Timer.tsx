import { useEffect, useState } from "react";

const calculateNextWeekDate = (currentDate: Date) => {
  const nextWeekDate = new Date(currentDate);
  nextWeekDate.setDate(currentDate.getDate() + 7);
  return nextWeekDate;
};

type CountdownTimerProps = {
  targetDate: Date;
};

export const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
  const calculateTimeLeft = () => {
    const targetDateObj = new Date(targetDate);
    const adjustedTargetDate = new Date(targetDateObj.getTime() + 1 * 60 * 1000); 
    const difference = +adjustedTargetDate - +new Date();
    if (difference <= 0) {
      return { hours: "000", minutes: "00", seconds: "00" };
    }

    const totalHours = String(Math.floor(difference / (1000 * 60 * 60))).padStart(3, "0");
    const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, "0");
    const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, "0");

    return { hours: totalHours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const renderDigits = (value: string) => (
    <div className="flex gap-1">
      {value.split("").map((digit, i) => (
        <div
          key={i}
          className="h-[26px] w-[16px] rounded-[2px] flex items-center justify-center bg-[#121318] px-[3px] py-[1px] "
        >
          <span className="[text-shadow:_0_0_1px_rgba(174,210,255,0.6),_0_0_4px_rgba(174,210,255,0.6)] text-[#E4F1FF] font-encode font-semibold text-[16px]">
            {digit}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="rounded-[6px] bg-gradient-to-b from-[#344664]/10 to-[#527BAF]/40 py-[8px] gap-1
  [box-shadow:inset_0_0_2px_0_rgba(174,210,255,0.39)] w-[270px] flex items-center justify-center">
      {renderDigits(timeLeft.hours)}
      <span className="text-[#E4F1FF]">:</span>
      {renderDigits(timeLeft.minutes)}
      <span className="text-[#E4F1FF]">:</span>
      {renderDigits(timeLeft.seconds)}
    </div>
  );
};