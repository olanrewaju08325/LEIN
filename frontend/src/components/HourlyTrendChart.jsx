import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HourlyTrendChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={14} fontWeight={600} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={14} fontWeight={600} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-bright)', borderRadius: 12, fontSize: 16, fontWeight: 700, color: '#fff' }}
        />
        <Line type="monotone" dataKey="medical" stroke="var(--med-blue)" strokeWidth={4} dot={false} isAnimationActive={true} animationDuration={2000} />
        <Line type="monotone" dataKey="fire" stroke="var(--alert-red)" strokeWidth={4} dot={false} isAnimationActive={true} animationDuration={2000} />
        <Line type="monotone" dataKey="security" stroke="var(--premium-gold)" strokeWidth={4} dot={false} isAnimationActive={true} animationDuration={2000} />
        <Line type="monotone" dataKey="accident" stroke="var(--warn-amber)" strokeWidth={4} dot={false} isAnimationActive={true} animationDuration={2000} />
      </LineChart>
    </ResponsiveContainer>
  );
}
