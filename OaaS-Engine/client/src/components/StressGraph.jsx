import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StressGraph = () => {
    // Initial mock history
    const [data, setData] = useState([
        { time: '00:00', stress: 20 },
        { time: '00:05', stress: 25 },
        { time: '00:10', stress: 35 },
        { time: '00:15', stress: 30 },
        { time: '00:20', stress: 45 },
    ]);

    const [currentStress, setCurrentStress] = useState(45);
    const [color, setColor] = useState('#ef4444');

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prevData => {
                const lastTime = prevData[prevData.length - 1].time;
                const [min, sec] = lastTime.split(':').map(Number);

                // Increment time
                let newSec = sec + 5;
                let newMin = min;
                if (newSec >= 60) {
                    newSec = 0;
                    newMin += 1;
                }
                const newTime = `${String(newMin).padStart(2, '0')}:${String(newSec).padStart(2, '0')}`;

                // Simulate stress fluctuation
                let change = Math.floor(Math.random() * 20) - 9; // -9 to +10
                let newStress = Math.max(0, Math.min(100, currentStress + change));
                setCurrentStress(newStress);

                const newData = [...prevData, { time: newTime, stress: newStress }];
                // Keep window of last 20 points
                if (newData.length > 20) return newData.slice(newData.length - 20);
                return newData;
            });
        }, 2000); // Update every 2 seconds for effect without being too chaotic

        return () => clearInterval(interval);
    }, [currentStress]);

    // Dynamic color determination
    useEffect(() => {
        if (currentStress < 40) setColor('#22c55e'); // Green
        else if (currentStress < 75) setColor('#eab308'); // Yellow
        else setColor('#ef4444'); // Red
    }, [currentStress]);

    return (
        <div className="h-64 w-full bg-black/80 p-4 rounded-xl shadow-lg border border-gray-800 backdrop-blur-sm relative overflow-hidden">

            {/* Header / Status */}
            <div className="flex justify-between items-center mb-4 z-10 relative">
                <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2 font-mono tracking-wider">
                    <span className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-500`} style={{ backgroundColor: color }}></span>
                    NEURO-LINK COGNITIVE LOAD
                </h4>
                <div className="text-xs font-mono font-bold transition-colors duration-500" style={{ color: color }}>
                    {currentStress}% LOAD
                </div>
            </div>

            {/* Critical Alert Overlay */}
            {currentStress > 85 && (
                <div className="absolute inset-0 z-0 bg-red-500/10 animate-pulse pointer-events-none"></div>
            )}

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.5} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'monospace' }}
                        dy={10}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#000', color: color, borderRadius: '4px', border: `1px solid ${color}` }}
                        itemStyle={{ color: color, fontFamily: 'monospace' }}
                        cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="stress"
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorStress)"
                        animationDuration={1000}
                        isAnimationActive={true}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StressGraph;
