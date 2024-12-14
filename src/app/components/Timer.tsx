'use client';
import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent } from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface TimerProps {
  sessionId: string;
  startTime: string;
  duration: number;
}

interface ExtendOption {
  seconds: number;
  credits: number;
}

const extendOptions: ExtendOption[] = [
  { seconds: 300, credits: 1 },
  { seconds: 600, credits: 2 },
  { seconds: 900, credits: 3 },
];

const Timer = ({ sessionId, startTime, duration }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showExtend, setShowExtend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const remaining = duration - elapsed;
      return Math.max(0, remaining);
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      // Show extend dialog when 60 seconds or less remaining
      if (remaining <= 60 && remaining > 0) {
        setShowExtend(true);
      }
      
      if (remaining <= 0) {
        clearInterval(interval);
        setShowExtend(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleExtend = async (seconds: number) => {
    try {
      const response = await fetch('/api/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          seconds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to extend session');
      }

      const data = await response.json();
      if (data.success) {
        setShowExtend(false);
      } else {
        setError('Failed to extend session');
      }
    } catch (err) {
      setError('Error extending session');
      console.error('Error extending session:', err);
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="relative w-full max-w-md mx-auto mt-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <div className="text-4xl font-bold" aria-live="polite" aria-atomic="true">
          {formatTime(timeLeft)}
        </div>
        <Button 
          onClick={() => setShowExtend(true)} 
          className="!bg-[#5B21B6] !text-white hover:!bg-[#4C1D95] !rounded-full !py-3 !px-8 !text-lg !font-medium transition-colors duration-200"
        >
          Extend Time
        </Button>
      </div>

      <AlertDialog open={showExtend} onOpenChange={setShowExtend}>
        <AlertDialogContent className="bg-white p-4 rounded-[32px] max-w-md">
          <h2 className="text-4xl font-bold text-center text-[#5B21B6] mb-6">
            Extend Call Duration
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {extendOptions.map((option) => (
              <button
                key={option.seconds}
                onClick={() => handleExtend(option.seconds)}
                className="flex flex-col items-center justify-center p-3 rounded-3xl bg-white shadow-lg hover:bg-gray-50 transition-all duration-200 group"
              >
                <div className="text-xl font-bold mb-1">+ {option.seconds / 60}</div>
                <div className="text-lg font-bold mb-2">Minutes</div>
                <div className="text-gray-600 text-base">-{option.credits} credit{option.credits > 1 ? 's' : ''}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowExtend(false)}
            className="w-full bg-[#5B21B6] text-white hover:bg-[#4C1D95] rounded-full py-2.5 px-8 text-xl font-medium transition-colors duration-200"
          >
            Cancel
          </button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Timer;
