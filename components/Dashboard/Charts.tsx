import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { CrimeIncident, RegionStats } from '../../types';
import { CRIME_COLORS } from '../../constants';

interface ChartProps {
  crimes: CrimeIncident[];
  stats: RegionStats[];
}

export const DistrictRiskChart: React.FC<ChartProps> = ({ stats }) => {
  const sortedStats = React.useMemo(
    () => [...stats].sort((a, b) => b.totalCrimes - a.totalCrimes),
    [stats]
  );

  const dynamicHeight = Math.max(300, sortedStats.length * 34);

  return (
    <ResponsiveContainer width="100%" height={dynamicHeight}>
      <BarChart data={sortedStats} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="regionName" 
          type="category" 
          interval={0}
          tick={{ fill: '#94a3b8', fontSize: 12 }} 
          width={150}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
          itemStyle={{ color: '#f8fafc' }}
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
        />
        <Bar 
          dataKey="totalCrimes" 
          fill="#3b82f6" 
          radius={[0, 4, 4, 0]} 
          barSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const CrimeTypeDistribution: React.FC<ChartProps> = ({ crimes }) => {
  const data = React.useMemo(() => {
    const totalCrimes = crimes.length || 1;
    const counts: Record<string, number> = {};
    crimes.forEach(c => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, share: value / totalCrimes }))
      .sort((a, b) => b.share - a.share);
  }, [crimes]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CRIME_COLORS[entry.name as any] || '#fff'} stroke="none" />
          ))}
        </Pie>
        <Tooltip 
           contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
           itemStyle={{ color: '#f8fafc' }}
        />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
