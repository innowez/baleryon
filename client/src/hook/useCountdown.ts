import { useEffect, useState } from "react";

type Countdown = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

export function useCountdown(targetDate: Date) {
  const calculate = (): Countdown => {
    const diff = targetDate.getTime() - Date.now();

    if (diff <= 0) {
      return {
        days: "00",
        hours: "00",
        minutes: "00",
        seconds: "00",
      };
    }

    return {
      days: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0"),
      hours: String(
        Math.floor((diff / (1000 * 60 * 60)) % 24)
      ).padStart(2, "0"),
      minutes: String(
        Math.floor((diff / (1000 * 60)) % 60)
      ).padStart(2, "0"),
      seconds: String(
        Math.floor((diff / 1000) % 60)
      ).padStart(2, "0"),
    };
  };

  const [timeLeft, setTimeLeft] = useState<Countdown>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
//   const [timeLeft, setTimeLeft] = useState(calculate());

  useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft(calculate());
  }, 1000);

  return () => clearInterval(interval);
}, [targetDate]);

  return timeLeft;
}