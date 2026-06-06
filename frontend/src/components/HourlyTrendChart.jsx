import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HourlyTrendChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip 
          contentStyle={{ background: '#000', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: '#fff' }}
        />
        <Line type="monotone" dataKey="medical" stroke="var(--med-blue)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={2000} />
        <Line type="monotone" dataKey="fire" stroke="var(--alert-red)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={2000} />
        <Line type="monotone" dataKey="security" stroke="var(--premium-gold)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={2000} />
        <Line type="monotone" dataKey="accident" stroke="var(--warn-amber)" strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={2000} />
      </LineChart>
    </ResponsiveContainer>
  );
}
