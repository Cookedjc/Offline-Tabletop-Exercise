import { useState, useEffect } from 'react';
import { ExerciseState } from '@/store/exercise';

export function useTimer(state: ExerciseState) {
  const [timeLeft, setTimeLeft] = useState(state.durationLeft);

  useEffect(() => {
    if (state.status === 'running' && state.endTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, state.endTime! - Date.now());
        setTimeLeft(remaining);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(state.durationLeft);
    }
    return undefined;
  }, [state.status, state.endTime, state.durationLeft]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted = hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    timeLeft,
    formatted,
    hours,
    minutes,
    seconds
  };
}
