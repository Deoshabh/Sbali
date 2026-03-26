'use client';

import { useEffect, useRef, useState } from 'react';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B2F2F', '#5D4037', '#8D6E63', '#D7CCC8'];

export default function SalesCategoryPieChart({ data }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;

        const updateSize = () => {
            setContainerWidth(el.clientWidth || 0);
        };

        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    const chartData = data && data.length > 0 ? data : [];

    if (!chartData.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Sales by Category</h3>
                <div className="h-[260px] flex items-center justify-center">
                    <p className="text-sm text-gray-400">No category data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Sales by Category</h3>
            <div ref={containerRef} className="h-[260px] min-w-0">
            {containerWidth > 0 ? (
            <ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={0}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
            ) : (
                <div className="h-full w-full" aria-hidden="true" />
            )}
            </div>
        </div>
    );
}
