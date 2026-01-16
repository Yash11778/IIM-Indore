import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const StressGraph = ({ metrics }) => {
    // Generate mock "timeline" data if no real history exists yet
    // In a real scenario, this would come from `session.conversationHistory` timestamps
    const data = [
        { time: '00:05', stress: 20, event: 'Start' },
        { time: '02:10', stress: 25, event: 'Log Check' },
        { time: '05:45', stress: 45, event: 'Root Cause Found' },
        { time: '08:20', stress: 80, event: 'Crisis Spike' }, // The "Stress Test" moment
        { time: '09:15', stress: 65, event: 'Stabilizing' },
        { time: '12:00', stress: 30, event: 'Resolution' },
    ];

    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Neuro-Link Cognitive Load Analysis
            </h4>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        dy={10}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="stress"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorStress)"
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StressGraph;
