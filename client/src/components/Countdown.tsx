import { useEffect, useState } from "react";

export default function Countdown({ targetTime }: { targetTime: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return <p className="text-2xl font-bold">{formatTimeLeft(timeLeft)}</p>;
}

function calculateTimeLeft(targetTime: Date) {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { hours, minutes, seconds };
}

function formatTimeLeft(timeLeft: {
  hours: number;
  minutes: number;
  seconds: number;
}) {
  return `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
}
