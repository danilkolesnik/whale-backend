// useCountdown.ts
import { useEffect, useState } from "react";

// Вспомогательная функция: форматирует число до двух знаков (например, 4 => "04")
const formatNumber = (num: number): string => String(num).padStart(2, "0");

export const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  // Расчёт оставшегося времени (в часах, минутах и секундах)
  function getTimeLeft(target: Date) {
    const totalMs = target.getTime() - new Date().getTime();

    const totalSeconds = Math.max(Math.floor(totalMs / 1000), 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours: formatNumber(hours),
      minutes: formatNumber(minutes),
      seconds: formatNumber(seconds),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000); // обновляем каждую секунду

    return () => clearInterval(timer); // очищаем таймер при размонтировании
  }, [targetDate]);

  return [timeLeft.hours, timeLeft.minutes, timeLeft.seconds] as const;
};
