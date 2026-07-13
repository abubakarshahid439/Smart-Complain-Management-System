import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx'; // ADD THIS IMPORT

const CountdownTimer = ({ targetDate, className }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference <= 0) {
                setIsExpired(true);
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [targetDate]);

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="bg-white dark:bg-slate-700 rounded-lg px-2 py-1 min-w-[30px] text-center shadow-sm border border-slate-200 dark:border-slate-600">
                <span className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                {label}
            </span>
        </div>
    );

    if (isExpired) {
        return (
            <div className={clsx(
                "flex items-center gap-2 text-sm font-bold text-red-500 dark:text-red-400",
                className
            )}>
                <span>⏰</span>
                <span>Time Expired</span>
            </div>
        );
    }

    return (
        <div className={clsx(
            "flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600",
            className
        )}>
            <TimeUnit value={timeLeft.days} label="Days" />
            <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">:</span>
            <TimeUnit value={timeLeft.hours} label="Hrs" />
            <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">:</span>
            <TimeUnit value={timeLeft.minutes} label="Min" />
            <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">:</span>
            <TimeUnit value={timeLeft.seconds} label="Sec" />
        </div>
    );
};

export default CountdownTimer;